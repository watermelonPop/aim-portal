import { useEffect, useState, useRef } from 'react';

function StaffProfile({ userInfo, displayHeaderRef, settingsTabOpen, lastIntendedFocusRef }) {
        const localRef = useRef(null);
        const [staffData, setStaffData] = useState(null);
        const [loading, setLoading] = useState(true);
  
      // If ref is passed in (from parent), use that. Otherwise use internal.
      const headingRef = displayHeaderRef || localRef;
      // ================================================ DONT TOUCH ================================================
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

        
  
      // If ref is passed in (from parent), use that. Otherwise use internal.

        useEffect(() => {
          if (userInfo?.role === "ADVISOR" && userInfo?.id) {
            fetch(`/api/getStaffData?userId=${userInfo.id}`)
              .then(res => res.json())
              .then(data => {
                // console.log("Advisor Profile Response: ", data);
                setStaffData(data);
                setLoading(false);
              });
          }
          else {
            setLoading(false);
          }
        }, [userInfo]);





        return (
          <div className="profileBlock">
          <h2 className="dashboardTitle">Staff Profile</h2>
          {loading ? (
            <div className="loadingScreen">
              <div className="spinner">
                <div className="spinner-icon"></div>
                <p className="spinner-text">Loading profile information...</p>
              </div>
            </div>
          ) : (
            staffData && (
              <div className="profileContainer">
                <div className="profileField"><span className="label">Name:</span> {staffData.account.name || "N/A"}</div>
                <div className="profileField"><span className="label">Email:</span> {staffData.account.email || "N/A"}</div>
                <div className="profileField"><span className="label">Role:</span> {staffData.role || "N/A"}</div>
                <div className="profileField"><span className="label">Permissions:</span></div>
                <div className="profileField"><span className="label">Global Settings:</span> {staffData.global_settings ? "✓" : "✗"}</div>
                <div className="profileField"><span className="label">Accessible Testing:</span> {staffData.accessible_testing_modules ? "✓" : "✗"}</div>
                <div className="profileField"><span className="label">Accommodation Modules:</span> {staffData.accomodation_modules ? "✓" : "✗"}</div>
                <div className="profileField"><span className="label">Assistive Technologies:</span> {staffData.assistive_technology_modules ? "✓" : "✗"}</div>
                <div className="profileField"><span className="label">Student Case Information:</span> {staffData.student_case_information ? "✓" : "✗"}</div>
                {/* <div className="profileField"><span className="label">Role:</span> {staffData.role || "N/A"}</div> */}
              </div>
            )
          )}
        </div>
        );
}

export default StaffProfile;