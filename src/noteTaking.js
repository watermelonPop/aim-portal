
import { useEffect, useState } from 'react';
import StudentNoteTaking from './student/studentNoteTaking';
import ProfessorNoteTaking from './professor/professorNoteTaking';
import StaffNoteTaking from './staff/staffNoteTaking';

function NoteTaking({userInfo, displayHeaderRef, settingsTabOpen, lastIntendedFocusRef}) {
        return (
            <main className='dashboardOuter'>
                {userInfo.role === "STUDENT" && <StudentNoteTaking userInfo={userInfo} displayHeaderRef={displayHeaderRef} settingsTabOpen={settingsTabOpen} lastIntendedFocusRef={lastIntendedFocusRef}/>}
                {userInfo.role === "PROFESSOR" && <ProfessorNoteTaking userInfo={userInfo} displayHeaderRef={displayHeaderRef} settingsTabOpen={settingsTabOpen} lastIntendedFocusRef={lastIntendedFocusRef}/>}
                {userInfo.role === "ADVISOR" && <StaffNoteTaking userInfo={userInfo} displayHeaderRef={displayHeaderRef} settingsTabOpen={settingsTabOpen} lastIntendedFocusRef={lastIntendedFocusRef}/>}
            </main>
        );
}

export default NoteTaking;