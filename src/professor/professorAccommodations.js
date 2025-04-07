import { useEffect, useRef, useState } from 'react';

function ProfessorAccommodations({ userInfo, setAlertMessage, setShowAlert, displayHeaderRef, settingsTabOpen, lastIntendedFocusRef }) {
  const [loading, setLoading] = useState(false);
  const [professorData, setProfessorData] = useState(null);
  const [openProfessorCourses, setOpenProfessorCourses] = useState({});
  const accommodationRefs = useRef({}); // Refs to the first item in each dropdown

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

  const toggleDropdown = (courseId, focusAfter = false) => {
    setOpenProfessorCourses((prev) => {
      const isOpen = !prev[courseId];
      if (isOpen && focusAfter) {
        setTimeout(() => {
          accommodationRefs.current[courseId]?.focus();
        }, 0);
      }
      return {
        ...prev,
        [courseId]: isOpen,
      };
    });
  };

  const localRef = useRef(null);
  const headingRef = displayHeaderRef || localRef;

  // Focus management for initial load
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
    {loading ? (
                    <div className="loadingScreen" role="status" aria-live="polite">
                    <div className="spinner">
                            <div className="spinner-icon"></div>
                            <p className="spinner-text">Loading accommodations...</p>
                    </div>
                    </div>
            ) : (
    <div className="accommodationsContainer">
      <h2 ref={headingRef} tabIndex={0}>PROFESSOR ACCOMMODATIONS</h2>
      {professorData?.courses.map((course) => {
        const filtered = course.accommodations.filter(acc => allowedAccommodations.has(acc.type));
        return (
          <div key={course.id} className="courseCard">
            <button
              className="courseDropdown"
              onClick={() => toggleDropdown(course.id, true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleDropdown(course.id, true);
                }
              }}
              tabIndex={0}
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
                {filtered.length > 0 ? (
                  <>
                    {filtered.map((acc, index) => (
                      <div
                        key={acc.id}
                        className="accommodationCard"
                        tabIndex={0}
                        ref={index === 0 ? (el) => accommodationRefs.current[course.id] = el : null}
                      >
                        <div><strong>Type:</strong> {acc.type || 'N/A'}</div>
                        <div><strong>Status:</strong> {acc.status}</div>
                        <div><strong>Date Requested:</strong> {new Date(acc.date_requested).toLocaleDateString()}</div>
                        <div><strong>Advisor ID:</strong> {acc.advisorId || 'N/A'}</div>
                        <div><strong>Notes:</strong> {acc.notes}</div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="noAccommodations" tabIndex={0}>
                    No accommodations available.
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
    )}
    </>
  );
}

export default ProfessorAccommodations;
