
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faMagnifyingGlass, faBars} from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState, useRef, useCallback, useLayoutEffect, cloneElement} from 'react';
import Dash from './dash';
import Profile from './profile';
import LoginScreen from './loginScreen';
import Forms from './forms';
import GlobalSettings from './staff/globalSettings';
import Accommodations from './accommodations';
import NoteTaking from './noteTaking';
import AssistiveTech from './staff/assistiveTech';
import Testing from './testing';
import StudentCases from './staff/studentCases';
import Alert from './alert';
import BasicSettingsBar from './basicSettingsBar';
import SignUp from './signUp';

import BlobTest from './blobtest';


export function App() {
  const hasManuallyChangedTab = useRef(false);
  const hasManuallyOpenedSettings = useRef(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("ERROR");
  const [tabs, setTabs] = useState([]);
  const [staffRole, setStaffRole] = useState(null);
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
      highlight_links: false,
      highlight_links_color: "#335CFF",
      text_magnifier: false,
      align_text: "center",
      font_size: "14px",
      line_height: 1.5,
      letter_spacing: "0px",
      word_spacing: "0px",
      contrast: "100%",
      saturation: "100%",
      mute_sounds: false,
      highlight_hover: false,
      highlight_keyboard_focus: false,
      highlight_keyboard_focus_color: "#BD180F",
      highlight_hover_color: "#BD180F",
      cursor_size: 3,
    cursor_color: "#000000",
    cursor_border_color: "#FFFFFF",
    background_color: "#FFEDED",
    foreground_color: "#4F0000",
    text_color: "#000000",
    font: "Mitr",
});

const refs = useRef({
  header: null,
  tabNav: null,
  mainContent: null,
  footer: null,
});

const headerShouldFocus = useRef(true);
const lastIntendedFocusRef = useRef(null);

const encodeCursorSVG = (svg, type) => {
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22")}") 0 0, ${type}`;
};
const [svgCursors, setSvgCursors] = useState({
  default: encodeCursorSVG(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${20 + 5*Number(settings.cursor_size)}" height="${20 + 5*Number(settings.cursor_size)}" viewBox="0 0 320 512">
      <path 
        fill="${settings.cursor_color}" 
        stroke="${settings.cursor_border_color}" 
        stroke-width="25" 
        d="M0 55.2L0 426c0 12.2 9.9 22 22 22c6.3 0 12.4-2.7 16.6-7.5L121.2 346l58.1 116.3c7.9 15.8 27.1 22.2 42.9 14.3s22.2-27.1 14.3-42.9L179.8 320l118.1 0c12.2 0 22.1-9.9 22.1-22.1c0-6.3-2.7-12.3-7.4-16.5L38.6 37.9C34.3 34.1 28.9 32 23.2 32C10.4 32 0 42.4 0 55.2z" />
    </svg>`,
    "default"
  ),

  pointer: encodeCursorSVG(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="${20 + 5*Number(settings.cursor_size)}" height="${20 + 5*Number(settings.cursor_size)}">
      <path 
        fill="${settings.cursor_color}" 
        stroke="${settings.cursor_border_color}" 
        stroke-width="25"
        d="M128 40c0-22.1 17.9-40 40-40s40 17.9 40 40v148.2c8.5-7.6 19.7-12.2 32-12.2 20.6 0 38.2 13 45 31.2 8.8-9.3 21.2-15.2 35-15.2 25.3 0 46 19.5 47.9 44.3 8.5-7.7 19.8-12.3 32.1-12.3 26.5 0 48 21.5 48 48v112c0 70.7-57.3 128-128 128h-85.3c-55.3-5.6-106.2-34-140-79L8 336c-13.3-17.7-9.7-42.7 8-56s42.7-9.7 56 8l56 74.7V40zM240 304c0-8.8-7.2-16-16-16s-16 7.2-16 16v96c0 8.8 7.2 16 16 16s16-7.2 16-16v-96zm48-16c-8.8 0-16 7.2-16 16v96c0 8.8 7.2 16 16 16s16-7.2 16-16v-96c0-8.8-7.2-16-16-16zm80 16c0-8.8-7.2-16-16-16s-16 7.2-16 16v96c0 8.8 7.2 16 16 16s16-7.2 16-16v-96z"/>
    </svg>`,
    "pointer"
  ),

  text: encodeCursorSVG(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512" width="${20 + 5*Number(settings.cursor_size)}" height="${20 + 5*Number(settings.cursor_size)}">
      <path 
        fill="${settings.cursor_color}" 
        stroke="${settings.cursor_border_color}" 
        stroke-width="25"
        d="M.1 29.3C-1.4 47 11.7 62.4 29.3 63.9l8 .7C70.5 67.3 96 95 96 128.3V224H64c-17.7 0-32 14.3-32 32s14.3 32 32 32h32v95.7c0 33.3-25.5 61-58.7 63.8l-8 .7C11.7 449.6-1.4 465 .1 482.7s16.9 30.7 34.5 29.2l8-.7c34.1-2.8 64.2-18.9 85.4-42.9 21.2 24 51.2 40 85.4 42.9l8 .7c17.6 1.5 33.1-11.6 34.5-29.2s-11.6-33.1-29.2-34.5l-8-.7c-33.2-2.8-58.7-30.5-58.7-63.8V288h32c17.7 0 32-14.3 32-32s-14.3-32-32-32h-32v-95.7c0-33.3 25.5-61 58.7-63.8l8-.7c17.6-1.5 30.7-16.9 29.2-34.5S239-1.4 221.3 .1l-8 .7C179.2 3.6 149.2 19.7 128 43.7c-21.2-24-51.2-40-85.4-42.9l-8-.7C17-1.4 1.6 11.7 .1 29.3z"/>
    </svg>`,
    "text"
  )
});

