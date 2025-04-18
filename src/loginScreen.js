
import { useEffect, useState } from 'react';

export function LoginScreen({ setSettings, loggedIn, setLoggedIn, staffAccess, setStaffAccess, userInfo, setUserInfo, setLoading }) {

  const accountExists = async (email) => {
    //console.log("Checking account for email:", email); // Debug log
  
    try {
      const response = await fetch('/api/checkAccount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
  
      const data = await response.json();
      //console.log("Response from /api/checkAccount:", data); // Debug log
      return data;
    } catch (error) {
      console.error('Error checking exists', error);
    }
  };

  const createAccount = async (userInfo, setUserInfo) => {
    //console.log("USER INFO HERE", userInfo);
    let holderRole = userInfo.role !== null ? userInfo.role : "USER";
    try {
      const response = await fetch('/api/createAccount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name:  userInfo.name, email: userInfo.email, role: holderRole}),
      });
  
      const data = await response.json();
      //console.log("Response from /api/createAccount:", data); // Debug log
      if(data.success === true){
        setUserInfo({...userInfo, id: data.account.id, name: data.account.name, email: data.account.email, role: data.account.role});
      }
      return data.account;
    } catch (error) {
      console.error('Error checking exists', error);
    }
  };

  useEffect(() => {
    //console.log('useEffect running');
    const urlParams = new URLSearchParams(window.location.search);
    const idToken = urlParams.get('token');
    
    if (idToken) {
      //console.log('Calling verifyToken');
      verifyToken(idToken, userInfo, setSettings, loggedIn, setLoggedIn, setStaffRoles, setLoading, setUserInfo);
      // Remove the token from the URL for security
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const verifyToken = async (
    token,
    userInfo,
    setSettings = () => {},
    loggedIn,
    setLoggedIn = () => {},
    setStaffRoles = () => {},
    setLoading = () => {},
    setUserInfo = () => {}  // Add default parameter
  ) => {
    //console.log("VERIFY TOKEN CALLED");
    try {
      const response = await fetch('/api/verifyToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      //console.log("DATA HERE: ", data);

      if (data.valid) {
        setLoading(true);
        let updatedUserInfo = {...userInfo, email: data.payload.email, name: data.payload.name};
        setUserInfo(updatedUserInfo);

        let exists = await accountExists(data.payload.email);
        //console.log(userInfo);
        if(exists.exists === true){
          //console.log('exists.exists == true', exists.user_info);
          setUserInfo({...exists.user_info });
          if(exists.user_info.role === "ADVISOR"){
            let staffRole = await getStaffRoles(exists.user_info.id);
            //console.log("STAFF ROLE: ", staffRole);
            setStaffRoles(staffRole, setStaffAccess, staffAccess);
          }
          await getUserSettings(exists.user_info.id, setSettings);
        }else{
          //console.log("DOES NOT EXIST: ", userInfo);
          /*if (localStorage.getItem("aim-settings") !== null) {
              //console.log("LOCAL STORAGE EXISTS:", localStorage.getItem("aim-settings")); // Logs as a string
              const parsedSettings = JSON.parse(localStorage.getItem("aim-settings")); // Convert back to object
              setSettings(parsedSettings); // Set state with the parsed object
          }else{
            localStorage.setItem("aim-settings", JSON.stringify({
              content_size: 100,
              highlight_tiles: false,
              highlight_links: false,
              text_magnifier: false,
              align_text: "Middle",
              font_size: "14px",
              line_height: 5000,
              letter_spacing: "0px",
              contrast: "100%",
              saturation: "Regular",
              mute_sounds: false,
              hide_images: false,
              reading_mask: false,
              highlight_hover: false,
              cursor: "Regular"
            }));
          }*/
          await createAccount(updatedUserInfo, setUserInfo);
        }
        setLoggedIn(true);
        //console.log("ENDED", data);
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
    //console.log("HERE: ", userId);
      try {
        const response = await fetch(`/api/getStaffRole?user_id=${userId}`);
        const data = await response.json();
        if (response.ok) {
          if (data.res.role && data.res.role.trim() !== '' && data !== null) {
            return data.res.role;
          } else {
            console.warn('Role is empty or undefined');
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
  //outdated, TODO: change so that it is purely based off of actual access params.
  const setStaffRoles = (staffRole, setStaffAccess, staffAccess) => {
    //console.log("STAFF ROLE: ", staffRole);
    let newStaffAccess = [...staffAccess];
    //console.log("NEW STAFF ACCESS: ", newStaffAccess);
    if(staffRole === "Admin"){
      for(let i = 0; i < newStaffAccess.length; i++){
        newStaffAccess[i].hasAccess = true;
      }
      //console.log(newStaffAccess.length);
    }else if(staffRole === "Coordinator"){
      for(let i = 0; i < newStaffAccess.length; i++){
        if(newStaffAccess[i].access !== "Global Settings"){
          newStaffAccess[i].hasAccess = true;
        }
      }
    }else if(staffRole === "Testing_Staff"){
      for(let i = 0; i < newStaffAccess.length; i++){
        if(newStaffAccess[i].access === "Accessible Testing" || newStaffAccess[i].access === "Student Cases"){
          newStaffAccess[i].hasAccess = true;
        }
      }
    }else if(staffRole === "Tech_Staff"){
      for(let i = 0; i < newStaffAccess.length; i++){
        if(newStaffAccess[i].access === "Assistive Technology" || newStaffAccess[i].access === "Student Cases"){
          newStaffAccess[i].hasAccess = true;
        }
      }
    }
    setStaffAccess(newStaffAccess);
  }

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
        //console.log("DATA: ", data);

        if (data && data.settings_info) {
          let formattedSettings = {...data.settings_info};
          formattedSettings.font_size = formattedSettings.font_size + "px";
          formattedSettings.letter_spacing = formattedSettings.letter_spacing + "px";
          formattedSettings.word_spacing = formattedSettings.word_spacing + "px";
          setSettings(formattedSettings);
        } else {
            console.warn('No settings found or invalid settings data structure');
            setSettings({}); // Set to empty object or default settings
        }
    } catch (error) {
        console.error('Error while getting settings:', error);
    }
  };



  LoginScreen.accountExists = accountExists;
  LoginScreen.verifyToken = verifyToken;
  LoginScreen.getStaffRoles = getStaffRoles;
  LoginScreen.startLogin = startLogin;
  LoginScreen.loggedIn = loggedIn;
  LoginScreen.setLoggedIn = setLoggedIn;
  LoginScreen.getUserSettings = getUserSettings;
  LoginScreen.staffAccess = staffAccess;
  LoginScreen.setStaffRoles = setStaffRoles;
  LoginScreen.createAccount = createAccount;

  return (
      <main className='loginScreen' data-testid="login-screen">
        <a href="#loginBtn" className="skip-to-content" tabIndex="0">Skip to main content</a>
        <header className='loginHeader'>
          <svg alt="Texas A&M University Logo" aria-label='TAMU logo' className='loginLogoImg' xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 216 216"><defs></defs><title>Artboard 1</title><polygon className="cls-1" points="190.36 84.32 173.7 84.32 172.73 84.32 172.31 85.19 160.22 110.34 148.1 85.19 147.69 84.32 146.72 84.32 130.63 84.32 129.09 84.32 129.09 85.85 129.09 94.43 129.09 95.96 130.63 95.96 133.38 95.96 133.38 131.97 130.4 131.97 128.86 131.97 128.86 133.51 128.86 142.08 128.86 143.62 130.4 143.62 148.48 143.62 150.02 143.62 150.02 142.08 150.02 133.51 150.02 131.97 148.48 131.97 145.35 131.97 145.35 106.42 158.86 134.28 160.23 137.12 161.62 134.28 175.27 106.36 175.27 131.97 172.28 131.97 170.74 131.97 170.74 133.51 170.74 142.08 170.74 143.62 172.28 143.62 190.36 143.62 191.9 143.62 191.9 142.08 191.9 133.51 191.9 131.97 190.36 131.97 187.25 131.97 187.25 95.96 190.36 95.96 191.9 95.96 191.9 94.43 191.9 85.85 191.9 84.32 190.36 84.32"></polygon><path className="cls-1" d="M85.37,131.94h-4.8L64.91,95.77h3V84.11H42.78V95.77h3.46L30.6,131.94H24.1v11.64H46.91V131.94H43.58l2.6-6H65l2.6,6H64.08v11.64H86.91V131.94ZM60,114.27H51.21l4.37-10.11Z"></path><path className="cls-1" d="M171.23,39.11H42.6v37.4H68V62.16H95.08v89.33H80.74v25.4h54.1v-25.4H120.51V62.16h26.9V76.35H173V39.11h-1.75ZM124.15,162l5.36-5.51v15.15l-5.36-5.13Zm-8.95-5.12-5.36,5.29V51.63L115.2,57Zm-62-107.21-5.53-5.37H165l-6.94,5.37Zm114.7,21.78-5.36-5.12V52.68l5.36-5.52Z"></path><path className="cls-1" d="M140.77,171.62a5.2,5.2,0,1,1,5.2,5.2A5.21,5.21,0,0,1,140.77,171.62Zm9.14,0a3.94,3.94,0,1,0-3.94,4.19A4,4,0,0,0,149.91,171.62Zm-5.94-3h2.19c1.41,0,2.17.5,2.17,1.73a1.47,1.47,0,0,1-1.54,1.59l1.58,2.58h-1.12L145.72,172h-.66v2.54H144Zm1.1,2.52h1c.65,0,1.21-.08,1.21-.87s-.63-.81-1.19-.81h-1v1.68Z"></path></svg> 
          <h1 className='loginTitle'>AIM Portal</h1>
        </header>
        <button type="button" id="loginBtn" aria-label="log in" onClick={startLogin}>log in / sign up</button>
      </main>
  );

}

export default LoginScreen;
