import './App.css';
import { useEffect, useState } from 'react';


function Accomodations({userType}) {
        return (
            <main className='dashboardOuter'>
                {userType === "User" && <p className='dashboardTitle'>USER ACCOMMODATIONS</p>}
                {userType === "Student" && <p className='dashboardTitle'>STUDENT ACCOMMODATIONS</p>}
                {userType === "Professor" && <p className='dashboardTitle'>PROFESSOR ACCOMMODATIONS</p>}
                {userType === "Staff" && <p className='dashboardTitle'>STAFF ACCOMMODATIONS</p>}
            </main>
        );
}

export default Accomodations;