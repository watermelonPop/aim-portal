import './App.css';
import { useEffect, useState } from 'react';


function Dash({userType}) {
        return (
            <main className='dashboardOuter'>
                {userType === "User" && <h2 className='dashboardTitle'>USER DASHBOARD</h2>}
                {userType === "Student" && <h2 className='dashboardTitle'>STUDENT DASHBOARD</h2>}
                {userType === "Professor" && <h2 className='dashboardTitle'>PROFESSOR DASHBOARD</h2>}
                {userType === "Staff" && <h2 className='dashboardTitle'>STAFF DASHBOARD</h2>}
            </main>
        );
}

export default Dash;