import './App.css';
import { useEffect, useState } from 'react';

function Forms({userType}) {
        return (
            <main className='dashboardOuter'>
                {userType === "User" && <p className='dashboardTitle'>USER FORMS</p>}
                {userType === "Student" && <p className='dashboardTitle'>STUDENT FORMS</p>}
                {userType === "Staff" && <p className='dashboardTitle'>STAFF FORMS</p>}
            </main>
        );
}
export default Forms;