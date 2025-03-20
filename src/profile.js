import './App.css';
import { useEffect, useState } from 'react';

function Profile({userInfo}) {
        return (
            <main className='dashboardOuter'>
                {userInfo.role === "USER" && <p className='dashboardTitle'>USER PROFILE</p>}
                {userInfo.role === "STUDENT" && <p className='dashboardTitle'>STUDENT PROFILE</p>}
                {userInfo.role === "PROFESSOR" && <p className='dashboardTitle'>PROFESSOR PROFILE</p>}
                {userInfo.role === "ADVISOR" && <p className='dashboardTitle'>STAFF PROFILE</p>}
            </main>
        );
}

export default Profile;