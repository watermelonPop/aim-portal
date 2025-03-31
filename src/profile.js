import './App.css';
import { useEffect, useState } from 'react';

function Profile({ userInfo }) {
  const [studentData, setStudentData] = useState(null);
  const [professorData, setProfessorData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userInfo?.role === "STUDENT" && userInfo?.id) {
      fetch(`/api/getStudentProfile?userId=${userInfo.id}`)
        .then(res => res.json())
        .then(data => {
          console.log("Student profile response:", data);
          setStudentData(data);
          setLoading(false);
        });
    }
    else if (userInfo?.role === "PROFESSOR" && userInfo?.id) {
      fetch(`/api/getProfessorData?userId=${userInfo.id}`)
        .then(res => res.json())
        .then(data => {
          console.log("Professor Profile Response: ", data);
          setProfessorData(data);
          setLoading(false);
        });
    }
     else {
      setLoading(false);
    }
  }, [userInfo]);

  return (
    <main className="dashboardOuter">
      {userInfo.role === "USER" && <p className="dashboardTitle">USER PROFILE</p>}

      {userInfo.role === "STUDENT" && (
        <div className="profileBlock">
          <h2 className="dashboardTitle">STUDENT PROFILE</h2>
          {loading ? (
            <div className="loadingScreen">
              <div className="spinner">
                <div className="spinner-icon"></div>
                <p className="spinner-text">Loading profile information...</p>
              </div>
            </div>
          ) : (
            studentData && (
              <div className="profileContainer">
                <div className="profileField"><span className="label">UIN:</span> {studentData.uin || "N/A"}</div>
                <div className="profileField"><span className="label">DOB:</span> {studentData.dob ? new Date(studentData.dob).toLocaleDateString() : "N/A"}</div>
                <div className="profileField"><span className="label">Phone Number:</span> {studentData.phone_number || "N/A"}</div>
                <div className="profileField"><span className="label">Email:</span> {studentData.email || "N/A"}</div>
              </div>
            )
          )}
        </div>
      )}

      {userInfo.role === "PROFESSOR" && (
        <div className="profileBlock">
          <h2 className="dashboardTitle">PROFESSOR PROFILE</h2>
          {loading ? (
            <div className="loadingScreen">
              <div className="spinner">
                <div className="spinner-icon"></div>
                <p className="spinner-text">Loading profile information...</p>
              </div>
            </div>
          ) : (
            professorData && (
              <div className="profileContainer">
                <div className="profileField"><span className="label">Name:</span> {professorData.account.name || "N/A"}</div>
                <div className="profileField"><span className="label">Email:</span> {professorData.account.email || "N/A"}</div>
                <div className="profileField"><span className="label">Department:</span> {professorData.department || "N/A"}</div>
              </div>
            )
          )}
        </div>
      )}

      {/* {userInfo.role === "PROFESSOR" && <p className="dashboardTitle">PROFESSOR PROFILE</p>} */}
      {userInfo.role === "ADVISOR" && <p className="dashboardTitle">STAFF PROFILE</p>}
    </main>
  );
}

export default Profile;
