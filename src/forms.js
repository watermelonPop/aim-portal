import './App.css';
import UserForms from './user/userForms.js';
// import StaffForms from './StaffForms';
// import ProfessorForms from './ProfessorForms';

function Forms({ userType }) {
  return (
    <main className="dashboardOuter">
      {userType === "User" && <UserForms />}
      {/* {userType === "Staff" && <StaffForms />} */}
      {/* {userType === "Professor" && <ProfessorForms />} */}
    </main>
  );
}

export default Forms;
