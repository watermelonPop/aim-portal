import { useEffect, useState, useRef } from 'react';

function ProfessorProfile({ userInfo, settingsTabOpen }) {
        const [professorData, setProfessorData] = useState(null);
        const [loading, setLoading] = useState(true);

      useEffect(() => {
        if (userInfo?.role === "PROFESSOR" && userInfo?.id) {
          fetch(`/api/getProfessorData?userId=${userInfo.id}`)
            .then(res => res.json())
            .then(data => {
              //console.log("Professor Profile Response: ", data);
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
            <div className="spinnerClassItem" role="status" aria-label="Loading, please wait">
            <div className="spinner-iconClassItem" aria-hidden="true"></div>
            <h3 className="spinner-textClassItem">Loading...</h3>
            </div>
          ) : (
            professorData && (
              <div className="profileContainer">
                <div className="profileField"><span className="label">Name:</span> <span className="profileData">{professorData?.account?.name || "N/A"}</span></div>
                <div className="profileField"><span className="label">Email:</span> <span className="profileData">{professorData?.account?.email || "N/A"}</span></div>
                <div className="profileField"><span className="label">Department:</span> <span className="profileData">{professorData.department || "N/A"}</span></div>
              </div>
            )
          )}
        </div>
        );
}

export default ProfessorProfile;