import './App.css';

import StaffDash from './staff/staffDash.js';

function Dash({ userType }) {
  return (
    <main className="dashboardOuter">
      {/* {userType === "User" && <UserDash />} */}
      {/* {userType === "Student" && <StudentDash />} */}
      {/* {userType === "Professor" && <ProfessorDash />} */}
      {userType === "Staff" && <StaffDash />}
    </main>
  );
}

export default Dash;
