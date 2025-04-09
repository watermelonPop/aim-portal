
import { useEffect, useRef } from 'react';

import StudentDashboard from './student/studentDashboard';
import UserDashboard from './user/userDashboard';
import ProfessorDashboard from './professor/professorDashboard';
import StaffDashboard from './staff/staffDashboard';

function Dash({ userInfo, setAlertMessage, setShowAlert, settingsTabOpen, setCurrentTab, tabs, displayHeaderRef }) {


    return (
        <main className='dashboardOuter'>
            {userInfo?.role === "USER" && <UserDashboard setCurrentTab={setCurrentTab} tabs={tabs} userInfo={userInfo} settingsTabOpen={settingsTabOpen} displayHeaderRef={displayHeaderRef}/>}
            {userInfo?.role === "STUDENT" && <StudentDashboard userInfo={userInfo} settingsTabOpen={settingsTabOpen} displayHeaderRef={displayHeaderRef}/>}
            {userInfo?.role === "PROFESSOR" && <ProfessorDashboard userInfo={userInfo} settingsTabOpen={settingsTabOpen} setAlertMessage={setAlertMessage} setShowAlert={setShowAlert} displayHeaderRef={displayHeaderRef}/>}
            {userInfo?.role === "ADVISOR" && <StaffDashboard userInfo={userInfo} settingsTabOpen={settingsTabOpen} displayHeaderRef={displayHeaderRef}/>}
        </main>
    );
}

export default Dash;
