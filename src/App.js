
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
import SignUp from './signUp';

import BlobTest from './blobtest';


export function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("ERROR");
  const [tabs, setTabs] = useState([]);
  const [userInfo, setUserInfo] = useState({
    id: null,
    name: null,
    email: null,
    role: null,
    picture: null,
    dob: null,
    uin: null,
    phone_number: null,
  });
  const [userConnected, setUserConnected] = useState(false);
  const [userTabs, setUserTabs] = useState([

    {name: 'Dashboard', elem: <Dash/>},
    {name: 'Accommodations', elem: <Accommodations/>},
    {name: 'Forms', elem: <Forms/>},
    {name: 'Profile', elem: <Profile/>},

  ]);
  const [studentTabs, setStudentTabs] = useState([
    {name: 'Dashboard', elem: <Dash/>},
    {name: 'Accommodations', elem: <Accommodations/>},
    {name: 'Testing', elem: <Testing/>},
    {name: 'Note Taking',elem: <NoteTaking/>},
    {name: 'Forms', elem: <Forms/>},
    {name: 'Profile', elem: <Profile/>},
  ]);
  const [professorTabs, setProfessorTabs] = useState([
    {name: 'Dashboard', elem: <Dash/>},
    {name: 'Accommodations', elem: <Accommodations/>},
    {name: 'Testing', elem: <Testing/>},
    {name: 'Note Taking',elem: <NoteTaking/>},
    {name: 'Profile', elem: <Profile/>},
  ]);
  const [staffTabs, setStaffTabs] = useState([
    {name: 'Dashboard', elem: <Dash/>},
    {name: 'Forms', elem: <Forms/>},
    {name: 'Profile', elem: <Profile/>},
  ]);
  const [currentTab, setCurrentTab] = useState(null);
  const [staffAccess, setStaffAccess] = useState([
    {access: 'Global Settings', hasAccess: false, elem: <GlobalSettings/>},
    {access: 'Accommodations', hasAccess: false, elem: <Accommodations/>},
    {access: 'Note Taking', hasAccess: false, elem: <NoteTaking/>},
    {access: 'Assistive Technology', hasAccess: false, elem: <AssistiveTech/>},
    {access: 'Accessible Testing', hasAccess: false, elem: <Testing/>},
    {access: 'Student Cases', hasAccess: false, elem: <StudentCases/>},
  ]);
  const [settingsTabOpen, setSettingsTabOpen] = useState(false);
  const [settings, setSettings] = useState({
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
    checkAccountConnected(userInfo.id, setUserConnected);
    //get settings here
    return () => {
    };
  }, [loggedIn, userInfo]);

  useEffect(() => {
    if (userInfo && userInfo.role === "USER" && userInfo.id && userConnected) {
      getUser(userInfo.id);
    }
  }, [userInfo?.id, userInfo?.role, userConnected]);

  useEffect(() => {
    if(!loggedIn || !userConnected || !userInfo){
      return;
    }
    let updatedUserTabs = {...userTabs};
    let updatedProfessorTabs = {...professorTabs};
    let updatedStudentTabs = {...studentTabs};
    let updatedStaffTabs = {...staffTabs};
    let updatedStaffAccess = [...staffAccess];
    if(userInfo !== null){
      console.log("UPDATING USER TABS");
      updatedUserTabs = [
        {name: 'Dashboard', elem: <Dash userInfo={userInfo}/>},
        {name: 'Accommodations', elem: <Accommodations userInfo={userInfo} setAlertMessage={setAlertMessage} setShowAlert={setShowAlert}/>},
        {name: 'Forms', elem: <Forms userInfo={userInfo}/>},
        {name: 'Profile', elem: <Profile userInfo={userInfo}/>},
      ];

      updatedProfessorTabs = [
        {name: 'Dashboard', elem: <Dash userInfo={userInfo}/>},
        {name: 'Accommodations', elem: <Accommodations userInfo={userInfo} setAlertMessage={setAlertMessage} setShowAlert={setShowAlert}/>},
        {name: 'Testing', elem: <Testing userInfo={userInfo}/>},
        {name: 'Note Taking',elem: <NoteTaking userInfo={userInfo}/>},
        {name: 'Profile', elem: <Profile userInfo={userInfo}/>},
      ];

      updatedStudentTabs = [
        {name: 'Dashboard', elem: <Dash userInfo={userInfo}/>},
        {name: 'Accommodations', elem: <Accommodations userInfo={userInfo} setAlertMessage={setAlertMessage} setShowAlert={setShowAlert}/>},
        {name: 'Testing', elem: <Testing userInfo={userInfo}/>},
        {name: 'Note Taking',elem: <NoteTaking userInfo={userInfo}/>},
        {name: 'Forms', elem: <Forms userInfo={userInfo}/>},
        {name: 'Profile', elem: <Profile userInfo={userInfo}/>},
      ];

      updatedStaffTabs = [
        {name: 'Dashboard', elem: <Dash userInfo={userInfo}/>},
        {name: 'Forms', elem: <Forms userInfo={userInfo}/>},
        {name: 'Profile', elem: <Profile userInfo={userInfo}/>},
      ];
      updatedStaffAccess[0].elem = <GlobalSettings/>;
      updatedStaffAccess[1].elem = <Accommodations userInfo={userInfo} setAlertMessage={setAlertMessage} setShowAlert={setShowAlert}/>;
      updatedStaffAccess[2].elem = <NoteTaking userInfo={userInfo}/>;
      updatedStaffAccess[3].elem = <AssistiveTech/>;
      updatedStaffAccess[4].elem = <Testing userInfo={userInfo}/>;
      updatedStaffAccess[5].elem = <StudentCases/>;
    }
    if(userInfo.role === "USER"){
      setTabs(updatedUserTabs);
      setCurrentTab(updatedUserTabs[0]);
    }else{
      if(userInfo.role === "STUDENT"){
          setTabs(updatedStudentTabs);
          setCurrentTab(updatedStudentTabs[0]);
        }else if(userInfo.role === "PROFESSOR"){
          setTabs(updatedProfessorTabs);
          setCurrentTab(updatedProfessorTabs[0]);
        }else if(userInfo.role === "ADVISOR"){
          //check for staff access & set here
          let newStaffTabs = [...updatedStaffTabs];
          for(let i = 0; i < updatedStaffAccess.length; i++){
            if(updatedStaffAccess[i].hasAccess === true){
              newStaffTabs.push({name: updatedStaffAccess[i].access, elem: updatedStaffAccess[i].elem});
            }
          }
          setTabs(newStaffTabs);
          setCurrentTab(newStaffTabs[0]);
        }
    }
  }, [loggedIn, userConnected, userInfo, staffAccess]);

  useEffect(() => {

    const updateSettings = async () => {
      if(settings && userInfo.id !== null){
        document.documentElement.style.setProperty("--txtSize", `${settings.font_size}`);
        document.documentElement.style.setProperty("--letterSpacing", `${settings.letter_spacing}`);
        document.documentElement.style.setProperty("--contrast", `${settings.contrast}`);
        
        await setSettingsDatabase(userInfo.id, settings); 
      }
    };
    
    updateSettings().catch(console.error);
  }, [settings, userInfo]);

  const checkAccountConnected = async (userId, setUserConnected) => {
    if (!userId) {
        console.error('Invalid user ID provided');
        return;
    }

    try {
        const response = await fetch(`/api/accountConnected?userId=${userId}`);
        
        if (!response.ok) {
            console.error('Failed to check account connection:', response.status, response.statusText);
            return;
        }

        const data = await response.json();
        if (data && data.exists !== null) {
          setUserConnected(data.exists);
          setLoading(false);
          return data.exists;
        }
        return false;
    } catch (error) {
        console.error('Error while getting settings:', error);
    }
  };

  const getUser = async (userId) => {
    if (!userId) {
        console.error('Invalid user ID provided');
        return;
    }

    try {
        const response = await fetch(`/api/getUser?userId=${userId}`);
        
        if (!response.ok) {
            console.error('Failed to get user:', response.status, response.statusText);
            return;
        }

        const data = await response.json();

        if (data && data.exists) {
          setUserInfo({...userInfo, dob: data.user_info.dob, uin: data.user_info.UIN, phone_number: data.user_info.phone_number});
          return data.user_info;
        }
        return null;
    } catch (error) {
        console.error('Error while getting user:', error);
    }
  };


  const setSettingsDatabase = async (userId, setts) => {
    console.log("SETTINGS HERE: ", setts);
    try {
      let deformattedSettings = {...setts};
      deformattedSettings.font_size = parseInt(deformattedSettings.font_size.replace("px", ""));
      deformattedSettings.letter_spacing = parseInt(deformattedSettings.letter_spacing.replace("px", ""));
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

  function BasicView({ currentTab, setCurrentTab, userType, tabs }) {
    return (
        <main className='basicScreen' data-testid="basicScreen">
          <BasicSettingsBar isOpen={settingsTabOpen} onClose={() => setSettingsTabOpen(false)} settings={settings} setSettings={setSettings} logout={logout} setLoggedIn={setLoggedIn}/>
          <div className='stickyContainer'>
            <BasicHeader />
            <BasicTabNav tabs={tabs} setCurrentTab={setCurrentTab} />
          </div>
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
  App.staffAccess = staffAccess;
  App.setStaffAccess = setStaffAccess;
  App.setSettings = setSettings;
  App.setUserInfo = setUserInfo;
  App.setShowAlert = setShowAlert;
  App.setAlertMessage = setAlertMessage;
  App.setUserConnected = setUserConnected;
  App.setTabs = setTabs;

  return (
    <>
      {showAlert && <Alert message={alertMessage} />}
      {loading ? ( // Wrap `loading` in curly braces
        <div className="loadingScreen" aria-hidden="true" tabIndex="-1">
          <div className="spinner" role="alert">
            <div className="spinner-icon"></div>
            <h1 className="spinner-text">Loading...</h1>
          </div>
        </div>
      ) : (
        !loggedIn ? (
          <LoginScreen 
            userInfo={userInfo} 
            setSettings={setSettings} 
            loggedIn={loggedIn} 
            setLoggedIn={setLoggedIn} 
            staffAccess={staffAccess}
            setStaffAccess={setStaffAccess} 
            setUserInfo={setUserInfo}
            setLoading={setLoading}
          />
        ) : !userConnected ? (
          <SignUp 
            userInfo={userInfo} 
            setUserInfo={setUserInfo} 
            setAlertMessage={setAlertMessage} 
            setShowAlert={setShowAlert} 
            setUserConnected={setUserConnected} 
            setLoading={setLoading}
          />
        ) : (
          <BasicView 
            currentTab={currentTab} 
            setCurrentTab={setCurrentTab}
            userInfo={userInfo}
            tabs={tabs}
          />
        )
      )}
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
