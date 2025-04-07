
import { useEffect, useRef } from 'react';

import StudentDashboard from './student/studentDashboard';
import UserDashboard from './user/userDashboard';
import ProfessorDashboard from './professor/professorDashboard';
import StaffDashboard from './staff/staffDashboard';

function Dash({ userInfo, setAlertMessage, setShowAlert, settingsTabOpen, setCurrentTab, tabs }) {


    return (
        <main className='dashboardOuter'>
            {userInfo?.role === "USER" && <UserDashboard setCurrentTab={setCurrentTab} tabs={tabs} userInfo={userInfo} settingsTabOpen={settingsTabOpen}/>}
            {userInfo?.role === "STUDENT" && <StudentDashboard userInfo={userInfo} settingsTabOpen={settingsTabOpen}/>}
            {userInfo?.role === "PROFESSOR" && <ProfessorDashboard userInfo={userInfo} settingsTabOpen={settingsTabOpen} setAlertMessage={setAlertMessage} setShowAlert={setShowAlert}/>}
            {userInfo?.role === "ADVISOR" && <StaffDashboard userInfo={userInfo} settingsTabOpen={settingsTabOpen}/>}
        </main>
    );
}

export default Dash;
