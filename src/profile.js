import './App.css';
import { useEffect, useState } from 'react';

function Profile({userType}) {
        return (
            <main className='dashboardOuter'>
                {userType === "User" && <p className='dashboardTitle'>USER PROFILE</p>}
                {userType === "Student" && <p className='dashboardTitle'>STUDENT PROFILE</p>}
                {userType === "Professor" && <p className='dashboardTitle'>PROFESSOR PROFILE</p>}
                {userType === "Staff" && <p className='dashboardTitle'>STAFF PROFILE</p>}
            </main>
        );
}

export default Profile;