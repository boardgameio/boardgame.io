import React, { useState } from 'react';

const Chat = ({ onSend, messages }) => {
  const [message, setMessage] = useState('');

  const onChange = event => {
    setMessage(event.target.value);
  };

  const triggerSend = () => {
    onSend(message);
  };

  return (
    <div>
      <div
        style={{ height: 200, overflow: 'scroll', border: '1px solid black' }}
      >
        {messages.map((message, index) => (
          <div key={index}>
            <div>{message.sender}</div>
            <div>{JSON.stringify(message.payload)}</div>
          </div>
        ))}
      </div>
      <input onChange={onChange} value={message} />
      <button onClick={triggerSend}>Send</button>
    </div>
  );
};

export default Chat;
