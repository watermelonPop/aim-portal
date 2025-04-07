
import StudentForms from './student/studentForms.js';
import StaffForms from './staff/staffForms.js';

function Forms({ userInfo, displayHeaderRef, settingsTabOpen, lastIntendedFocusRef }) {
  return (
    <main className="dashboardOuter">
      {userInfo.role === "STUDENT" && <StudentForms userInfo={userInfo} displayHeaderRef={displayHeaderRef} settingsTabOpen={settingsTabOpen} lastIntendedFocusRef={lastIntendedFocusRef} />}
      {userInfo.role === "ADVISOR" && <StaffForms displayHeaderRef={displayHeaderRef} settingsTabOpen={settingsTabOpen} lastIntendedFocusRef={lastIntendedFocusRef} />}
    </main>
  );
}

export default Forms;
