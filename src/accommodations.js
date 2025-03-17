import './App.css';
import { useEffect, useState } from 'react';
import UserAccommodations from './userAccommodations';

export function Accommodations({userType, name, email, setAlertMessage, setShowAlert}) {
        return (
            <main className='dashboardOuter' data-testid='basicAccommodations'>
                {userType === "User" && <UserAccommodations name={name} email={email} setAlertMessage={setAlertMessage} setShowAlert={setShowAlert}/>}
                {userType === "Student" && <p className='dashboardTitle'>STUDENT ACCOMMODATIONS</p>}
                {userType === "Professor" && <p className='dashboardTitle'>PROFESSOR ACCOMMODATIONS</p>}
                {userType === "Staff" && <p className='dashboardTitle'>STAFF ACCOMMODATIONS</p>}
            </main>
        );
}

export default Accommodations;