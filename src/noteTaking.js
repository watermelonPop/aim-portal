import './App.css';
import { useEffect, useState } from 'react';


function NoteTaking({userInfo}) {
        return (
            <main className='dashboardOuter'>
                {userInfo.role === "STUDENT" && <p className='dashboardTitle'>STUDENT NOTE TAKING</p>}
                {userInfo.role === "PROFESSOR" && <p className='dashboardTitle'>PROFESSOR NOTE TAKING</p>}
                {userInfo.role === "ADVISOR" && <p className='dashboardTitle'>STAFF NOTE TAKING</p>}
            </main>
        );
}

export default NoteTaking;