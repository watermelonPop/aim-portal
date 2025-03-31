import './App.css';
import { useEffect, useState } from 'react';

function Alert({ message, setShowAlert }) {
  // Split the message by newline characters and map each line to a <p> element
  const messageLines = message.split('\n').map((line, index) => (
    <p key={index} className='alertTxt'>{line}</p>
  ));

  return (
    <div role="alert" className='alertDiv' data-testid='alert'>
      <div>
        <button onClick={() => setShowAlert(false)} data-testid='alert-close'>x</button>
      </div>
      {messageLines}
    </div>
  );
}

export default Alert;