import { useEffect, useRef } from 'react';

function UserDashboard({ userInfo, displayHeaderRef, settingsTabOpen, lastIntendedFocusRef }) {
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
        
                <h2
                        ref={headingRef}
                        tabIndex={0}
                        className='dashboardTitle'
                >
                        USER DASHBOARD
                </h2>
        );
}

export default UserDashboard;
