import './App.css';
import { useEffect, useState } from 'react';
import logo from './logo.png';

export function LoginScreen({ setUserId, setSettings, loggedIn, setLoggedIn, setUserType, setStaffRoles, setUserInfo }) {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (loggedIn) {
      setLoading(false);
    }
  }, [loggedIn]);
  const userExists = async (email) => {
    console.log("Checking account for email:", email); // Debug log
  
    try {
      const response = await fetch('/api/checkAccount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
  
      const data = await response.json();
      console.log("Response from /api/checkAccount:", data); // Debug log
      return data;
    } catch (error) {
      console.error('Error checking exists', error);
    }
  };

  useEffect(() => {
    console.log('useEffect running');
    const urlParams = new URLSearchParams(window.location.search);
    const idToken = urlParams.get('token');
    
    if (idToken) {
      console.log('Calling verifyToken');
      verifyToken(idToken, setUserId, setSettings, loggedIn, setLoggedIn, setUserType, setStaffRoles, setLoading, setUserInfo);
      // Remove the token from the URL for security
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const verifyToken = async (token, setUserId, setSettings, loggedIn, setLoggedIn, setUserType, setStaffRoles, setLoading, setUserInfo) => {
    console.log("VERIFY TOKEN CALLED");
    try {
      const response = await fetch('/api/verifyToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      console.log("DATA HERE: ");
      console.log(data);
      if (data.valid) {
        setLoading(true);
        console.log('User verified:', data);
        setUserInfo(data.payload);
        let exists = await userExists(data.email);
        if(exists.exists === true){
          setUserType(exists.user_info.user_role);
          setUserId(exists.user_info.user_id);
          if(exists.user_info.user_role === "Advisor"){   //CHANGE TO ADVISOR
            let staffRole = await getStaffRoles(exists.user_info.user_id);
            setStaffRoles(staffRole);
          }
          getUserSettings(exists.user_info.user_id, setSettings);
        }else{
          console.log("DOES NOT EXIST");
          if (localStorage.getItem("aim-settings") !== null) {
              console.log("LOCAL STORAGE EXISTS:", localStorage.getItem("aim-settings")); // Logs as a string
              const parsedSettings = JSON.parse(localStorage.getItem("aim-settings")); // Convert back to object
              setSettings(parsedSettings); // Set state with the parsed object
          }
        }
        setLoggedIn(true);
        return data;
      } else {
        console.error('Invalid token:', data.error);
        window.location.href = "/";
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      window.location.href = "/";
    }
  };
  

  const getStaffRoles = async (userId) => {
    try {
      const response = await fetch(`/api/getStaffRole?user_id=${userId}`);
      const text = await response.text();
      console.log('Response:', text);
      if (response.ok) {
        const data = JSON.parse(text);
        if(data.role){
          return data.role;
        }
      } else {
        console.error('Failed', response.status, response.statusText);
        window.location.href = "/";
      }
    } catch (error) {
      console.error('Error while getting staff roles:', error);
      window.location.href = "/";
    }
  };

  const startLogin = async () => {
      try {
          const response = await fetch("/api/auth");
          console.log("@@@@@@@@@@");
          if (!response.ok) {
              console.error('Failed to start login process', response.status, response.statusText);
              return;
          }
          const data = await response.json(); 
          console.log('Response:', data);
          window.location.href = data.authUrl;;
      } catch (error) {
          console.error('Error during login:', error);
      }
  };


  const getUserSettings = async (userId, setSettings) => {
    try {
      const response = await fetch(`/api/getSettings?user_id=${userId}`);
      const data = await response.json();
      if (data) {
        setSettings(data.settings_info);
      } else {
        console.error('Failed', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error while getting settings:', error);
    }
  };

  LoginScreen.userExists = userExists;
  LoginScreen.verifyToken = verifyToken;
  LoginScreen.getStaffRoles = getStaffRoles;
  LoginScreen.startLogin = startLogin;
  LoginScreen.loggedIn = loggedIn;
  LoginScreen.setLoggedIn = setLoggedIn;
  LoginScreen.getUserSettings = getUserSettings;

  return (
    loading ? (
      <div className="loadingScreen" aria-hidden="true" tabIndex="-1">
        <div className="spinner" role="alert">
          <div className="spinner-icon"></div>
          <p className="spinner-text">Loading...</p>
        </div>
      </div>
    ) : (
      <main className='loginScreen' data-testid="login-screen">
        <header className='loginHeader' role="heading" aria-level="1">
          <img src={logo} alt="TAMU Logo" className='logoImg'/>
          <h1 className='loginTitle'>AIM Portal</h1>
        </header>
        <button type="button" id="loginBtn" aria-label="log in" onClick={startLogin}>log in</button>
      </main>
    )
  );

}

export default LoginScreen;
