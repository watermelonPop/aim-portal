
import { useEffect, useState, useCallback } from 'react';
import UserAccommodations from './user/userAccommodations';
import StudentAccommodations from './student/studentAccommodations';
import ProfessorAccommodations from './professor/professorAccommodations';

export function Accommodations({ userInfo, setAlertMessage, setShowAlert, settingsTabOpen, displayHeaderRef }) {

  return (
    <main className='dashboardOuter' data-testid='basicAccommodations' id='basicAccommodations'>
      {userInfo.role === "USER" && (
        <UserAccommodations
          userInfo={userInfo}
          setAlertMessage={setAlertMessage}
          setShowAlert={setShowAlert}
          settingsTabOpen={settingsTabOpen}
          displayHeaderRef={displayHeaderRef}
        />
      )}

      {userInfo.role === "STUDENT" && (
        <StudentAccommodations
          userInfo={userInfo}
          setAlertMessage={setAlertMessage}
          setShowAlert={setShowAlert}
          settingsTabOpen={settingsTabOpen}
          displayHeaderRef={displayHeaderRef}
        />
      )}
      
      {userInfo.role === "PROFESSOR" && (
        <ProfessorAccommodations userInfo={userInfo}
        setAlertMessage={setAlertMessage}
        setShowAlert={setShowAlert}
        settingsTabOpen={settingsTabOpen}
        displayHeaderRef={displayHeaderRef}/>
      )}
    </main>
  );
}

export default Accommodations;
