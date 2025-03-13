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

  const verifyToken = async (
    token,
    setUserId = () => {},
    setSettings = () => {},
    loggedIn,
    setLoggedIn = () => {},
    setUserType = () => {},
    setStaffRoles = () => {},
    setLoading = () => {},
    setUserInfo = () => {}  // Add default parameter
  ) => {
    console.log("VERIFY TOKEN CALLED");
    try {
      const response = await fetch('/api/verifyToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      console.log("BEFORE THAT");
  
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
          if(exists.user_info.user_role === "Staff"){
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
          try {
            const data = JSON.parse(text);
            if (data.role && data.role.trim() !== '') {
              return data.role;
            } else {
              console.warn('Role is empty or undefined');
              return null;
            }
          } catch (parseError) {
            console.error('Failed to parse JSON:', parseError);
            return null;
          }
        } else {
          console.error('API request failed:', response.status, response.statusText);
          window.location.href = "/";
          return null;
        }
      } catch (networkError) {
        console.error('Network error:', networkError);
        return null;
      }   
  };

  const startLogin = async () => {
    try {
      const response = await fetch("/api/auth");
        
      // First check if response exists and has .text()
      if (!response || typeof response.text !== 'function') {
          throw new Error('Invalid response from server');
      }

      const responseText = await response.text();

        if (!response.ok) {
            console.error('Failed to start login process', response.status, response.statusText);
            window.location.href = "/error"; // Redirect to an error page
            return;
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Failed to parse JSON response:', parseError);
            window.location.href = "/error";
            return;
        }

        if (!data.authUrl) {
            console.error('Auth URL not found in response');
            window.location.href = "/error";
            return;
        }

        window.location.href = data.authUrl;
    } catch (error) {
        console.error('Error during login:', error);
        window.location.href = "/";
    }
  };



  const getUserSettings = async (userId, setSettings) => {
    if (!userId) {
        console.error('Invalid user ID provided');
        return;
    }

    try {
        const response = await fetch(`/api/getSettings?user_id=${userId}`);
        
        if (!response.ok) {
            console.error('Failed to fetch settings:', response.status, response.statusText);
            return;
        }

        const data = await response.json();

        if (data && data.settings_info) {
            setSettings(data.settings_info);
        } else {
            console.warn('No settings found or invalid settings data structure');
            setSettings({}); // Set to empty object or default settings
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
