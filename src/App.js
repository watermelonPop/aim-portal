import logo from './logo.png';
import logo2 from './logo2.png';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faUser, faMagnifyingGlass, faBars} from '@fortawesome/free-solid-svg-icons';
let loggedIn = true;

function App() {
  return (
    <>
      {loggedIn === false ? (
        loginScreen()
      ) : (
        basicView()
      )}
    </>
  );
}

function loginScreen(){
  return (
    <>
      <main className='loginScreen'>
        <header className='loginHeader' role="heading">
          <img src={logo} alt="TAMU Logo" className='logoImg'/>
          <h1 className='loginTitle'>AIM Portal</h1>
        </header>
        <button type="button" id="loginBtn" aria-labelledby="log in">log in</button>
      </main>
    </>
  );
}

function basicView(){
  return (
    <>
      <main className='basicScreen'>
      {
        basicHeader()
      }
      </main>
    </>
  );
}

function basicHeader(){
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
            <FontAwesomeIcon icon={faBars} className='profileIcon' aria-hidden="true" />
          </button>
        </header>
    </>
  );
}


export default App;
