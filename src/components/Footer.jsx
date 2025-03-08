import { useAVToggle } from '@100mslive/react-sdk';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faMicrophoneSlash, faVideo, faVideoSlash } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import './Footer.css'

const Footer = () => {
    const {
        isLocalAudioEnabled,
        toggleAudio,
        isLocalVideoEnabled,
        toggleVideo
    } = useAVToggle();  // Use the hook as a function

    return (
        <div className='control-bar'>
            <button 
            className={`btn-control ${isLocalAudioEnabled ? 'audio-on' : 'audio-off'}`} 
            onClick={toggleAudio}>{isLocalAudioEnabled ? <FontAwesomeIcon icon={faMicrophone} />  : <FontAwesomeIcon icon={faMicrophoneSlash} />}
            </button>&ensp;
            <button 
            className={`btn-control ${isLocalVideoEnabled ? 'video-on' : 'video-off'}`} 
            onClick={toggleVideo}>{isLocalVideoEnabled ?  <FontAwesomeIcon icon={faVideo} /> : <FontAwesomeIcon icon={faVideoSlash} />}
            </button>

        </div>
    );
}

export default Footer;
