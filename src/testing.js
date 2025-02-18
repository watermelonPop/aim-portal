import './App.css';
import { useEffect, useState } from 'react';


function Testing({userType}) {
        return (
            <main className='dashboardOuter'>
                {userType === "Student" && <p className='dashboardTitle'>STUDENT TESTING</p>}
                {userType === "Professor" && <p className='dashboardTitle'>PROFESSOR TESTING</p>}
                {userType === "Staff" && <p className='dashboardTitle'>STAFF TESTING</p>}
            </main>
        );
}

export default Testing;