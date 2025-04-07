
import { useEffect, useState, useRef } from 'react';
import UserProfile from './user/userProfile';
import StudentProfile from './student/studentProfile';
import ProfessorProfile from './professor/professorProfile';
import StaffProfile from './staff/staffProfile';

function Profile({ userInfo, displayHeaderRef, settingsTabOpen, lastIntendedFocusRef }) {

  return (
    <main className="dashboardOuter">
      {userInfo.role === "USER" && <UserProfile userInfo={userInfo} displayHeaderRef={displayHeaderRef} settingsTabOpen={settingsTabOpen} lastIntendedFocusRef={lastIntendedFocusRef}/>}

      {userInfo.role === "STUDENT" && ( <StudentProfile userInfo={userInfo} displayHeaderRef={displayHeaderRef} settingsTabOpen={settingsTabOpen} lastIntendedFocusRef={lastIntendedFocusRef}/>
      )}

      {userInfo.role === "PROFESSOR" && <ProfessorProfile userInfo={userInfo} displayHeaderRef={displayHeaderRef} settingsTabOpen={settingsTabOpen} lastIntendedFocusRef={lastIntendedFocusRef}/>}
      {userInfo.role === "ADVISOR" && <StaffProfile userInfo={userInfo} displayHeaderRef={displayHeaderRef} settingsTabOpen={settingsTabOpen} lastIntendedFocusRef={lastIntendedFocusRef}/>}
    </main>
  );
}

export default Profile;
