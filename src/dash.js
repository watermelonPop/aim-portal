import './App.css';
import { useEffect, useState } from 'react';


function Dash({userType}) {
        return (
            <main className="dashboardOuter">

            {userType === "User" && <p className="dashboardTitle">USER DASHBOARD</p>}
            {userType === "Student" && <p className="dashboardTitle">STUDENT DASHBOARD</p>}
            {userType === "Professor" && <p className="dashboardTitle">PROFESSOR DASHBOARD</p>}
            {userType === "Staff" && <p className="dashboardTitle">STAFF DASHBOARD</p>}

            {(userType === "User" || userType === "Student" || userType === "Professor") && (
                <div className="alertsContainer">
                    <p className="alertsPlaceholder">No alerts available</p>
                </div>
            )}
        </main>
        );
}

export default Dash;