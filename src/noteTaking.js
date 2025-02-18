import './App.css';
import { useEffect, useState } from 'react';


function NoteTaking({userType}) {
        return (
            <main className='dashboardOuter'>
                {userType === "Student" && <p className='dashboardTitle'>STUDENT NOTE TAKING</p>}
                {userType === "Professor" && <p className='dashboardTitle'>PROFESSOR NOTE TAKING</p>}
                {userType === "Staff" && <p className='dashboardTitle'>STAFF NOTE TAKING</p>}
            </main>
        );
}

export default NoteTaking;