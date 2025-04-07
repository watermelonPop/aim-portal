
import { useEffect, useState, useRef } from 'react';
import UserProfile from './user/userProfile';
import StudentProfile from './student/studentProfile';
import ProfessorProfile from './professor/professorProfile';
import StaffProfile from './staff/staffProfile';

function Profile({ userInfo, settingsTabOpen }) {

  return (
    <main className="dashboardOuter">
      {userInfo.role === "USER" && <UserProfile userInfo={userInfo} settingsTabOpen={settingsTabOpen}/>}

      {userInfo.role === "STUDENT" && ( <StudentProfile userInfo={userInfo} settingsTabOpen={settingsTabOpen}/>
      )}

      {userInfo.role === "PROFESSOR" && <ProfessorProfile userInfo={userInfo} settingsTabOpen={settingsTabOpen} />}
      {userInfo.role === "ADVISOR" && <StaffProfile userInfo={userInfo} settingsTabOpen={settingsTabOpen}/>}
    </main>
  );
}

export default Profile;
