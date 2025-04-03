import './App.css';
import { useEffect, useState } from 'react';

import StaffTesting from "./staff/staffTesting.js"

function Testing({userInfo}) {
        return (
            <main className='dashboardOuter'>
                {userInfo.role === "STUDENT" && <p className='dashboardTitle'>STUDENT TESTING</p>}
                {userInfo.role === "PROFESSOR" && <p className='dashboardTitle'>PROFESSOR TESTING</p>}
                {userInfo.role === "ADVISOR" && <StaffTesting userId={userInfo.userId}/>}
            </main>
        );
}

export default Testing;