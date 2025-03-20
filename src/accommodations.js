import './App.css';
import { useEffect, useState } from 'react';
import UserAccommodations from './userAccommodations';

export function Accommodations({userInfo, setAlertMessage, setShowAlert}) {
        return (
            <main className='dashboardOuter' data-testid='basicAccommodations'>
                {userInfo.role === "USER" && <UserAccommodations userInfo={userInfo} setAlertMessage={setAlertMessage} setShowAlert={setShowAlert}/>}
                {userInfo.role === "STUDENT" && <p className='dashboardTitle'>STUDENT ACCOMMODATIONS</p>}
                {userInfo.role === "PROFESSOR" && <p className='dashboardTitle'>PROFESSOR ACCOMMODATIONS</p>}
                {userInfo.role === "ADVISOR" && <p className='dashboardTitle'>STAFF ACCOMMODATIONS</p>}
            </main>
        );
}

export default Accommodations;