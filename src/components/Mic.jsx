import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';

import './Mic.css';

function Mic() {
  const [micActive, setMicActive] = useState(false);
  const [audioStream, setAudioStream] = useState(null);

  // Function to start capturing audio
  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  // Function to stop capturing audio
  const stopMic = () => {
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
    }
  };

  // Toggle the mic state on button click
  const toggleMic = () => {
    setMicActive(!micActive);
  };

  // Start or stop mic based on micActive state
  useEffect(() => {
    if (micActive) {
      startMic();
    } else {
      stopMic();
    }

    // Cleanup when the component is unmounted
    return () => {
      stopMic();
    };
  }, [micActive]);

  return (
    <div className="Mic">
      <button className="Mic-buton" onClick={toggleMic}>
        <FontAwesomeIcon
          className={`Mic-icon ${micActive ? 'active' : ''}`}
          icon={micActive ? faMicrophone : faMicrophoneSlash}
          style={{ color: micActive ? 'red' : '#ffffff' }}
        />
        <div className="black1"></div>
        {micActive && <div className="circle-animation"></div>}
        {micActive && <div className="circle-animation2"></div>}
        {micActive && <div className="circle-animation3"></div>}
        <div className="black2"></div>
      </button>
    </div>
  );
}

export default Mic;


//5b2c5d6ccef8a8914bf82e683af224c4a5d04676 DEEPGRAM API KEY