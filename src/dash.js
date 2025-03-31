import './App.css';
import { useEffect, useState } from 'react';
import StudentDashboard from './studentDashboard';

function Dash({userInfo}) {
        return (
            <main className='dashboardOuter'>
                {userInfo?.role === "USER" && <h2 className='dashboardTitle'>USER DASHBOARD</h2>}
                {userInfo?.role === "STUDENT" && <StudentDashboard userInfo={userInfo} />}
                {userInfo?.role === "PROFESSOR" && <h2 className='dashboardTitle'>PROFESSOR DASHBOARD</h2>}
                {userInfo?.role === "ADVISOR" && <h2 className='dashboardTitle'>STAFF DASHBOARD</h2>}
            </main>
        );
}

export default Dash;