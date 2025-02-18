import logo from './logo.png';
import logo2 from './logo2.png';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faUser, faMagnifyingGlass, faBars} from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import Dash from './dash';
import Profile from './profile';
import LoginScreen from './loginScreen';
import Forms from './forms';
import GlobalSettings from './globalSettings';
import Accomodations from './accommodations';
import NoteTaking from './noteTaking';
import AssistiveTech from './assistiveTech';
import Testing from './testing';
import StudentCases from './studentCases';


function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [tabs, setTabs] = useState([]);
  const [userType, setUserType] = useState("User");
  const [userTabs, setUserTabs] = useState([
    {name: 'Dashboard', elem: <Dash userType={"User"}/>},
    {name: 'Accommodations', elem: <Accomodations userType={"User"}/>},
    {name: 'Forms', elem: <Forms userType={"User"}/>},
    {name: 'Profile', elem: <Profile userType={"User"}/>},
  ]);
  const [studentTabs, setStudentTabs] = useState([
    {name: 'Dashboard', elem: <Dash userType={"Student"}/>},
    {name: 'Accommodations', elem: <Accomodations userType={"Student"}/>},
    {name: 'Testing', elem: <Testing userType={"Student"}/>},
    {name: 'Note Taking',elem: <NoteTaking userType={"Student"}/>},
    {name: 'Forms', elem: <Forms userType={"Student"}/>},
    {name: 'Profile', elem: <Profile userType={"Student"}/>},
  ]);
  const [professorTabs, setProfessorTabs] = useState([
    {name: 'Dashboard', elem: <Dash userType={"Professor"}/>},
    {name: 'Accommodations', elem: <Accomodations userType={"Professor"}/>},
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
    {access: 'Accommodations', hasAccess: false, elem: <Accomodations userType={"Staff"}/>},
    {access: 'Note Taking', hasAccess: false, elem: <NoteTaking userType={"Staff"}/>},
    {access: 'Assistive Technology', hasAccess: false, elem: <AssistiveTech/>},
    {access: 'Accessible Testing', hasAccess: false, elem: <Testing userType={"Staff"}/>},
    {access: 'Student Cases', hasAccess: false, elem: <StudentCases/>},
  ]);

  useEffect(() => {
    if(!loggedIn){
      return;
    }
    if(userType == "User"){
      setTabs(userTabs);
      setCurrentTab(userTabs[0]);
    }else if(userType == "Student"){
      setTabs(studentTabs);
      setCurrentTab(studentTabs[0]);
    }else if(userType == "Professor"){
      setTabs(professorTabs);
      setCurrentTab(professorTabs[0]);
    }else if(userType == "Staff"){
      //check for staff access & set here
      let newStaffTabs = [...staffTabs];
      for(let i = 0; i < staffAccess.length; i++){
        if(staffAccess[i].hasAccess == true){
          newStaffTabs.push({name: staffAccess[i].access, elem: staffAccess[i].elem});
        }
      }
      setTabs(newStaffTabs);
      setCurrentTab(newStaffTabs[0]);
    }
    return () => {
    };
  }, [loggedIn, userType]);

  function setStaffRoles({ staffRole }) {
    let newStaffAccess = {...staffAccess}
    if(staffRole == "Admin"){
      for(let i = 0; i < newStaffAccess.length; i++){
        newStaffAccess[i].hasAccess = true;
      }
    }else if(staffRole == "Coordinator"){
      for(let i = 0; i < newStaffAccess.length; i++){
        if(newStaffAccess[i].access != "Global Settings"){
          newStaffAccess[i].hasAccess = true;
        }
      }
    }else if(staffRole == "Testing Staff"){
      for(let i = 0; i < newStaffAccess.length; i++){
        if(newStaffAccess[i].access == "Accessible Testing" || newStaffAccess[i].access == "Student Cases"){
          newStaffAccess[i].hasAccess = true;
        }
      }
    }else if(staffRole == "Assistive Technology"){
      for(let i = 0; i < newStaffAccess.length; i++){
        if(newStaffAccess[i].access == "Assistive Technology" || newStaffAccess[i].access == "Student Cases"){
          newStaffAccess[i].hasAccess = true;
        }
      }
    }
    setStaffAccess(newStaffAccess);
  }

  return (
    <>
      {loggedIn ? <BasicView 
          currentTab={currentTab} 
          setCurrentTab={setCurrentTab}
          userType={userType}
          tabs={tabs}
        /> : <LoginScreen setLoggedIn={setLoggedIn} setUserType={setUserType} setStaffRoles={setStaffRoles}/>}
    </>
  );
}


function BasicView({ currentTab, setCurrentTab, userType, tabs }) {
  return (
    <main className='basicScreen'>
      <BasicHeader />
      <BasicTabNav tabs={tabs} setCurrentTab={setCurrentTab} />
      <BasicSettingsBar />
      <Display currentTab={currentTab} />
      <BasicFooter/>
    </main>
  );
}

function Display({ currentTab }) {
  return currentTab ? currentTab.elem : null;
}

function BasicTabNav({tabs, setCurrentTab}){
  return (
    <>
      <nav role="navigation" className='tabNav'>
        <ul role="menubar">
          {Array.isArray(tabs) ? tabs.map((tab, index) => (
            <li key={index} role="menuitem" onClick={() => setCurrentTab(tab)}>
              {tab.name}
            </li>
          )) : <li>No tabs available</li>}
        </ul>
      </nav>
    </>
  );
}



function BasicSettingsBar(){
  return (
    <>
      <nav role="dialog" aria-label='Settings' className='settingsNav' id='settings' aria-hidden='true'>
        <button onClick={
              () => {
                  document.getElementById('settings').style.display = "none";
              }
            }>x</button>
        <h2>Settings</h2>
      </nav>
    </>
  );
}

function BasicHeader(){
  return (
    <>
        <header className='basicHeader'>
          <img src={logo2} alt="TAMU Logo" className='basicLogoImg' aria-label='TAMU'/>
          <h1 className='basicTitle'>AIM Portal</h1>
          <form role="search" className='searchForm'>
            <input type="search" placeholder="Search.." role="searchbox" id="search"></input>
            <button className="searchBtn" aria-label="Submit Search">
              <FontAwesomeIcon icon={faMagnifyingGlass} className='searchIcon' aria-hidden="true" />
            </button>
          </form>
          <button className='profileBtn' aria-label="Profile">
            <FontAwesomeIcon icon={faBars} className='profileIcon' aria-hidden="true" onClick={
              () => {
                if(document.getElementById('settings').style.display == "none" || document.getElementById('settings').style.display == ""){
                  document.getElementById('settings').style.display = "flex";
                }
                else{
                  document.getElementById('settings').style.display = "none";
                }
              }
            } />
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




export default App;
