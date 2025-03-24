import './App.css';
import { useEffect, useState } from 'react';

function Profile({ userInfo }) {
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    if (userInfo?.role === "STUDENT" && userInfo?.id) {
      fetch(`/api/getStudentProfile?userId=${userInfo.id}`)
        .then(res => res.json())
        .then(data => {
          console.log("Student profile response:", data);
          setStudentData(data);
        });
    }
  }, [userInfo]);

  return (
    <main className="dashboardOuter">
        {userInfo.role === "USER" && <p className="dashboardTitle">USER PROFILE</p>}
        
        {userInfo.role === "STUDENT" && studentData && (
            <div className="profileContainer">
            <h2 className="dashboardTitle">STUDENT PROFILE</h2>
            <div className="profileField"><span className="label">UIN:</span> {studentData.uin || "N/A"}</div>
            <div className="profileField"><span className="label">DOB:</span> {studentData.dob ? new Date(studentData.dob).toLocaleDateString() : "N/A"}</div>
            <div className="profileField"><span className="label">Phone Number:</span> {studentData.phone_number || "N/A"}</div>
            <div className="profileField"><span className="label">Email:</span> {studentData.email || "N/A"}</div>
            </div>
        )}

        {userInfo.role === "PROFESSOR" && <p className="dashboardTitle">PROFESSOR PROFILE</p>}
        {userInfo.role === "ADVISOR" && <p className="dashboardTitle">STAFF PROFILE</p>}
    </main>
  );
}

export default Profile;
