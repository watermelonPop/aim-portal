
import { useEffect, useState } from 'react';
import StudentTesting from './student/studentTesting';
import ProfessorTesting from './professor/professorTesting';
import StaffTesting from './staff/staffTesting';

function Testing({userInfo, displayHeaderRef, settingsTabOpen }) {
        return (
            <main className='dashboardOuter'>
                {userInfo.role === "STUDENT" && <StudentTesting userInfo={userInfo} displayHeaderRef={displayHeaderRef} settingsTabOpen={settingsTabOpen}></StudentTesting>}
                {userInfo.role === "PROFESSOR" && <ProfessorTesting userInfo={userInfo} displayHeaderRef={displayHeaderRef} settingsTabOpen={settingsTabOpen}></ProfessorTesting>}
                {userInfo.role === "ADVISOR" && <StaffTesting userInfo={userInfo} displayHeaderRef={displayHeaderRef} settingsTabOpen={settingsTabOpen}/>}
            </main>
        );
}

export default Testing;
