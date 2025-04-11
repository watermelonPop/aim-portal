import { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faSquareCheck, faSquareXmark} from '@fortawesome/free-solid-svg-icons';

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
              <div className="spinnerClassItem" role="status" aria-label="Loading, please wait">
              <div className="spinner-iconClassItem" aria-hidden="true"></div>
              <h3 className="spinner-textClassItem">Loading...</h3>
              </div>
          ) : (
            staffData && (
              <div className="profileContainer">
                <div className="profileField"><span className="label">Name:</span> <span className="profileData">{staffData.account.name || "N/A"}</span></div>
                <div className="profileField"><span className="label">Email:</span> <span className="profileData">{staffData.account.email || "N/A"}</span></div>
                <div className="profileField"><span className="label">Role:</span> <span className="profileData">{staffData.role || "N/A"}</span></div>
                <div className="permissionsField">
                  <span className="label">Permissions:</span>
                  <div className="permissionsInnerField"><span className="permissionsLabel">Global Settings:</span> <span className="permissionsData">{staffData.global_settings ? <FontAwesomeIcon icon={faSquareCheck} aria-hidden="true" /> : <FontAwesomeIcon icon={faSquareXmark} aria-hidden="true" />}</span></div>
                  <div className="permissionsInnerField"><span className="permissionsLabel">Accessible Testing:</span> <span className="permissionsData">{staffData.accessible_testing_modules ? <FontAwesomeIcon icon={faSquareCheck} aria-hidden="true" /> : <FontAwesomeIcon icon={faSquareXmark} aria-hidden="true" />}</span></div>
                  <div className="permissionsInnerField"><span className="permissionsLabel">Accommodation Modules:</span> <span className="permissionsData">{staffData.accomodation_modules ? <FontAwesomeIcon icon={faSquareCheck} aria-hidden="true" /> : <FontAwesomeIcon icon={faSquareXmark} aria-hidden="true" />}</span></div>
                  <div className="permissionsInnerField"><span className="permissionsLabel">Assistive Technologies:</span> <span className="permissionsData">{staffData.assistive_technology_modules ? <FontAwesomeIcon icon={faSquareCheck} aria-hidden="true" /> : <FontAwesomeIcon icon={faSquareXmark} aria-hidden="true" />}</span></div>
                  <div className="permissionsInnerField"><span className="permissionsLabel">Student Case Information:</span> <span className="permissionsData">{staffData.student_case_information ? <FontAwesomeIcon icon={faSquareCheck} aria-hidden="true" /> : <FontAwesomeIcon icon={faSquareXmark} aria-hidden="true" />}</span></div>
                </div>
              </div>
            )
          )}
        </div>
        );
}

export default StaffProfile;