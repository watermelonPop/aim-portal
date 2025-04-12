import { useEffect, useState, useRef } from 'react';

function StudentProfile({ userInfo, settingsTabOpen }) {
        const [studentData, setStudentData] = useState(null);
        const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userInfo?.role === "STUDENT" && userInfo?.id) {
      setLoading(true);
      fetch(`/api/getStudentProfile?userId=${userInfo.id}`)
        .then(res => res.json())
        .then(data => {
          console.log("Student profile response:", data);
          setStudentData(data);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [userInfo]);

  StudentProfile.setLoading = setLoading;

        return (
        
                <div className="profileBlock">
          <h2 className="dashboardTitle">STUDENT PROFILE</h2>
          {loading ? (
            <div className="spinnerClassItem" role="status" aria-label="Loading, please wait">
            <div className="spinner-iconClassItem" aria-hidden="true"></div>
            <h3 className="spinner-textClassItem">Loading...</h3>
            </div>
          ) : (
            studentData && (
              <div className="profileContainer">
                <div className="profileField"><span className="label">UIN:</span> <span className="profileData">{studentData.uin || "N/A"}</span></div>
                <div className="profileField"><span className="label">DOB:</span> <span className="profileData">{studentData.dob ? new Date(studentData.dob).toLocaleDateString() : "N/A"}</span></div>
                <div className="profileField"><span className="label">Phone Number:</span> <span className="profileData">{studentData.phone_number || "N/A"}</span></div>
                <div className="profileField"><span className="label">Email:</span> <span className="profileData">{studentData.email || "N/A"}</span></div>
              </div>
            )
          )}
        </div>
        );
}

export default StudentProfile;