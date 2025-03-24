import './App.css';

import StaffDash from './staff/staffDash.js';

function Dash({userInfo}) {
        return (
            <main className='dashboardOuter'>
                {userInfo?.role === "USER" && <h2 className='dashboardTitle'>USER DASHBOARD</h2>}
                {userInfo?.role === "STUDENT" && <h2 className='dashboardTitle'>STUDENT DASHBOARD</h2>}
                {userInfo?.role === "PROFESSOR" && <h2 className='dashboardTitle'>PROFESSOR DASHBOARD</h2>}
                {userInfo?.role === "ADVISOR" && <StaffDash/>}
            </main>
        );
}

export default Dash;
