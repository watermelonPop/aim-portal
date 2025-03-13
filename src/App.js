
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
  const [txtChangeSizeAmount, setTxtChangeSizeAmount] = useState(1);
  const [letterSpacingChangeSizeAmount, setLetterSpacingChangeSizeAmount] = useState(1);
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
      if(localStorage.getItem("aim-settings") === null){
        console.log("SETTING LOCAL STORAGE");
        localStorage.setItem("aim-settings", JSON.stringify(settings));
      }
    }else if(userType === "Student"){
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
    //get settings here
    return () => {
    };
  }, [loggedIn, userType, staffAccess]);

  useEffect(() => {
    const savedSettings = localStorage.getItem("aim-settings");
    if (!savedSettings || savedSettings !== JSON.stringify(settings)) {
      console.log("Updating local storage with new settings:", settings);
      localStorage.setItem("aim-settings", JSON.stringify(settings));
    }
    if(userId){
      setSettingsDatabase(userId, settings);
    }
    setTxtChangeSizeAmount(settings.font_size);
    setLetterSpacingChangeSizeAmount(settings.letter_spacing);
  }, [settings, userId]);

  useEffect(() => {
    document.documentElement.style.setProperty("--txtChangeSizeAmount", `${txtChangeSizeAmount}`);
    console.log("setting txtChangeSizeAmount to " + txtChangeSizeAmount);
  }, [txtChangeSizeAmount]);

  useEffect(() => {
    document.documentElement.style.setProperty("--letterSpacingChangeSizeAmount", `${letterSpacingChangeSizeAmount}`);
    console.log("setting letterSpacingChangeSizeAmount to " + letterSpacingChangeSizeAmount);
  }, [letterSpacingChangeSizeAmount]);

  const setSettingsDatabase = async (userId, setts) => {
    try {
      const response = await fetch('/api/setSettings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: userId,
          settings: setts 
        }),
      });
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking exists', error);
    }
  };

  const remFactor = 0.1; 

  function incTxtChangeSizeAmount(amt) {
    let newAmt = (amt * remFactor) + txtChangeSizeAmount;
    if (newAmt < 2 && newAmt > 0.2) {
      setTxtChangeSizeAmount(parseFloat(newAmt.toFixed(2)));
      document.documentElement.style.setProperty("--txtChangeSizeAmount", `${parseFloat(newAmt.toFixed(2))}`);
      let newSetts = {...settings};
      newSetts.font_size = parseFloat(newAmt.toFixed(2));
      setSettings(newSetts);
    }
  }


  function decTxtChangeSizeAmount(amt) {
    let newAmt = txtChangeSizeAmount - (amt * remFactor);
    if(newAmt <= 2 && newAmt > 0.2){
      setTxtChangeSizeAmount(parseFloat(newAmt.toFixed(2)));
      document.documentElement.style.setProperty("--txtChangeSizeAmount", `${parseFloat(newAmt.toFixed(2))}`);
      let newSetts = {...settings};
      newSetts.font_size = parseFloat(newAmt.toFixed(2));
      setSettings(newSetts);
    }
  }

  const letterSpacingRem = 1;

  function incLetterSpacingChangeSizeAmount(amt) {
    let newAmt = (amt * letterSpacingRem) + letterSpacingChangeSizeAmount;
    if (newAmt < 12 && newAmt > 0.001) {
      setLetterSpacingChangeSizeAmount(parseFloat(newAmt.toFixed(2)));
      let newSetts = {...settings};
      newSetts.letter_spacing = parseFloat(newAmt.toFixed(2));
      setSettings(newSetts);
    }
  }

  function decLetterSpacingChangeSizeAmount(amt) {
    let newAmt = letterSpacingChangeSizeAmount - (amt * (letterSpacingRem));
    console.log(newAmt);
    if (newAmt < 12 && newAmt > 0.001) {
      setLetterSpacingChangeSizeAmount(parseFloat(newAmt.toFixed(2)));
      let newSetts = {...settings};
      newSetts.letter_spacing = parseFloat(newAmt.toFixed(2));
      setSettings(newSetts);
    }
  }

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
        <BasicSettingsBar isOpen={settingsTabOpen} onClose={() => setSettingsTabOpen(false)}/>
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



  function BasicSettingsBar({ isOpen, onClose }) {
    return (
      <>
        <nav role="dialog" aria-label='Settings' className='settingsNav' id='settings' aria-hidden={!isOpen} onClick={(e) => {
                      e.stopPropagation();
                    }} data-testid="settings">
          <div role="presentation" className='closeBtnDiv'>
            <button id="closeSettingPanel" onClick={onClose} aria-label='close'>x</button>
          </div>
          <h2 className="settingsHeading">Settings</h2>
          <ul>
              <li>
                <h3>Text Size</h3>
                <form onSubmit={(e) => e.preventDefault()}>
                  <button onClick={(e) => {
                      e.stopPropagation();  // Prevent closing the panel
                      decTxtChangeSizeAmount(1);
                    }}  className='settingsBtn' aria-label='Decrease Text Size' data-testid="txtSizeDec">-</button>
                  <label data-testid="txtSizeLabel">{parseFloat((txtChangeSizeAmount*100).toFixed(2))}%</label>
                  <button onClick={(e) => {
                      e.stopPropagation();  // Prevent closing the panel
                      incTxtChangeSizeAmount(1);
                    }}  className='settingsBtn' aria-label='Increase Text Size' data-testid="txtSizeInc">+</button>
                                </form>
              </li>
              <li>
                <h3>Letter Spacing</h3>
                <form onSubmit={(e) => e.preventDefault()}>
                  <button onClick={(e) => {
                      e.stopPropagation();  // Prevent closing the panel
                      decLetterSpacingChangeSizeAmount(1);
                    }}  className='settingsBtn' aria-label='Decrease Letter Spacing' data-testid="letterSpacingDec">-</button>
                  <label data-testid="letterSpacingLabel">{parseFloat((letterSpacingChangeSizeAmount*100).toFixed(2))}%</label>
                  <button onClick={(e) => {
                      e.stopPropagation();  // Prevent closing the panel
                      incLetterSpacingChangeSizeAmount(1);
                    }} className='settingsBtn' aria-label='Increase Letter Spacing' data-testid="letterSpacingInc">+</button>
                </form>
              </li>
              <li>
                <button onClick={() => {
                      logout(setLoggedIn);
                    }} className='logOutBtn'>log out</button>
              </li>
          </ul>
        </nav>
      </>
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
            <p className='footerTitle'>Disability Resources & Contact</p>
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
