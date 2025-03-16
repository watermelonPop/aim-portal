
import logo2 from './logo2.png';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faMagnifyingGlass, faBars} from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState, useRef } from 'react';
import Dash from './dash';
import Profile from './profile';
import LoginScreen from './loginScreen';
import Forms from './forms';
import GlobalSettings from './globalSettings';
import Accommodations from './accommodations';
import NoteTaking from './noteTaking';
import AssistiveTech from './assistiveTech';
import Testing from './testing';
import StudentCases from './studentCases';
import Alert from './alert';
import BasicSettingsBar from './basicSettingsBar';


export function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("ERROR");
  const [tabs, setTabs] = useState([]);
  const [userType, setUserType] = useState("User");
  const [userId, setUserId] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [userTabs, setUserTabs] = useState([
    {name: 'Dashboard', elem: <Dash userType={"User"}/>},
    {name: 'Accommodations', elem: <Accommodations userType={"User"} setAlertMessage={setAlertMessage} setShowAlert={setShowAlert}/>},
    {name: 'Forms', elem: <Forms userType={"User"}/>},
    {name: 'Profile', elem: <Profile userType={"User"}/>},
  ]);
  const [studentTabs, setStudentTabs] = useState([
    {name: 'Dashboard', elem: <Dash userType={"Student"}/>},
    {name: 'Accommodations', elem: <Accommodations userType={"Student"}/>},
    {name: 'Testing', elem: <Testing userType={"Student"}/>},
    {name: 'Note Taking',elem: <NoteTaking userType={"Student"}/>},
    {name: 'Forms', elem: <Forms userType={"Student"}/>},
    {name: 'Profile', elem: <Profile userType={"Student"}/>},
  ]);
  const [professorTabs, setProfessorTabs] = useState([
    {name: 'Dashboard', elem: <Dash userType={"Professor"}/>},
    {name: 'Accommodations', elem: <Accommodations userType={"Professor"}/>},
    {name: 'Testing', elem: <Testing userType={"Professor"}/>},
    {name: 'Note Taking',elem: <NoteTaking userType={"Professor"}/>},
    {name: 'Profile', elem: <Profile userType={"Professor"}/>},
  ]);
  const [staffTabs, setStaffTabs] = useState([
    {name: 'Dashboard', elem: <Dash userType={"Staff"}/>},
    {name: 'Forms', elem: <Forms userType={"Staff"}/>},
    {name: 'Profile', elem: <Profile userType={"Staff"}/>},
  ]);
  const [currentTab, setCurrentTab] = useState(null);
  const [staffAccess, setStaffAccess] = useState([
    {access: 'Global Settings', hasAccess: false, elem: <GlobalSettings/>},
    {access: 'Accommodations', hasAccess: false, elem: <Accommodations userType={"Staff"}/>},
    {access: 'Note Taking', hasAccess: false, elem: <NoteTaking userType={"Staff"}/>},
    {access: 'Assistive Technology', hasAccess: false, elem: <AssistiveTech/>},
    {access: 'Accessible Testing', hasAccess: false, elem: <Testing userType={"Staff"}/>},
    {access: 'Student Cases', hasAccess: false, elem: <StudentCases/>},
  ]);
  const [settingsTabOpen, setSettingsTabOpen] = useState(false);
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem("aim-settings");
    return savedSettings ? JSON.parse(savedSettings) : {
      content_size: 100,
      highlight_tiles: false,
      highlight_links: false,
      text_magnifier: false,
      align_text: "Middle",
      font_size: 1,
      line_height: 5000,
      letter_spacing: 1,
      contrast: "Regular",
      saturation: "Regular",
      mute_sounds: false,
      hide_images: false,
      reading_mask: false,
      highlight_hover: false,
      cursor: "Regular"
    };
  });

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  useEffect(() => {
    if(settingsTabOpen === true){
      document.body.classList.add('modal-open');
    }else{
      document.body.classList.remove('modal-open');
    }
  }, [settingsTabOpen]);

  useEffect(() => {
    if(!loggedIn){
      return;
    }
    let updatedUserTabs = {...userTabs};
    if(userInfo !== null){
      updatedUserTabs = [
        {name: 'Dashboard', elem: <Dash userType={"User"}/>},
        {name: 'Accommodations', elem: <Accommodations userType={"User"} name={userInfo.name} email={userInfo.email} setAlertMessage={setAlertMessage} setShowAlert={setShowAlert}/>},
        {name: 'Forms', elem: <Forms userType={"User"}/>},
        {name: 'Profile', elem: <Profile userType={"User"}/>},
      ];
    }

    if(userType === "User"){
      setTabs(updatedUserTabs);
      setCurrentTab(userTabs[0]);
    }else{
      if(userType === "Student"){
        setTabs(studentTabs);
        setCurrentTab(studentTabs[0]);
      }else if(userType === "Professor"){
        setTabs(professorTabs);
        setCurrentTab(professorTabs[0]);
      }else if(userType === "Staff"){
        //check for staff access & set here
        let newStaffTabs = [...staffTabs];
        for(let i = 0; i < staffAccess.length; i++){
          if(staffAccess[i].hasAccess === true){
            newStaffTabs.push({name: staffAccess[i].access, elem: staffAccess[i].elem});
          }
        }
        setTabs(newStaffTabs);
        setCurrentTab(newStaffTabs[0]);
      }
    }
    //get settings here
    return () => {
    };
  }, [loggedIn, userType, staffAccess]);

  useEffect(() => {
    const updateSettings = async () => {
      if(settings){
        document.documentElement.style.setProperty("--txtSize", `${settings.font_size}`);
        document.documentElement.style.setProperty("--letterSpacing", `${settings.letter_spacing}`);
        document.documentElement.style.setProperty("--contrast", `${settings.contrast}`);
        
        if(userType === "User") {
            localStorage.setItem("aim-settings", JSON.stringify(settings));
        } else {
            await setSettingsDatabase(userId, settings); 
        }
      }
    };
    
    updateSettings().catch(console.error);
  }, [settings, userType, userId]);


  const setSettingsDatabase = async (userId, setts) => {
    console.log("USER ID HERE: " + userId);
    try {
      let deformattedSettings = {...setts};
      deformattedSettings.font_size = deformattedSettings.font_size.replace("px", "");
      deformattedSettings.letter_spacing = deformattedSettings.letter_spacing.replace("px", "");
      const response = await fetch('/api/setSettings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: userId,
          settings: deformattedSettings 
        }),
      });
  
      const data = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      console.error('Error checking exists', error);
    }
  };

  function setStaffRoles({ staffRole }) {
    let newStaffAccess = {...staffAccess}
    if(staffRole === "Admin"){
      for(let i = 0; i < newStaffAccess.length; i++){
        newStaffAccess[i].hasAccess = true;
      }
    }else if(staffRole === "Coordinator"){
      for(let i = 0; i < newStaffAccess.length; i++){
        if(newStaffAccess[i].access !== "Global Settings"){
          newStaffAccess[i].hasAccess = true;
        }
      }
    }else if(staffRole === "Testing Staff"){
      for(let i = 0; i < newStaffAccess.length; i++){
        if(newStaffAccess[i].access === "Accessible Testing" || newStaffAccess[i].access === "Student Cases"){
          newStaffAccess[i].hasAccess = true;
        }
      }
    }else if(staffRole === "Assistive Technology"){
      for(let i = 0; i < newStaffAccess.length; i++){
        if(newStaffAccess[i].access === "Assistive Technology" || newStaffAccess[i].access === "Student Cases"){
          newStaffAccess[i].hasAccess = true;
        }
      }
    }
    setStaffAccess(newStaffAccess);
  }

  function BasicView({ currentTab, setCurrentTab, userType, tabs }) {
    return (
        <main className='basicScreen' data-testid="basicScreen">
          <BasicSettingsBar isOpen={settingsTabOpen} onClose={() => setSettingsTabOpen(false)} settings={settings} setSettings={setSettings} logout={logout} setLoggedIn={setLoggedIn}/>
          <BasicHeader />
          <BasicTabNav tabs={tabs} setCurrentTab={setCurrentTab} />
          <Display currentTab={currentTab} />
          <BasicFooter/>
        </main>
    );
  }

  function Display({ currentTab }) {
    return currentTab ? currentTab.elem : null;
  }

  function BasicTabNav({tabs, setCurrentTab}){
    const tabRefs = useRef([]);
    useEffect(() => {
      if (tabRefs.current[0]) {
        tabRefs.current[0].focus();  // Focus on the first tab when it is set initially
      }
    }, [currentTab]);
    return (
      <nav role="navigation" className='tabNav' data-testid="basicTabNav">
        <ul role="menubar">
          {Array.isArray(tabs) ? tabs.map((tab, index) => (
            <li key={index} role="menuitem" onClick={() => setCurrentTab(tab)} 
                id={tab === currentTab ? "activeTab" : undefined}
                ref={(el) => (tabRefs.current[index] = el)} // Create a ref for each tab
                tabIndex={0}>  {/* Add tabIndex to ensure it is focusable */}
              {tab.name}
            </li>
          )) : <li>No tabs available</li>}
        </ul>
      </nav>
    );
  }

  function BasicHeader(){
    return (
      <>
          <header className='basicHeader' data-testid="basicHeader">
            <img src={logo2} alt="TAMU Logo" className='basicLogoImg' aria-label='TAMU'/>
            <h1 className='basicTitle'>AIM Portal</h1>
            <form role="search" className='searchForm' onSubmit={(e) => e.preventDefault()}>
              <input type="search" placeholder="Search.." role="searchbox" id="search"></input>
              <button className="searchBtn" aria-label="Submit Search">
                <FontAwesomeIcon icon={faMagnifyingGlass} className='searchIcon' aria-hidden="true" />
              </button>
            </form>
            <button className='profileBtn' aria-label="Settings" onClick={
                () => {
                  setSettingsTabOpen(true);
                }
              } data-testid="settingsBtn">
              <FontAwesomeIcon icon={faBars} className='profileIcon' aria-hidden="true" />
            </button>
          </header>
      </>
    );
  }

  function BasicFooter(){
    return (
      <>
          <footer className='basicFooter'>
            <h4 className='footerTitle'>Disability Resources & Contact</h4>
            <div>
              <div aria-label='Address'>
                <p>Address</p>
                <p>Texas A&M University<br/>
                  471 Houston Street, SSB Ste 122<br/>
                  College Station, TX 77843-1224</p>
              </div>
              <div aria-label='Contact & Help'>
                <p>Website: <a>https://disability.tamu.edu/</a></p>
                <p>Email: <a>disability@tamu.edu</a></p>
                <p>Phone: <a>(979)-845-1637</a></p>
              </div>
            </div>
          </footer>
      </>
    );
  }

  App.setLoggedIn = setLoggedIn;
  App.setUserType = setUserType;
  App.setStaffRoles = setStaffRoles;
  App.staffAccess = staffAccess;
  App.setStaffAccess = setStaffAccess;
  App.setSettings = setSettings;
  App.setUserId = setUserId;
  App.setUserInfo = setUserInfo;
  App.setShowAlert = setShowAlert;
  App.setAlertMessage = setAlertMessage;

  return (
    <>
      {showAlert && <Alert message={alertMessage} />}
      {loggedIn ? <BasicView 
          currentTab={currentTab} 
          setCurrentTab={setCurrentTab}
          userType={userType}
          tabs={tabs}
        /> : <LoginScreen setUserId={setUserId} setSettings={setSettings} loggedIn={loggedIn} setLoggedIn={setLoggedIn} setUserType={setUserType} setStaffRoles={setStaffRoles} setUserInfo={setUserInfo}/>}
    </>
  );
}

export const logout = async (setLoggedIn) => {
  try {
      const response = await fetch('/api/logout', {
          method: 'POST',
          credentials: 'include', // Ensure cookies are sent with the request
          headers: {
              'Content-Type': 'application/json'
          }
      });

      const data = await response.json();

      if (!response.ok) {
          throw new Error(data.message || 'Logout failed');
      }
      setLoggedIn(false);
      console.log('Logged out:', data.message);
      window.location.href = '/'; // Redirect to homepage or login page
  } catch (error) {
      console.error('Error logging out:', error);
  }
};



export default App;
