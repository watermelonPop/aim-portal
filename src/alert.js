
import { useEffect, useState, useRef, useLayoutEffect } from 'react';

function Alert({ message, setShowAlert }) {
  // Split the message by newline characters and map each line to a <p> element
  const closeButtonRef = useRef(null);
  
  useEffect(() => {
    // Ensures the DOM is fully painted before trying to focus
    const raf = requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const messageLines = message.split('\n').map((line, index) => (
    <p key={index} className='alertTxt'>{line}</p>
  ));

  return (
    <div role="alert" className='alertDiv' data-testid='alert'>
      <div>
        <button ref={closeButtonRef} onClick={() => setShowAlert(false)} data-testid='alert-close'>x</button>
      </div>
      {messageLines}
    </div>
  );
}

export default Alert;