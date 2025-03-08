import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Line, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import {
  useHMSActions,
  useHMSStore,
  selectIsConnectedToRoom,
  selectLocalPeer,
  selectPeers,
  useVideo
} from '@100mslive/react-sdk';
Chart.register(...registerables);

const InterviewRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userResponse, setUserResponse] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [interviewTime, setInterviewTime] = useState(null);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [responses, setResponses] = useState([]);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [remainingTime, setRemainingTime] = useState(120); // 2 minutes per question
  const [timerActive, setTimerActive] = useState(false);
  
  const webSocketRef = useRef(null);
  const speechWebSocketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(new Audio());
  const localVideoRef = useRef(null);
  const containerRef = useRef(null);
  const timerRef = useRef(null);

  const hmsActions = useHMSActions();
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const localPeer = useHMSStore(selectLocalPeer);
  const peers = useHMSStore(selectPeers);

  useEffect(() => {
    // Check browser compatibility
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Your browser does not support the required features for this interview. Please use a modern browser like Chrome, Firefox, or Edge.');
    }
  }, []);

  // Add this effect to verify the video element after UI updates
useEffect(() => {
  if (interviewStarted) {
    // Log whether the video element exists
    console.log('After interview UI mounted, video element exists:', !!localVideoRef.current);
    
    // If DOM has updated but ref still doesn't exist, there might be an issue with how the ref is attached
    if (!localVideoRef.current) {
      console.error('Video element not available after UI update. This indicates a potential issue with the ref.');
    }
  }
}, [interviewStarted]);

  // Add this to help debug the issue
useEffect(() => {
  console.log('State change:', {
    interviewStarted,
    permissionsGranted,
    localVideoRefExists: !!localVideoRef.current
  });
}, [interviewStarted, permissionsGranted]);

useEffect(() => {
  console.log('localVideoRef initialized:', !!localVideoRef.current);
}, []);

  // Add a check to confirm the video element is in the DOM
useEffect(() => {
  console.log('Video element check:', {
    refExists: !!localVideoRef.current,
    videoElementsInDOM: document.querySelectorAll('video').length
  });
}, [interviewStarted, permissionsGranted]);

  useEffect(() => {
    const fetchInterviewDetails = async () => {
      try {
        console.log('Fetching interview details...');
        const response = await axios.get(`http://localhost:5000/api/interview/details/${roomId}`);
        const { date, time, jobTitle, document } = response.data;
  
        const interviewDateTime = new Date(`${date}T${time}`);
        setInterviewTime(interviewDateTime);
  
        const currentTime = new Date();
        if (currentTime >= interviewDateTime) {
          setIsInterviewActive(true);
        } else {
          setIsInterviewActive(false);
        }
      } catch (error) {
        console.error('Error fetching interview details:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchInterviewDetails();
    
    return () => {
      if (isConnected) {
        hmsActions.leave();
      }
      if (webSocketRef.current) {
        webSocketRef.current.close();
      }
      if (speechWebSocketRef.current) {
        speechWebSocketRef.current.close();
      }
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.src = '';
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    };
  }, [roomId, hmsActions]);

  // Timer effect
  useEffect(() => {
    if (timerActive && remainingTime > 0) {
      timerRef.current = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (remainingTime <= 0) {
      setTimerActive(false);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, remainingTime]);

  // Setup video stream once permissions are granted
  useEffect(() => {
    if (permissionsGranted && localVideoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          localVideoRef.current.srcObject = stream;
        })
        .catch(err => console.error("Error accessing media devices:", err));
    }
  }, [permissionsGranted]);

  const requestPermissions = async () => {
    try {
      console.log('Requesting camera and microphone permissions...');
      
      // Check if video element exists
      if (!localVideoRef.current) {
        console.error('Video element reference not found');
        // Wait a bit to see if it becomes available
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check again
        if (!localVideoRef.current) {
          alert('Video element not found. Please refresh and try again.');
          return false;
        }
      }
      
      // Request media access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 },
        audio: true 
      });
      
      // Now set the stream
      localVideoRef.current.srcObject = stream;
      
      try {
        await localVideoRef.current.play();
        console.log('Video playback started');
      } catch (playError) {
        console.error('Error playing video:', playError);
        
        // Some browsers require user interaction to play media
        alert('Please click OK to start your camera');
        try {
          await localVideoRef.current.play();
        } catch (e) {
          console.error('Failed to play video after user interaction:', e);
          return false;
        }
      }
      
      setPermissionsGranted(true);
      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      alert('Camera access was denied. Please grant camera and microphone permissions.');
      return false;
    }
  };

  const checkDeviceAvailability = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some(device => device.kind === 'videoinput');
      const hasMicrophone = devices.some(device => device.kind === 'audioinput');
  
      if (!hasCamera || !hasMicrophone) {
        alert('Your device does not have a camera or microphone. Please ensure your device has the necessary hardware.');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error enumerating devices:', error);
      alert('An error occurred while checking for camera and microphone availability.');
      return false;
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
        setIsFullScreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  const setupWebSockets = () => {
    console.log('Setting up WebSocket connections...');
    
    // WebSocket for transcription
    webSocketRef.current = new WebSocket(`ws://localhost:5000/ws/transcribe?language=en`);
    
    webSocketRef.current.onopen = () => {
      console.log('Transcription WebSocket connected');
    };
    
    webSocketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'transcript' && data.data.trim()) {
        console.log('Received transcript:', data.data);
        setTranscript(data.data);
        setUserResponse(prev => prev + ' ' + data.data);
      }
    };
    
    webSocketRef.current.onerror = (error) => {
      console.error('Transcription WebSocket error:', error);
    };
    
    webSocketRef.current.onclose = () => {
      console.log('Transcription WebSocket closed');
    };
  
    // WebSocket for speech synthesis
    speechWebSocketRef.current = new WebSocket('ws://localhost:5000/ws/speech');
    
    speechWebSocketRef.current.onopen = () => {
      console.log('Speech WebSocket connected');
    };
    
    speechWebSocketRef.current.onerror = (error) => {
      console.error('Speech WebSocket error:', error);
    };
    
    speechWebSocketRef.current.onclose = () => {
      console.log('Speech WebSocket closed');
    };
  };

  // Modify your startInterview function
