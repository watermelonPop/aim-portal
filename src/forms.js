
import StudentForms from './student/studentForms.js';

function Forms({ userInfo, settingsTabOpen }) {
  return (
    <main className="dashboardOuter">
      {userInfo.role === "STUDENT" && <StudentForms userInfo={userInfo} settingsTabOpen={settingsTabOpen} />}
    </main>
  );
}

export default Forms;
