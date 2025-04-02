
import { useEffect, useState, useCallback } from 'react';
import UserAccommodations from './user/userAccommodations';
import StudentAccommodations from './student/studentAccommodations';
import ProfessorAccommodations from './professor/professorAccommodations';
import StaffAccommodations from './staff/staffAccommodations';

export function Accommodations({ userInfo, setAlertMessage, setShowAlert, displayHeaderRef, settingsTabOpen, lastIntendedFocusRef }) {

  return (
    <main className='dashboardOuter' data-testid='basicAccommodations' id='basicAccommodations'>
      {userInfo.role === "USER" && (
        <UserAccommodations
          userInfo={userInfo}
          setAlertMessage={setAlertMessage}
          setShowAlert={setShowAlert}
          displayHeaderRef={displayHeaderRef}
          settingsTabOpen={settingsTabOpen}
          lastIntendedFocusRef={lastIntendedFocusRef}
        />
      )}

      {userInfo.role === "STUDENT" && (
        <StudentAccommodations
          userInfo={userInfo}
          setAlertMessage={setAlertMessage}
          setShowAlert={setShowAlert}
          displayHeaderRef={displayHeaderRef}
          settingsTabOpen={settingsTabOpen}
          lastIntendedFocusRef={lastIntendedFocusRef}
        />
      )}
      
      {userInfo.role === "PROFESSOR" && (
        <ProfessorAccommodations userInfo={userInfo}
        setAlertMessage={setAlertMessage}
        setShowAlert={setShowAlert}
        displayHeaderRef={displayHeaderRef}
        settingsTabOpen={settingsTabOpen}
        lastIntendedFocusRef={lastIntendedFocusRef}/>
      )}

      {userInfo.role === "ADVISOR" && <StaffAccommodations
          userInfo={userInfo}
          setAlertMessage={setAlertMessage}
          setShowAlert={setShowAlert}
          displayHeaderRef={displayHeaderRef}
          settingsTabOpen={settingsTabOpen}
          lastIntendedFocusRef={lastIntendedFocusRef}
        />}
    </main>
  );
}

export default Accommodations;
