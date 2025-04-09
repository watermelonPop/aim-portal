import { useEffect, useState, useRef } from 'react';

function ProfessorProfile({ userInfo, settingsTabOpen }) {
        const [professorData, setProfessorData] = useState(null);
        const [loading, setLoading] = useState(true);

      useEffect(() => {
        if (userInfo?.role === "PROFESSOR" && userInfo?.id) {
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
                <div className="profileField"><span className="label">Name:</span> {professorData?.account?.name || "N/A"}</div>
                <div className="profileField"><span className="label">Email:</span> {professorData?.account?.email || "N/A"}</div>
                <div className="profileField"><span className="label">Department:</span> {professorData.department || "N/A"}</div>
              </div>
            )
          )}
        </div>
        );
}

export default ProfessorProfile;