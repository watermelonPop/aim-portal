
import { useEffect, useState, useRef } from 'react';
import StudentProfile from './student/studentProfile';
import ProfessorProfile from './professor/professorProfile';
import StaffProfile from './staff/staffProfile';

function Profile({ userInfo, settingsTabOpen }) {

  //tab-${tab.name}

  useEffect(() => {
    const isAlertOpen = document.querySelector('[data-testid="alert"]') !== null;
    if (!isAlertOpen && !settingsTabOpen) {
      const timeout = setTimeout(() => {
        document.getElementById("tab-Profile").focus();
      }, 100); // slight delay to ensure render
      return () => clearTimeout(timeout);
    }
  }, []);

  return (
    <main className="dashboardOuter">

      {userInfo.role === "STUDENT" && ( <StudentProfile userInfo={userInfo} settingsTabOpen={settingsTabOpen}/>
      )}

      {userInfo.role === "PROFESSOR" && <ProfessorProfile userInfo={userInfo} settingsTabOpen={settingsTabOpen} />}
      {userInfo.role === "ADVISOR" && <StaffProfile userInfo={userInfo} settingsTabOpen={settingsTabOpen}/>}
    </main>
  );
}

export default Profile;
