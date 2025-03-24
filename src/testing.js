import './App.css';
import { useEffect, useState } from 'react';


function Testing({userInfo}) {
        return (
            <main className='dashboardOuter'>
                {userInfo.role === "STUDENT" && <p className='dashboardTitle'>STUDENT TESTING</p>}
                {userInfo.role === "PROFESSOR" && <p className='dashboardTitle'>PROFESSOR TESTING</p>}
                {userInfo.role === "ADVISOR" && <p className='dashboardTitle'>STAFF TESTING</p>}
            </main>
        );
}

export default Testing;