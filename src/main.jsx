import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HMSRoomProvider } from '@100mslive/react-sdk'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HMSRoomProvider>
      <App />
    </HMSRoomProvider>
  </StrictMode>,
)
