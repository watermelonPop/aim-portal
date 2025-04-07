import { useEffect, useState, useRef } from 'react';

function ProfessorProfile({ userInfo, displayHeaderRef, settingsTabOpen, lastIntendedFocusRef }) {
        const localRef = useRef(null);
        const [professorData, setProfessorData] = useState(null);
        const [loading, setLoading] = useState(true);
  
      // If ref is passed in (from parent), use that. Otherwise use internal.
      const headingRef = displayHeaderRef || localRef;

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
  
      useEffect(() => {
          if (!headingRef.current || settingsTabOpen === true) return;
        
          if (lastIntendedFocusRef?.current !== headingRef.current) {
              lastIntendedFocusRef.current = headingRef.current;
          }
      }, [settingsTabOpen, headingRef]);
        
      useEffect(() => {
          if (!headingRef.current || settingsTabOpen === true) return;
        
          const frame = requestAnimationFrame(() => {
            const isAlertOpen = document.querySelector('[data-testid="alert"]') !== null;
        
            if (
              headingRef.current &&
              !isAlertOpen &&
              document.activeElement !== headingRef.current &&
              lastIntendedFocusRef.current === headingRef.current
            ) {
              console.log("FOCUSING DASH");
              console.log("Intent:", lastIntendedFocusRef.current, "Target:", headingRef.current);
              headingRef.current.focus();
              lastIntendedFocusRef.current = null;
            }
          });
        
          return () => cancelAnimationFrame(frame);
        }, [settingsTabOpen, headingRef]);
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
                <div className="profileField"><span className="label">Name:</span> {professorData.account.name || "N/A"}</div>
                <div className="profileField"><span className="label">Email:</span> {professorData.account.email || "N/A"}</div>
                <div className="profileField"><span className="label">Department:</span> {professorData.department || "N/A"}</div>
              </div>
            )
          )}
        </div>
        );
}

export default ProfessorProfile;