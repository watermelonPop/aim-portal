import { useEffect, useState, useRef } from 'react';

function StudentProfile({ userInfo, displayHeaderRef, settingsTabOpen, lastIntendedFocusRef }) {
        const [studentData, setStudentData] = useState(null);
        const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userInfo?.role === "STUDENT" && userInfo?.id) {
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
        const localRef = useRef(null);
  
      // If ref is passed in (from parent), use that. Otherwise use internal.
      const headingRef = displayHeaderRef || localRef;
  
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
          <h2 className="dashboardTitle" ref={headingRef}
                        tabIndex={0}>STUDENT PROFILE</h2>
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
        );
}

export default StudentProfile;