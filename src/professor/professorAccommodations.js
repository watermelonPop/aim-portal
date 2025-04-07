import { useEffect, useRef, useState } from 'react';

function ProfessorAccommodations({ userInfo, setAlertMessage, setShowAlert, displayHeaderRef, settingsTabOpen, lastIntendedFocusRef }) {
        const [loading, setLoading] = useState(false);
          const [professorData, setProfessorData] = useState(null);
          const [openProfessorCourses, setOpenProfessorCourses] = useState({});
          const allowedAccommodations = new Set([
                "Note-Taking Assistance",
                "Alternative Format Materials",
                "Accessible Seating",
                "Use of Assistive Technology",
                "Interpreter Services",
                "Audio/Visual Aids",
                "Flexibility with Attendance",
                "Modified Assignments"
              ]);
        
          const toggleDropdown = (courseId) => {
            setOpenProfessorCourses((prev) => ({
              ...prev,
              [courseId]: !prev[courseId],
            }));
          };
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

        useEffect(() => {
                if (userInfo?.role === 'PROFESSOR' && userInfo?.id) {
                  setLoading(true);
                  fetch(`/api/getProfessorAccommodations?userId=${userInfo.id}`)
                    .then(res => res.json())
                    .then(data => setProfessorData(data))
                    .catch(err => console.error('Failed to fetch professor data', err))
                    .finally(() => setLoading(false));
                }
        }, [userInfo]);
        
        return (
                <>
                  <div className="accommodationsContainer">
                  <h2 ref={headingRef}
                        tabIndex={0}>PROFESSOR ACCOMMODATIONS</h2>
                    {console.log("Professor Data: ", professorData)}
                    {professorData?.courses.map((course) => (
                      <div key={course.id} className="courseCard">
                        <button
                          className="courseDropdown"
                          onClick={() => toggleDropdown(course.id)}
                          aria-expanded={openProfessorCourses[course.id]}
                          aria-controls={`accommodations-${course.id}`}
                        >
                          {course.name} ({course.department})  
                          <span aria-hidden="true">
                            {openProfessorCourses[course.id] ? "🔼" : "🔽"}
                          </span>
                        </button>
              
                        {openProfessorCourses[course.id] && (
                          <div 
                            id={`accommodations-${course.id}`} 
                            role="region" 
                            aria-label={`Accommodations for ${course.name}`}
                          >
                            {course.accommodations.filter(acc => allowedAccommodations.has(acc.type)).length > 0 ? (
                              <>
                                {course.accommodations
                                  .filter(acc => allowedAccommodations.has(acc.type))
                                  .map((acc) => (
                                    <div key={acc.id} className="accommodationCard">
                                      <div><strong>Type:</strong> {acc.type || 'N/A'}</div>
                                      <div><strong>Status:</strong> {acc.status}</div>
                                      <div><strong>Date Requested:</strong> {new Date(acc.date_requested).toLocaleDateString()}</div>
                                      <div><strong>Advisor ID:</strong> {acc.advisorId || 'N/A'}</div>
                                      <div><strong>Notes:</strong> {acc.notes}</div>
                                    </div>
                                  ))
                                }
                              </>
                            ) : (
                              <div className="noAccommodations">No accommodations available.</div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
        );
              
}

export default ProfessorAccommodations;
