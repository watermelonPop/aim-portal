
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
      cursor: "Regular",
    cursor_color: "#000000",
    cursor_border: "#FFFFFF",
});
const encodeCursorSVG = (svg, type) => {
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22")}") 0 0, ${type}`;
};
const [svgCursors, setSvgCursors] = useState({
  default: encodeCursorSVG(
    `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 320 512">
      <path 
        fill="${settings.cursor_color}" 
        stroke="${settings.cursor_border}" 
        stroke-width="25" 
        d="M0 55.2L0 426c0 12.2 9.9 22 22 22c6.3 0 12.4-2.7 16.6-7.5L121.2 346l58.1 116.3c7.9 15.8 27.1 22.2 42.9 14.3s22.2-27.1 14.3-42.9L179.8 320l118.1 0c12.2 0 22.1-9.9 22.1-22.1c0-6.3-2.7-12.3-7.4-16.5L38.6 37.9C34.3 34.1 28.9 32 23.2 32C10.4 32 0 42.4 0 55.2z" />
    </svg>`,
    "default"
  ),

  pointer: encodeCursorSVG(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
      <path 
        fill="${settings.cursor_color}" 
        stroke="${settings.cursor_border}" 
        stroke-width="25"
        d="M128 40c0-22.1 17.9-40 40-40s40 17.9 40 40v148.2c8.5-7.6 19.7-12.2 32-12.2 20.6 0 38.2 13 45 31.2 8.8-9.3 21.2-15.2 35-15.2 25.3 0 46 19.5 47.9 44.3 8.5-7.7 19.8-12.3 32.1-12.3 26.5 0 48 21.5 48 48v112c0 70.7-57.3 128-128 128h-85.3c-55.3-5.6-106.2-34-140-79L8 336c-13.3-17.7-9.7-42.7 8-56s42.7-9.7 56 8l56 74.7V40zM240 304c0-8.8-7.2-16-16-16s-16 7.2-16 16v96c0 8.8 7.2 16 16 16s16-7.2 16-16v-96zm48-16c-8.8 0-16 7.2-16 16v96c0 8.8 7.2 16 16 16s16-7.2 16-16v-96c0-8.8-7.2-16-16-16zm80 16c0-8.8-7.2-16-16-16s-16 7.2-16 16v96c0 8.8 7.2 16 16 16s16-7.2 16-16v-96z"/>
    </svg>`,
    "pointer"
  ),

  text: encodeCursorSVG(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512">
      <path 
        fill="${settings.cursor_color}" 
        stroke="${settings.cursor_border}" 
        stroke-width="25"
        d="M.1 29.3C-1.4 47 11.7 62.4 29.3 63.9l8 .7C70.5 67.3 96 95 96 128.3V224H64c-17.7 0-32 14.3-32 32s14.3 32 32 32h32v95.7c0 33.3-25.5 61-58.7 63.8l-8 .7C11.7 449.6-1.4 465 .1 482.7s16.9 30.7 34.5 29.2l8-.7c34.1-2.8 64.2-18.9 85.4-42.9 21.2 24 51.2 40 85.4 42.9l8 .7c17.6 1.5 33.1-11.6 34.5-29.2s-11.6-33.1-29.2-34.5l-8-.7c-33.2-2.8-58.7-30.5-58.7-63.8V288h32c17.7 0 32-14.3 32-32s-14.3-32-32-32h-32v-95.7c0-33.3 25.5-61 58.7-63.8l8-.7c17.6-1.5 30.7-16.9 29.2-34.5S239-1.4 221.3 .1l-8 .7C179.2 3.6 149.2 19.7 128 43.7c-21.2-24-51.2-40-85.4-42.9l-8-.7C17-1.4 1.6 11.7 .1 29.3z"/>
    </svg>`,
    "text"
  )
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
  }, [userInfo?.id, userInfo?.role, setUserConnected]);

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
        const newSvgCursors = {
          default: encodeCursorSVG(
            `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 320 512">
              <path 
                fill="${settings.cursor_color}" 
                stroke="${settings.cursor_border}" 
                stroke-width="25" 
                d="M0 55.2L0 426c0 12.2 9.9 22 22 22c6.3 0 12.4-2.7 16.6-7.5L121.2 346l58.1 116.3c7.9 15.8 27.1 22.2 42.9 14.3s22.2-27.1 14.3-42.9L179.8 320l118.1 0c12.2 0 22.1-9.9 22.1-22.1c0-6.3-2.7-12.3-7.4-16.5L38.6 37.9C34.3 34.1 28.9 32 23.2 32C10.4 32 0 42.4 0 55.2z" />
            </svg>`,
            "default"
          ),
        
          pointer: encodeCursorSVG(
            `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 448 512">
              <path 
                fill="${settings.cursor_color}" 
                stroke="${settings.cursor_border}" 
                stroke-width="25"
                d="M128 40c0-22.1 17.9-40 40-40s40 17.9 40 40v148.2c8.5-7.6 19.7-12.2 32-12.2 20.6 0 38.2 13 45 31.2 8.8-9.3 21.2-15.2 35-15.2 25.3 0 46 19.5 47.9 44.3 8.5-7.7 19.8-12.3 32.1-12.3 26.5 0 48 21.5 48 48v112c0 70.7-57.3 128-128 128h-85.3c-55.3-5.6-106.2-34-140-79L8 336c-13.3-17.7-9.7-42.7 8-56s42.7-9.7 56 8l56 74.7V40zM240 304c0-8.8-7.2-16-16-16s-16 7.2-16 16v96c0 8.8 7.2 16 16 16s16-7.2 16-16v-96zm48-16c-8.8 0-16 7.2-16 16v96c0 8.8 7.2 16 16 16s16-7.2 16-16v-96c0-8.8-7.2-16-16-16zm80 16c0-8.8-7.2-16-16-16s-16 7.2-16 16v96c0 8.8 7.2 16 16 16s16-7.2 16-16v-96z"/>
            </svg>`,
            "pointer"
          ),
        
          text: encodeCursorSVG(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512" width="32" height="32">
              <path 
                fill="${settings.cursor_color}" 
                stroke="${settings.cursor_border}" 
                stroke-width="25"
                d="M.1 29.3C-1.4 47 11.7 62.4 29.3 63.9l8 .7C70.5 67.3 96 95 96 128.3V224H64c-17.7 0-32 14.3-32 32s14.3 32 32 32h32v95.7c0 33.3-25.5 61-58.7 63.8l-8 .7C11.7 449.6-1.4 465 .1 482.7s16.9 30.7 34.5 29.2l8-.7c34.1-2.8 64.2-18.9 85.4-42.9 21.2 24 51.2 40 85.4 42.9l8 .7c17.6 1.5 33.1-11.6 34.5-29.2s-11.6-33.1-29.2-34.5l-8-.7c-33.2-2.8-58.7-30.5-58.7-63.8V288h32c17.7 0 32-14.3 32-32s-14.3-32-32-32h-32v-95.7c0-33.3 25.5-61 58.7-63.8l8-.7c17.6-1.5 30.7-16.9 29.2-34.5S239-1.4 221.3 .1l-8 .7C179.2 3.6 149.2 19.7 128 43.7c-21.2-24-51.2-40-85.4-42.9l-8-.7C17-1.4 1.6 11.7 .1 29.3z"/>
            </svg>`,
            "text"
          )
        };
        
        setSvgCursors(newSvgCursors);
        console.log("DEFAULT: ", newSvgCursors.default);
        document.documentElement.style.setProperty('--custom-cursor', newSvgCursors.default);
        document.documentElement.style.setProperty('--custom-hover-cursor', newSvgCursors.pointer);
        document.documentElement.style.setProperty('--custom-text-cursor', newSvgCursors.text);
        await setSettingsDatabase(userInfo.id, settings); 
      }
    };
    
    updateSettings().catch(console.error);
  }, [settings, userInfo]);

  /*useEffect(() => {
    const handleMouseOver = (e) => {
      const target = e.target;
      if (target.tagName === 'A' || target.tagName === 'BUTTON') {
        //console.log("BUTTON OR A: ", svgCursors.pointer);
        //document.documentElement.style.setProperty('--custom-cursor', svgCursors.pointer);
      }
    };
  
    const handleMouseOut = (e) => {
      const target = e.target;
      if (target.tagName === 'A' || target.tagName === 'BUTTON') {
        document.body.style.setProperty('--custom-cursor', svgCursors.default);
      }
    };
  
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
  
    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [svgCursors]);*/
  
  

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
