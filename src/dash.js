import './App.css';

import StaffDash from './staff/staffDash.js';
import { useEffect, useState } from 'react';
import StudentDashboard from './studentDashboard';

function Dash({userInfo}) {
        return (
            <main className='dashboardOuter'>
                {userInfo?.role === "USER" && <h2 className='dashboardTitle'>USER DASHBOARD</h2>}
                {userInfo?.role === "STUDENT" && <StudentDashboard userInfo={userInfo} />}
                {userInfo?.role === "PROFESSOR" && <h2 className='dashboardTitle'>PROFESSOR DASHBOARD</h2>}
                {userInfo?.role === "ADVISOR" && <StaffDash/>}
            </main>
        );
}

export default Dash;
