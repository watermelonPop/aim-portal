
import UserForms from './user/userForms.js';
import StudentForms from './student/studentForms.js';
import StaffForms from './staff/staffForms.js';

function Forms({ userInfo, displayHeaderRef, settingsTabOpen, lastIntendedFocusRef }) {
  return (
    <main className="dashboardOuter">
      {userInfo.role === "USER" && <UserForms displayHeaderRef={displayHeaderRef} settingsTabOpen={settingsTabOpen} lastIntendedFocusRef={lastIntendedFocusRef} />}
      {userInfo.role === "STUDENT" && <StudentForms displayHeaderRef={displayHeaderRef} settingsTabOpen={settingsTabOpen} lastIntendedFocusRef={lastIntendedFocusRef} />}
      {userInfo.role === "ADVISOR" && <StaffForms displayHeaderRef={displayHeaderRef} settingsTabOpen={settingsTabOpen} lastIntendedFocusRef={lastIntendedFocusRef} />}
    </main>
  );
}

export default Forms;
