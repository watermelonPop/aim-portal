
import { useEffect, useState } from 'react';
import StudentTesting from './student/studentTesting';
import ProfessorTesting from './professor/professorTesting';
import StaffTesting from './staff/staffTesting';

function Testing({userInfo, displayHeaderRef, settingsTabOpen, lastIntendedFocusRef }) {
        return (
            <main className='dashboardOuter'>
                {userInfo.role === "STUDENT" && <p className='dashboardTitle'>STUDENT TESTING</p>}
                {userInfo.role === "PROFESSOR" && <p className='dashboardTitle'>PROFESSOR TESTING</p>}
                {userInfo.role === "ADVISOR" && <StaffTesting userInfo={userInfo}displayHeaderRef={displayHeaderRef} settingsTabOpen={settingsTabOpen} lastIntendedFocusRef={lastIntendedFocusRef}/>}
            </main>
        );
}

export default Testing;