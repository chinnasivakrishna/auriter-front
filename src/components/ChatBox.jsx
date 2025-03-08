import React, { useState } from 'react';
import axios from 'axios';
import './ChatBox.css'; // Create this file for styling

const ChatBox = () => {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewDomain, setInterviewDomain] = useState(null);
  const [userId, setUserId] = useState('user1'); // This should be unique for each user/session

  const handleSend = async () => {
    if (message.trim() === '') return;

    const userMessage = { sender: 'user', text: message };
    setConversation([...conversation, userMessage]);
    setMessage('');
    setLoading(true);

    try {
      let response;
      if (!interviewStarted) {
        // Start the interview
        response = await axios.post('https://auriter-back.onrender.com/startInterview', { userId });
        setInterviewStarted(true);
        setConversation([...conversation, userMessage, { sender: 'ai', text: response.data.message }]);
      } else if (!interviewDomain) {
        // Handle domain selection
        response = await axios.post('https://auriter-back.onrender.com/selectDomain', { userId, domain: message });
        setInterviewDomain(message);
        setConversation([...conversation, userMessage, { sender: 'ai', text: response.data.message }]);
      } else {
        // Ask question
        response = await axios.post('https://auriter-back.onrender.com/askQuestion', { userId, question: message });
        setConversation([...conversation, userMessage, { sender: 'ai', text: response.data.answer }]);
      }
    } catch (error) {
      const aiError = { sender: 'ai', text: 'Error getting response from AI' };
      setConversation([...conversation, userMessage, aiError]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <h2 className='ChatBox-Logo'>Chat With AI Recruter</h2>
      <div className="chat-window">
        {conversation.map((msg, index) => (
          <div
            key={index}
            className={`chat-bubble ${msg.sender === 'user' ? 'user-bubble' : 'ai-bubble'}`}
          >
            {msg.text}
          </div>
        ))}
        {loading && <div className="loading">AI is typing...</div>}
      </div>

      <div className="input-container">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={interviewStarted && !interviewDomain ? "Enter your domain..." : "Type your message..."}
          className="chat-input"
        />
        <button onClick={handleSend} className="send-btn">Send</button>
      </div>
    </div>
  );
};

export default ChatBox;
