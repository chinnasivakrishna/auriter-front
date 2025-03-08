import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const InterviewCheck = ({ onStartInterview }) => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [interviewTime, setInterviewTime] = useState(null);
  const [isInterviewActive, setIsInterviewActive] = useState(false);

  useEffect(() => {
    const fetchInterviewDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/interview/details/${roomId}`);
        const { date, time } = response.data;

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
  }, [roomId]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-xl">Loading interview details...</div>
      </div>
    );
  }

  if (!isInterviewActive) {
    return (
      <div className="w-full h-screen p-8 bg-gray-100">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4">Interview Not Active</h1>
          <p className="text-lg">Your interview is scheduled for: </p>
          <p className="text-xl font-semibold">{interviewTime?.toLocaleString()}</p>
          <p className="mt-4">Please return at the scheduled time to begin your interview.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen p-8 bg-gray-100 flex items-center justify-center">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Ready for Your Interview</h1>
        <p className="mb-6">
          You're about to start an AI-powered mock interview. The system will ask you questions
          and record your responses for analysis.
        </p>
        <p className="mb-8 text-sm text-gray-600">
          Make sure you're in a quiet environment and your camera and microphone are working properly.
        </p>
        <button 
          onClick={onStartInterview}
          className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-lg"
        >
          Start Interview
        </button>
      </div>
    </div>
  );
};

export default InterviewCheck;