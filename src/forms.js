
import StudentForms from './student/studentForms.js';

function Forms({ userInfo, settingsTabOpen, displayHeaderRef }) {
  return (
    <main className="dashboardOuter">
      {userInfo.role === "STUDENT" && <StudentForms userInfo={userInfo} settingsTabOpen={settingsTabOpen} displayHeaderRef={displayHeaderRef} />}
    </main>
  );
}

export default Forms;
