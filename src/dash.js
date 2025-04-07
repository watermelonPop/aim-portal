
import { useEffect, useRef } from 'react';

import StudentDashboard from './student/studentDashboard';
import UserDashboard from './user/userDashboard';
import ProfessorDashboard from './professor/professorDashboard';
import StaffDashboard from './staff/staffDashboard';

function Dash({ userInfo, setAlertMessage, setShowAlert, displayHeaderRef, settingsTabOpen, lastIntendedFocusRef, setCurrentTab, tabs }) {


    return (
        <main className='dashboardOuter'>
            {userInfo?.role === "USER" && <UserDashboard setCurrentTab={setCurrentTab} tabs={tabs} userInfo={userInfo} displayHeaderRef={displayHeaderRef} settingsTabOpen={settingsTabOpen} lastIntendedFocusRef={lastIntendedFocusRef}/>}
            {userInfo?.role === "STUDENT" && <StudentDashboard userInfo={userInfo} displayHeaderRef={displayHeaderRef} settingsTabOpen={settingsTabOpen} lastIntendedFocusRef={lastIntendedFocusRef}/>}
            {userInfo?.role === "PROFESSOR" && <ProfessorDashboard userInfo={userInfo} displayHeaderRef={displayHeaderRef} settingsTabOpen={settingsTabOpen} lastIntendedFocusRef={lastIntendedFocusRef} setAlertMessage={setAlertMessage} setShowAlert={setShowAlert}/>}
            {userInfo?.role === "ADVISOR" && <StaffDashboard userInfo={userInfo} displayHeaderRef={displayHeaderRef} settingsTabOpen={settingsTabOpen} lastIntendedFocusRef={lastIntendedFocusRef}/>}
        </main>
    );
}

export default Dash;
