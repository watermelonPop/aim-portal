import './App.css';
import { useEffect } from 'react';
import logo from './logo.png';

function LoginScreen({ setLoggedIn, setUserType, setStaffRoles }) {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const idToken = urlParams.get('token');
    
    if (idToken) {
      verifyToken(idToken);
      // Remove the token from the URL for security
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await fetch('/api/verifyToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
  
      const data = await response.json();
      if (data.valid) {
        console.log('User verified:', data);
        let exists = userExists(data.email);
        if(exists.exists == true){
          setUserType(exists.user_info.user_role);
          if(exists.user_info.user_role == "Staff"){
            let staffRole = getStaffRoles(exists.user_info.user_id);
            setStaffRoles(staffRole);
          }
        }
        setLoggedIn(true);
      } else {
        console.error('Invalid token:', data.error);
      }
    } catch (error) {
      console.error('Error verifying token:', error);
    }
  };

  const getStaffRoles = async (userId) => {
    try {
      const response = await fetch(`/api/getStaffRole?user_id=${userId}`);
      const text = await response.text();
      console.log('Response:', text);
      if (response.ok) {
        const data = JSON.parse(text);
        return data.role;
      } else {
        console.error('Failed', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error while getting staff roles:', error);
    }
  };

  const userExists = async (email) => {
    try {
      const response = await fetch('/api/checkAccount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking exists', error);
    }
  };

  const startLogin = async () => {
    try {
      const response = await fetch("/api/auth");
      const text = await response.text();
      console.log('Response:', text);
      if (response.ok) {
        const data = JSON.parse(text);
        window.location.href = data.authUrl;
      } else {
        console.error('Failed to start login process', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  return (
    <main className='loginScreen'>
      <header className='loginHeader' role="heading">
        <img src={logo} alt="TAMU Logo" className='logoImg'/>
        <h1 className='loginTitle'>AIM Portal</h1>
      </header>
      <button type="button" id="loginBtn" aria-label="log in" onClick={startLogin}>log in</button>
    </main>
  );
}

export default LoginScreen;
