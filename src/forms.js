import './App.css';
import UserForms from './user/userForms.js';


function Forms({ userInfo }) {
  return (
    <main className="dashboardOuter">
      {userInfo.role === "USER" && <UserForms />}
      {userInfo.role === "STUDENT" && <p className='dashboardTitle'>STUDENT FORMS</p>}
      {userInfo.role === "PROFESSOR" && <p className='dashboardTitle'>PROFESSOR FORMS</p>}
      {userInfo.role === "ADVISOR" && <p className='dashboardTitle'>STAFF FORMS</p>}
    </main>
  );
}

export default Forms;