document.documentElement.style.setProperty('--custom-cursor', svgCursors.default);
document.documentElement.style.setProperty('--custom-hover-cursor', svgCursors.pointer);
document.documentElement.style.setProperty('--custom-text-cursor', svgCursors.text);


  useEffect(() => {
    const loadingEl = document.querySelector('.loadingScreen');
    if (loadingEl) loadingEl.focus();
  }, [loading]);


  useEffect(() => {
      if (showAlert === true && settings.mute_sounds !== true) {
        const alertSound = new Audio('/notif_on.mp3'); // replace with your actual sound file path
        alertSound.play().catch((e) => {
          console.error('Failed to play alert sound:', e);
        });
      }
  }, [showAlert, settings]);


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
        {name: 'Dashboard', elem: <Dash userInfo={userInfo} setAlertMessage={setAlertMessage} setShowAlert={setShowAlert}/>},
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
    }
    else if(userInfo.role === "STUDENT"){
      setTabs(updatedStudentTabs);
      setCurrentTab(updatedStudentTabs[0]);
    }
    else if(userInfo.role === "PROFESSOR"){
      setTabs(updatedProfessorTabs);
      setCurrentTab(updatedProfessorTabs[0]);
    }
    else if(userInfo.role === "ADVISOR"){
      let newStaffTabs = [...updatedStaffTabs];
      console.log("NEW STAFF TABS BEFORE CHANGES: ",newStaffTabs);
      
      for(let i = 0; i < updatedStaffAccess.length; i++){
        if(updatedStaffAccess[i].hasAccess === true){
          newStaffTabs.push({name: updatedStaffAccess[i].access, elem: updatedStaffAccess[i].elem});
        }
      }
      setTabs(newStaffTabs);
      setCurrentTab(newStaffTabs[0]);
    }

  }, [loggedIn, userConnected, userInfo, staffAccess]);

  useEffect(() => {
    if (!settings || !userInfo?.id) return;
  
    const timeout = setTimeout(() => {
      const updateSettings = async () => {
        document.documentElement.style.setProperty("--txtSize", `${settings.font_size}`);
        document.documentElement.style.setProperty("--letterSpacing", `${settings.letter_spacing}`);
        document.documentElement.style.setProperty("--word-spacing", `${settings.word_spacing}`);
        document.documentElement.style.setProperty("--contrast", `${settings.contrast}`);
        document.documentElement.style.setProperty("--background-color", `${settings.background_color}`);
        document.documentElement.style.setProperty("--foreground-color", `${settings.foreground_color}`);
        document.documentElement.style.setProperty("--text-color", `${settings.text_color}`);
        document.documentElement.style.setProperty("--highlight-hover-color", `${settings.highlight_hover_color}`);
        document.documentElement.style.setProperty("--highlight-keyboard-focus-color", `${settings.highlight_keyboard_focus_color}`);
        document.documentElement.style.setProperty("--highlight-links-color", `${settings.highlight_links_color}`);
        document.documentElement.style.setProperty("--saturation", `${settings.saturation}`);
        document.documentElement.style.setProperty("--font", `${settings.font}`);
        document.documentElement.style.setProperty("--line-height", `${settings.line_height}`);
        document.documentElement.style.setProperty("--align-text", `${settings.align_text}`);
        document.body.classList.remove('align-left', 'align-center', 'align-right');
        document.body.classList.add(`align-${settings.align_text}`);
        if (settings.highlight_hover) {
          document.body.classList.add('highlight-hover-enabled');
        } else {
          document.body.classList.remove('highlight-hover-enabled');
        }
        if (settings.highlight_links) {
          document.body.classList.add('highlight-links-enabled');
        } else {
          document.body.classList.remove('highlight-links-enabled');
        }
        if (settings.highlight_keyboard_focus) {
          document.body.classList.add('highlight-keyboard-focus-enabled');
        } else {
          document.body.classList.remove('highlight-keyboard-focus-enabled');
        }
        const newSvgCursors = {
          default: encodeCursorSVG(
            `<svg xmlns="http://www.w3.org/2000/svg" width="${20 + 5*Number(settings.cursor_size)}" height="${20 + 5*Number(settings.cursor_size)}" viewBox="0 0 320 512">
              <path 
                fill="${settings.cursor_color}" 
                stroke="${settings.cursor_border_color}" 
                stroke-width="25" 
                d="M0 55.2L0 426c0 12.2 9.9 22 22 22c6.3 0 12.4-2.7 16.6-7.5L121.2 346l58.1 116.3c7.9 15.8 27.1 22.2 42.9 14.3s22.2-27.1 14.3-42.9L179.8 320l118.1 0c12.2 0 22.1-9.9 22.1-22.1c0-6.3-2.7-12.3-7.4-16.5L38.6 37.9C34.3 34.1 28.9 32 23.2 32C10.4 32 0 42.4 0 55.2z" />
            </svg>`,
            "default"
          ),
        
          pointer: encodeCursorSVG(
            `<svg xmlns="http://www.w3.org/2000/svg" width="${20 + 5*Number(settings.cursor_size)}" height="${20 + 5*Number(settings.cursor_size)}" viewBox="0 0 448 512">
              <path 
                fill="${settings.cursor_color}" 
                stroke="${settings.cursor_border_color}" 
                stroke-width="25"
                d="M128 40c0-22.1 17.9-40 40-40s40 17.9 40 40v148.2c8.5-7.6 19.7-12.2 32-12.2 20.6 0 38.2 13 45 31.2 8.8-9.3 21.2-15.2 35-15.2 25.3 0 46 19.5 47.9 44.3 8.5-7.7 19.8-12.3 32.1-12.3 26.5 0 48 21.5 48 48v112c0 70.7-57.3 128-128 128h-85.3c-55.3-5.6-106.2-34-140-79L8 336c-13.3-17.7-9.7-42.7 8-56s42.7-9.7 56 8l56 74.7V40zM240 304c0-8.8-7.2-16-16-16s-16 7.2-16 16v96c0 8.8 7.2 16 16 16s16-7.2 16-16v-96zm48-16c-8.8 0-16 7.2-16 16v96c0 8.8 7.2 16 16 16s16-7.2 16-16v-96c0-8.8-7.2-16-16-16zm80 16c0-8.8-7.2-16-16-16s-16 7.2-16 16v96c0 8.8 7.2 16 16 16s16-7.2 16-16v-96z"/>
            </svg>`,
            "pointer"
          ),
        
          text: encodeCursorSVG(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512" width="${20 + 5*Number(settings.cursor_size)}" height="${20 + 5*Number(settings.cursor_size)}">
              <path 
                fill="${settings.cursor_color}" 
                stroke="${settings.cursor_border_color}" 
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
      };
      updateSettings();
    }, 200); // Delay allows scroll restoration first
  
    return () => clearTimeout(timeout);
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
        console.error('Invalid user ID provided to getUser');
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
      deformattedSettings.word_spacing = parseInt(deformattedSettings.word_spacing.replace("px", ""));
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

  function BasicView({ currentTab, setCurrentTab, userType, tabs, refs }) {
    const displayHeaderRef = useRef(null);

    return (
        <main className='basicScreen' data-testid="basicScreen" id='basicScreen'>
        <BasicSettingsBar 
          isOpen={settingsTabOpen} 
          onClose={() => {
            setSettingsTabOpen(false);
          }} 
          settings={settings} 
          setSettings={setSettings} 
          logout={logout} 
          setLoggedIn={setLoggedIn} 
          displayHeaderRef={displayHeaderRef} 
          lastIntendedFocusRef={lastIntendedFocusRef}
        />

          <div className='stickyContainer'>
            <BasicHeader refs={refs} headerShouldFocus={headerShouldFocus} lastIntendedFocusRef={lastIntendedFocusRef}/>
            <BasicTabNav tabs={tabs} setCurrentTab={setCurrentTab} refs={refs} headerShouldFocus={headerShouldFocus} currentTab={currentTab} />
          </div>
          <Display currentTab={currentTab} displayHeaderRef={displayHeaderRef} settingsTabOpen={settingsTabOpen} lastIntendedFocusRef={lastIntendedFocusRef}/>
          <BasicFooter refs={refs}/>
        </main>
    );
  }

  function Display({ currentTab, displayHeaderRef, settingsTabOpen, lastIntendedFocusRef }) {
    return currentTab ? cloneElement(currentTab.elem, { displayHeaderRef, settingsTabOpen, lastIntendedFocusRef }) : null;
  }

  function BasicTabNav({ tabs, currentTab, setCurrentTab, refs }) {
    useEffect(() => {
      if(currentTab !== null){
        console.log("CURRENT TAB: ", currentTab);
      }
    }, [currentTab, setCurrentTab]);

    return (
      <div
        role="tablist"
        className="tabNav"
        data-testid="basicTabNav"
        ref={(el) => {
          refs.current.tabNav = el;
        }}
        id="mainContent"
      >
        {tabs.map((tab, index) => (
          <a
            key={tab.name}
            role="tab"
            aria-selected={currentTab?.name === tab.name}
            aria-controls={`tabpanel-${index}`}
            id={`tab-${index}`}
            tabIndex={0}
            href="#"
            className={currentTab?.name === tab?.name ? 'activeTab' : ''}
            onClick={(e) => {
              e.preventDefault();
              hasManuallyChangedTab.current = true;
              headerShouldFocus.current = false;
              setCurrentTab(tab);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                hasManuallyChangedTab.current = true;
                headerShouldFocus.current = false;
                setCurrentTab(tab);
              }
            }}
          >
            {tab.name}
          </a>
        ))}
      </div>
    );
  }
  
  
  
  
  
  
  
  
  
  
  

  function BasicHeader({refs, headerShouldFocus, lastIntendedFocusRef }){
    const titleRef = useRef(null);
    const hasFocused = useRef(false);

    useEffect(() => {
      const timeout = setTimeout(() => {
        if (
          !hasFocused.current &&
          titleRef.current &&
          headerShouldFocus.current &&
          !hasManuallyOpenedSettings.current &&
          !hasManuallyChangedTab.current &&
          document.querySelector('[data-testid="alert"]') === null &&
          !document.body.classList.contains("modal-open") &&
          lastIntendedFocusRef.current !== titleRef.current
        ) {
          console.log("BASIC HEADING FOCUS");
          titleRef.current.focus();
          hasFocused.current = true;
          lastIntendedFocusRef.current = null;
        }
        headerShouldFocus.current = true;
      }, 100);
    
      return () => clearTimeout(timeout);
    }, []);

    return (
      <>
          <header className='basicHeader' data-testid="basicHeader">
            <svg tabIndex={0} alt="Texas A&M University Logo" aria-label='TAMU' className='basicLogoImg' xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 216 216"><defs></defs><title>Artboard 1</title><polygon className="cls-1" points="190.36 84.32 173.7 84.32 172.73 84.32 172.31 85.19 160.22 110.34 148.1 85.19 147.69 84.32 146.72 84.32 130.63 84.32 129.09 84.32 129.09 85.85 129.09 94.43 129.09 95.96 130.63 95.96 133.38 95.96 133.38 131.97 130.4 131.97 128.86 131.97 128.86 133.51 128.86 142.08 128.86 143.62 130.4 143.62 148.48 143.62 150.02 143.62 150.02 142.08 150.02 133.51 150.02 131.97 148.48 131.97 145.35 131.97 145.35 106.42 158.86 134.28 160.23 137.12 161.62 134.28 175.27 106.36 175.27 131.97 172.28 131.97 170.74 131.97 170.74 133.51 170.74 142.08 170.74 143.62 172.28 143.62 190.36 143.62 191.9 143.62 191.9 142.08 191.9 133.51 191.9 131.97 190.36 131.97 187.25 131.97 187.25 95.96 190.36 95.96 191.9 95.96 191.9 94.43 191.9 85.85 191.9 84.32 190.36 84.32"></polygon><path className="cls-1" d="M85.37,131.94h-4.8L64.91,95.77h3V84.11H42.78V95.77h3.46L30.6,131.94H24.1v11.64H46.91V131.94H43.58l2.6-6H65l2.6,6H64.08v11.64H86.91V131.94ZM60,114.27H51.21l4.37-10.11Z"></path><path className="cls-1" d="M171.23,39.11H42.6v37.4H68V62.16H95.08v89.33H80.74v25.4h54.1v-25.4H120.51V62.16h26.9V76.35H173V39.11h-1.75ZM124.15,162l5.36-5.51v15.15l-5.36-5.13Zm-8.95-5.12-5.36,5.29V51.63L115.2,57Zm-62-107.21-5.53-5.37H165l-6.94,5.37Zm114.7,21.78-5.36-5.12V52.68l5.36-5.52Z"></path><path className="cls-1" d="M140.77,171.62a5.2,5.2,0,1,1,5.2,5.2A5.21,5.21,0,0,1,140.77,171.62Zm9.14,0a3.94,3.94,0,1,0-3.94,4.19A4,4,0,0,0,149.91,171.62Zm-5.94-3h2.19c1.41,0,2.17.5,2.17,1.73a1.47,1.47,0,0,1-1.54,1.59l1.58,2.58h-1.12L145.72,172h-.66v2.54H144Zm1.1,2.52h1c.65,0,1.21-.08,1.21-.87s-.63-.81-1.19-.81h-1v1.68Z"></path></svg> 
            <h1 className='basicTitle' tabIndex={0}
              ref={(el) => {
                titleRef.current = el;
                refs.current.header = el;
              }}>AIM Portal</h1>
            <form role="search" className='searchForm' onSubmit={(e) => e.preventDefault()}>
              <input type="search" placeholder="Search.." role="searchbox" id="search"></input>
              <button className="searchBtn" aria-label="Submit Search">
                <FontAwesomeIcon icon={faMagnifyingGlass} className='searchIcon' aria-hidden="true" />
              </button>
            </form>
            <button className='profileBtn' aria-label="Settings" onClick={
                () => {
                  hasManuallyOpenedSettings.current = true;
                  setSettingsTabOpen(true);
                }
              } data-testid="settingsBtn">
              <FontAwesomeIcon icon={faBars} className='profileIcon' aria-hidden="true" />
            </button>
          </header>
      </>
    );
  }

  function BasicFooter({refs}){
    return (
      <>
          <footer className='basicFooter'>
            <h4 className='footerTitle'
            tabIndex={0}
            ref={(el) => {
              refs.current.footer = el;
            }}>Disability Resources & Contact</h4>
            <div>
              <div aria-label='Address'>
                <label tabIndex={0}>Address</label>
                <a href="https://www.google.com/maps?q=Texas+A%26M+University+471+Houston+Street,+SSB+Ste+122,+College+Station,+TX+77843-1224" target="_blank" rel="noopener noreferrer">
                  Texas A&M University<br/>
                  471 Houston Street, SSB Ste 122<br/>
                  College Station, TX 77843-1224
                </a>
              </div>
              <div aria-label='Contact & Help'>
                <p tabIndex={0} onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.currentTarget.querySelector('a')?.click();
    }
  }}>Website: <a href="https://disability.tamu.edu/" target="_blank" rel="noopener noreferrer">https://disability.tamu.edu/</a></p>
                <p tabIndex={0} onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.currentTarget.querySelector('a')?.click();
    }
  }}>Email: <a href="mailto:disability@tamu.edu" target="_blank" rel="noopener noreferrer">disability@tamu.edu</a></p>
                <p tabIndex={0} onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.currentTarget.querySelector('a')?.click();
    }
  }}>Phone: <a href="tel:(979)-845-1637" target="_blank" rel="noopener noreferrer">(979)-845-1637</a></p>
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
  App.setSettingsTabOpen = setSettingsTabOpen;
  App.tabs = tabs;
  App.currentTab = currentTab;
  App.encodeCursorSVG = encodeCursorSVG;
  App.getUser = getUser;
  App.checkAccountConnected = checkAccountConnected;
  App.setSettingsDatabase = setSettingsDatabase;
  App.setCurrentTab = setCurrentTab;

  return (
    <>
      {showAlert && <Alert message={alertMessage} setShowAlert={setShowAlert} />}
      {loading ? ( // Wrap `loading` in curly braces
        <div
        className="loadingScreen"
        role="alert"
        aria-live="assertive"
        aria-busy="true"
        tabIndex={0}
        >
        <div className="spinner" role="status" aria-label="Loading, please wait">
          <div className="spinner-icon" aria-hidden="true"></div>
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
            refs={refs}
            headerShouldFocus={headerShouldFocus}
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
