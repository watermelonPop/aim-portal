import './App.css';
import { useEffect, useState } from 'react';
import UserAccommodations from './userAccommodations';

function Accomodations({userType, name, email, setAlertMessage, setShowAlert}) {
        return (
            <main className='dashboardOuter'>
                {userType === "User" && <UserAccommodations name={name} email={email} setAlertMessage={setAlertMessage} setShowAlert={setShowAlert}/>}
                {userType === "Student" && <p className='dashboardTitle'>STUDENT ACCOMMODATIONS</p>}
                {userType === "Professor" && <p className='dashboardTitle'>PROFESSOR ACCOMMODATIONS</p>}
                {userType === "Staff" && <p className='dashboardTitle'>STAFF ACCOMMODATIONS</p>}
            </main>
        );
}

export default Accomodations;