import './App.css';
import { useEffect, useState } from 'react';

function Alert({ message }) {
  // Split the message by newline characters and map each line to a <p> element
  const messageLines = message.split('\n').map((line, index) => (
    <p key={index} className='alertTxt'>{line}</p>
  ));

  return (
    <div role="alert" className='alertDiv'>
      {messageLines}
    </div>
  );
}

export default Alert;