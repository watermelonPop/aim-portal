import './App.css';
import StudentForms from './student/studentForms.js';


function Forms({ userInfo }) {
  return (
    <main className="dashboardOuter">
      {userInfo.role === "STUDENT" && <StudentForms userInfo={userInfo}/>}
      {userInfo.role === "USER" && <p className='dashboardTitle'>STUDENT FORMS</p>}
      {userInfo.role === "PROFESSOR" && <p className='dashboardTitle'>PROFESSOR FORMS</p>}
      {userInfo.role === "ADVISOR" && <p className='dashboardTitle'>STAFF FORMS</p>}
    </main>
  );
}

export default Forms;
