import './App.css';
import UserForms from './user/userForms.js';


function Forms({ userType }) {
  return (
    <main className="dashboardOuter">
      {userType === "User" && <UserForms />}

    </main>
  );
}

export default Forms;