const startInterview = async () => {
  console.log('Starting interview...');
  
  const devicesAvailable = await checkDeviceAvailability();
  if (!devicesAvailable) return;

  // First set the interview state to true so the UI renders with the video element
  setInterviewStarted(true);
  
  // Then use a timeout to allow the UI to update before requesting permissions
  setTimeout(async () => {
    // Now the video element should exist in the DOM
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) {
      // If permissions fail, revert back to start screen
      setInterviewStarted(false);
      return;
    }
    
    setupWebSockets();
    await fetchQuestions();
    toggleFullScreen();
  }, 1000); // Give the DOM time to update
};

  const fetchQuestions = async () => {
    try {
      console.log('Fetching interview questions...');
      const response = await axios.get(`http://localhost:5000/api/interview/questions/${roomId}`);
      setQuestions(response.data.questions);
      
      setResponses(response.data.questions.map(() => ''));
      
      setTimeout(() => {
        speakQuestion(response.data.questions[0]);
      }, 2000);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const speakQuestion = (question) => {
    if (!speechWebSocketRef.current || speechWebSocketRef.current.readyState !== WebSocket.OPEN) {
      console.error('Speech WebSocket not ready');
      return;
    }
  
    console.log('Sending question to LMNT for synthesis:', question);
    setIsSpeaking(true);
    setAiSpeaking(true);
    
    // Reset the audio player and clear previous chunks
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.src = '';
    }
    const audioChunks = [];
    
    speechWebSocketRef.current.send(JSON.stringify({
      text: question,
      voice: 'lily',
      language: 'en',
      speed: 1.0
    }));
    
    speechWebSocketRef.current.onmessage = (event) => {
      if (typeof event.data === 'string') {
        const data = JSON.parse(event.data);
        if (data.type === 'end') {
          console.log('Speech synthesis complete');
          
          // Concatenate all audio chunks into a single Blob
          const combinedBlob = new Blob(audioChunks, { type: 'audio/mp3' });
          const url = URL.createObjectURL(combinedBlob);
          
          // Play the combined audio
          audioPlayerRef.current.src = url;
          audioPlayerRef.current.play().then(() => {
            console.log('Audio playback started');
          }).catch((error) => {
            console.error('Error playing audio:', error);
          });
          
          setIsSpeaking(false);
          setAiSpeaking(false);
          
          setTimeout(() => {
            if (!isRecording) {
              startRecording();
            }
          }, 1000);
        } else if (data.type === 'error') {
          console.error('Speech synthesis error:', data.error);
          setIsSpeaking(false);
          setAiSpeaking(false);
        }
      } else {
        console.log('Received audio chunk:', event.data);
        audioChunks.push(event.data); // Store the audio chunk
      }
    };
  };

  const startRecording = async () => {
    try {
      console.log('Starting audio recording...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          
          if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
            const reader = new FileReader();
            reader.onload = () => {
              webSocketRef.current.send(reader.result);
            };
            reader.readAsArrayBuffer(event.data);
          }
        }
      };
      
      mediaRecorderRef.current.start(250);
      setIsRecording(true);
      setRemainingTime(120); // Reset timer to 2 minutes
      setTimerActive(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      console.log('Stopping audio recording...');
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setTimerActive(false);
    }
  };

  const handleNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    
    if (isRecording) {
      stopRecording();
    }
    
    const updatedResponses = [...responses];
    updatedResponses[currentQuestionIndex] = userResponse;
    setResponses(updatedResponses);
    
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setUserResponse('');
      setTranscript('');
      
      // Re-establish WebSocket connections for transcription and speech
      console.log('Re-establishing WebSocket connections for next question...');
      setupWebSockets();
      
      // Add a delay before speaking the next question
      setTimeout(() => {
        speakQuestion(questions[nextIndex]);
      }, 1000); // 1-second delay to ensure WebSocket is ready
    } else {
      submitAllResponses(updatedResponses);
    }
  };

  const submitAllResponses = async (finalResponses) => {
    try {
      console.log('Submitting all responses...');
      const submitPromises = questions.map((question, index) => {
        return axios.post(`http://localhost:5000/api/interview/response/${roomId}`, {
          question,
          response: finalResponses[index]
        });
      });
      
      await Promise.all(submitPromises);
      
      analyzeResponses(finalResponses);
    } catch (error) {
      console.error('Error submitting responses:', error);
    }
  };

  const analyzeResponses = async (finalResponses) => {
    try {
      console.log('Analyzing responses...');
      const response = await axios.post('http://localhost:5000/api/interview/analyze', {
        roomId,
        questions,
        answers: finalResponses
      });
      console.log(response.data.analysis);
      setAnalysis(response.data.analysis);
      // Exit fullscreen when showing results
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    } catch (error) {
      console.error('Error analyzing responses:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="mb-4">
            <svg className="w-12 h-12 mx-auto text-blue-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <div className="text-xl text-white font-semibold">Loading your interview environment...</div>
          <p className="text-blue-300 mt-2">Preparing your AI interviewer</p>
        </div>
      </div>
    );
  }

  if (!isInterviewActive) {
    return (
      <div className="w-full h-screen p-8 bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl p-8 transform transition-all">
          <div className="flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">Interview Not Active Yet</h1>
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-lg text-center">Your interview is scheduled for:</p>
            <p className="text-2xl font-semibold text-center text-blue-700 my-2">
              {interviewTime?.toLocaleString()}
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center p-3 border-l-4 border-blue-500 bg-blue-50 rounded-r-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <p>Find a quiet place with good lighting and minimal distractions</p>
            </div>
            <div className="flex items-center p-3 border-l-4 border-blue-500 bg-blue-50 rounded-r-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Test your camera and microphone before the interview</p>
            </div>
            <div className="flex items-center p-3 border-l-4 border-blue-500 bg-blue-50 rounded-r-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Return to this page at the scheduled time to begin</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (analysis) {
    // Ensure analysis.questions and analysis.overallScores exist
    const { overallScores, feedback, focusAreas } = analysis;

  // Prepare pie chart data for Self Introduction
  const selfIntroductionPieData = {
    labels: ['Score', 'Remaining'],
    datasets: [
      {
        data: [overallScores.selfIntroduction, 10 - overallScores.selfIntroduction],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)', // Blue
          'rgba(229, 231, 235, 0.3)', // Light Gray
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(229, 231, 235, 0)',
        ],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  // Prepare pie chart data for Project Explanation
  const projectExplanationPieData = {
    labels: ['Score', 'Remaining'],
    datasets: [
      {
        data: [overallScores.projectExplanation, 10 - overallScores.projectExplanation],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)', // Green
          'rgba(229, 231, 235, 0.3)', // Light Gray
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(229, 231, 235, 0)',
        ],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  // Prepare pie chart data for English Communication
  const englishCommunicationPieData = {
    labels: ['Score', 'Remaining'],
    datasets: [
      {
        data: [overallScores.englishCommunication, 10 - overallScores.englishCommunication],
        backgroundColor: [
          'rgba(139, 92, 246, 0.8)', // Purple
          'rgba(229, 231, 235, 0.3)', // Light Gray
        ],
        borderColor: [
          'rgba(139, 92, 246, 1)',
          'rgba(229, 231, 235, 0)',
        ],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  // Chart options for donut effect
  const chartOptions = {
    cutout: '75%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false
      }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header Card with Glassmorphism Effect */}
        <div className="mb-8 bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden transform hover:scale-[1.01] transition-all duration-300">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold tracking-tight">Interview Analysis</h1>
              <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-4 py-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Analysis Complete</span>
              </div>
            </div>
            <p className="mt-2 opacity-90 text-lg">Here's an in-depth evaluation of your interview performance</p>
          </div>
        </div>

        {/* Performance Score Cards with Pie Charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Self Introduction Score Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:translate-y-[-5px] transition-all duration-300">
            <div className="h-4 bg-blue-500"></div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Self Introduction</h3>
              <div className="h-48 relative flex items-center justify-center">
                <Pie data={selfIntroductionPieData} options={chartOptions} />
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-3xl font-bold text-blue-600">{overallScores.selfIntroduction}</span>
                  <span className="text-sm text-gray-500">out of 10</span>
                </div>
              </div>
              <div className="mt-4 bg-blue-50 rounded-lg p-3">
                <p className="text-blue-800 text-sm">
                  {overallScores.selfIntroduction >= 8 ? 'Excellent presentation of your background and skills!' : 
                   overallScores.selfIntroduction >= 6 ? 'Good introduction with room for improvement.' : 
                   'Needs significant improvement in how you present yourself.'}
                </p>
              </div>
            </div>
          </div>

          {/* Project Explanation Score Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:translate-y-[-5px] transition-all duration-300">
            <div className="h-4 bg-green-500"></div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Project Explanation</h3>
              <div className="h-48 relative flex items-center justify-center">
                <Pie data={projectExplanationPieData} options={chartOptions} />
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-3xl font-bold text-green-600">{overallScores.projectExplanation}</span>
                  <span className="text-sm text-gray-500">out of 10</span>
                </div>
              </div>
              <div className="mt-4 bg-green-50 rounded-lg p-3">
                <p className="text-green-800 text-sm">
                  {overallScores.projectExplanation >= 8 ? 'Exceptional project explanations with clear technical details!' : 
                   overallScores.projectExplanation >= 6 ? 'Solid technical explanations that could be more detailed.' : 
                   'Technical explanations need more clarity and depth.'}
                </p>
              </div>
            </div>
          </div>

          {/* English Communication Score Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:translate-y-[-5px] transition-all duration-300">
            <div className="h-4 bg-purple-500"></div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">English Communication</h3>
              <div className="h-48 relative flex items-center justify-center">
                <Pie data={englishCommunicationPieData} options={chartOptions} />
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-3xl font-bold text-purple-600">{overallScores.englishCommunication}</span>
                  <span className="text-sm text-gray-500">out of 10</span>
                </div>
              </div>
              <div className="mt-4 bg-purple-50 rounded-lg p-3">
                <p className="text-purple-800 text-sm">
                  {overallScores.englishCommunication >= 8 ? 'Outstanding fluency and communication skills!' : 
                   overallScores.englishCommunication >= 6 ? 'Good language skills with minor areas to improve.' : 
                   'Communication skills need significant enhancement.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Feedback */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Detailed Performance Feedback
          </h2>
          
          <div className="space-y-6">
            {Object.entries(feedback).map(([category, details]) => {
              // Convert category from camelCase to Title Case for display
              const displayCategory = category
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase());
                
              // Determine category color and icon
              let categoryData = {
                color: 'blue',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )
              };
              
              if (category === 'projectExplanation') {
                categoryData = {
                  color: 'green',
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  )
                };
              } else if (category === 'englishCommunication') {
                categoryData = {
                  color: 'purple',
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  )
                };
              }
              
              return (
                <div key={category} className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:shadow-xl transition-all duration-300">
                  <div className={`bg-gradient-to-r from-${categoryData.color}-500 to-${categoryData.color}-600 p-4 text-white flex items-center`}>
                    <div className="bg-white bg-opacity-20 rounded-full p-2 mr-3">
                      {categoryData.icon}
                    </div>
                    <h3 className="text-xl font-semibold">
                      {displayCategory} <span className="ml-2 text-md font-normal bg-white bg-opacity-20 px-2 py-1 rounded-full">Score: {overallScores[category]}/10</span>
                    </h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className={`bg-${categoryData.color}-50 rounded-xl p-5 border border-${categoryData.color}-100 transform transition-all duration-300 hover:shadow-md`}>
                        <div className="flex items-center mb-3">
                          <div className={`bg-${categoryData.color}-100 rounded-full p-2 mr-3`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-${categoryData.color}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <h4 className={`font-semibold text-${categoryData.color}-800 text-lg`}>Key Strengths</h4>
                        </div>
                        <p className={`text-${categoryData.color}-800 leading-relaxed`}>{details.strengths}</p>
                      </div>

                      <div className="bg-amber-50 rounded-xl p-5 border border-amber-100 transform transition-all duration-300 hover:shadow-md">
                        <div className="flex items-center mb-3">
                          <div className="bg-amber-100 rounded-full p-2 mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                          <h4 className="font-semibold text-amber-800 text-lg">Growth Opportunities</h4>
                        </div>
                        <p className="text-amber-800 leading-relaxed">{details.areasOfImprovement}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Focus Areas with Animated Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Priority Focus Areas
          </h2>
          <div className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-2xl shadow-lg p-6">
            <div className="space-y-4">
              {focusAreas.map((area, index) => (
                <div key={index} className="flex items-start group">
                  <div className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0 mt-1 shadow-md transform group-hover:scale-110 transition-all duration-300">
                    {index + 1}
                  </div>
                  <div className="ml-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 flex-grow border border-blue-100 shadow-sm transform group-hover:translate-x-1 transition-all duration-300">
                    <p className="text-indigo-900 font-medium text-lg">{area}</p>
                    <div className="w-full h-1 bg-gradient-to-r from-indigo-300 to-blue-300 rounded-full mt-3 transform origin-left scale-0 group-hover:scale-100 transition-transform duration-500"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button className="flex-1 group bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-4 px-8 rounded-xl shadow-lg transform hover:translate-y-[-2px] transition-all duration-300 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 transform group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-lg font-medium">Return to Dashboard</span>
          </button>
          
          <button className="flex-1 group bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white py-4 px-8 rounded-xl shadow-lg transform hover:translate-y-[-2px] transition-all duration-300 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 transform group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span className="text-lg font-medium">Download Report (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
  }

  return (
    <div 
      ref={containerRef}
      className="w-full h-screen bg-gray-900 text-white flex flex-col"
    >
      {interviewStarted ? (
        <>
          {/* Interview Session UI */}
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-gray-800 p-4 flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-red-500 h-4 w-4 rounded-full animate-pulse mr-2"></div>
                <span className="font-medium">Interview in Progress</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-md ${timerActive ? 'bg-blue-600' : 'bg-gray-700'}`}>
                  <span className="font-mono">{formatTime(remainingTime)}</span>
                </div>
                <button
                  onClick={toggleFullScreen}
                  className="text-gray-300 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col md:flex-row p-4 overflow-hidden">
              {/* Video Feed */}
              <div className="md:w-2/3 pr-0 md:pr-4 mb-4 md:mb-0">
                <div className="bg-black rounded-lg h-full flex flex-col overflow-hidden">
                  <div className="relative flex-1 flex items-center justify-center">
                  {/* Modify your video element */}
                  <video 
    ref={localVideoRef}
    autoPlay 
    playsInline
    muted
    className="w-full h-full object-cover"
    style={{ transform: 'scaleX(-1)' }} 
  />
                    
                    {aiSpeaking && (
                      <div className="absolute bottom-4 left-4 bg-blue-600 p-2 rounded-lg shadow-lg flex items-center">
                        <div className="relative mr-2">
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                          </div>
                          <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-400"></span>
                          </span>
                        </div>
                        <span>AI Interviewer Speaking...</span>
                      </div>
                    )}
                    
                    {isRecording && (
                      <div className="absolute bottom-4 right-4 bg-red-600 p-2 rounded-lg shadow-lg flex items-center">
                        <div className="relative mr-2">
                          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                          </div>
                          <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-400"></span>
                          </span>
                        </div>
                        <span>Recording Your Answer...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Question and Transcript */}
              <div className="md:w-1/3 flex flex-col space-y-4">
                {/* Current Question */}
                <div className="bg-gray-800 rounded-lg p-4 flex-shrink-0">
                  <h3 className="text-lg font-medium text-gray-300">Question {currentQuestionIndex + 1} of {questions.length}</h3>
                  <p className="text-xl mt-2">{questions[currentQuestionIndex]}</p>
                </div>
                
                {/* Live Transcript */}
                <div className="bg-gray-800 rounded-lg p-4 flex-1 overflow-y-auto">
                  <h3 className="text-lg font-medium text-gray-300 mb-2">
                    Your Response
                    <span className="text-sm font-normal ml-2 text-gray-400">(Live Transcript)</span>
                  </h3>
                  <div className="h-full overflow-y-auto">
                    <p className="text-white whitespace-pre-wrap">{userResponse}</p>
                    {isRecording && transcript && (
                      <p className="text-blue-400 italic animate-pulse">{transcript}</p>
                    )}
                  </div>
                </div>
                
                {/* Controls */}
                <div className="bg-gray-800 rounded-lg p-4 flex-shrink-0">
                  {isRecording ? (
                    <button
                      onClick={stopRecording}
                      className="w-full bg-red-600 hover:bg-red-700 py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                      </svg>
                      Stop Recording
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="w-full bg-blue-600 hover:bg-blue-700 py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center"
                    >
                      {currentQuestionIndex < questions.length - 1 ? (
                        <>
                          <span>Next Question</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </>
                      ) : (
                        <>
                          <span>Finish Interview</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Interview Intro/Start Screen */}
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="max-w-3xl w-full bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
                <h1 className="text-3xl font-bold text-white">Welcome to Your AI Interview</h1>
                <p className="text-blue-100 mt-2">Your AI interviewer is ready to begin when you are</p>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h2 className="text-xl font-semibold mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    How it Works
                  </h2>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start">
                      <div className="bg-blue-500 rounded-full p-1 mr-3 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      You'll be asked a series of interview questions by our AI interviewer
                    </li>
                    <li className="flex items-start">
                      <div className="bg-blue-500 rounded-full p-1 mr-3 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      Your answers will be recorded and transcribed in real-time
                    </li>
                    <li className="flex items-start">
                      <div className="bg-blue-500 rounded-full p-1 mr-3 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      At the end, you'll receive feedback and analysis of your performance
                    </li>
                  </ul>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={startInterview}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 px-6 rounded-lg text-white font-medium transition-all transform hover:scale-105 flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Start Interview
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 px-6 rounded-lg text-white font-medium transition-all transform hover:scale-105 flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-900 p-4 text-center text-gray-400 text-sm">
                Make sure you're in a quiet place with good lighting and a stable internet connection
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InterviewRoom;