import React, { useEffect } from 'react';
import './App.css';
import JoinForm from './components/JoinForm';
import { selectIsConnectedToRoom, useHMSActions, useHMSStore } from '@100mslive/react-sdk';
import Conference from './components/Conference';
import Footer from './components/Footer';
import Mic from './components/Mic';
import ChatBox from './components/ChatBox';
import Nav from './components/Nav';

function App() {
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const hmsActions = useHMSActions();

  useEffect(() => {
    if (isConnected) {
      return () => {
        hmsActions.leave();
      };
    }
  }, [isConnected, hmsActions]);

  return (
    <div className="container">
      <Nav/>
      <div className='App'>
      <div className="middle">
        {isConnected ? (
        <div className='video-foter'>
          <Conference />
          <Footer/>
        </div>
      ) : (
        <JoinForm />
      )}
      </div>
      <div className="left">
        <Mic/>
      </div>
      <div className="right">
        <ChatBox/>
      </div>
    </div>
    </div>
  );
}

export default App;