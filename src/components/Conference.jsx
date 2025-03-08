import React from 'react';
import { useHMSStore, selectPeers } from '@100mslive/react-sdk';
import Peer from './Peer';

const Conference = () => {
  const peers = useHMSStore(selectPeers);

  return (
    <div className='conference-section'>
      <div className="peers-container">
        {peers.map((peer) => (
          <Peer key={peer.id} peer={peer} />
        ))}
      </div>
    </div>
  );
};

export default Conference;
