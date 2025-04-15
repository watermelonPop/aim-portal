import { useEffect, useRef, useState, createRef } from 'react';
import './Professor.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';

function ProfessorAccommodations({ userInfo, setAlertMessage, setShowAlert, settingsTabOpen, displayHeaderRef }) {
  const localRef = useRef(null);
  const headingRef = displayHeaderRef || localRef;
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [professorData, setProfessorData] = useState(null);
  const [openProfessorCourses, setOpenProfessorCourses] = useState({});
  const accommodationRefs = useRef({});

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
          accommodationRefs.current[courseId]?.current?.focus();
        }, 0);
      }
      return {
        ...prev,
        [courseId]: isOpen,
      };
    });
  };

  useEffect(() => {
    if (userInfo?.role === 'PROFESSOR' && userInfo?.id) {
      setLoading(true);
      fetch(`/api/getProfessorAccommodations?userId=${userInfo.id}`)
        .then(res => res.json())
        .then(data => setProfessorData(data))
        .catch(err => console.error('Failed to fetch professor data', err))
        .finally(() => {
          setLoading(false);
          setLoaded(true);
        });
    }
  }, [userInfo]);

  useEffect(() => {
    if (
      !loaded ||
      loading ||
      !headingRef.current ||
      settingsTabOpen ||
      document.querySelector('[data-testid="alert"]') !== null ||
      !professorData.courses
    ) return;

    const timeout = setTimeout(() => {
      if (headingRef.current) {
        headingRef.current.focus();
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [loaded, headingRef, professorData]);

  return (
    <div className='profAccommodationsOuter' role="region" aria-labelledby="professor-accommodations-heading">
      <h2 id="professor-accommodations-heading">Professor Accommodations</h2>

      {loading ? (
        <div className="spinnerClassItem" role="status" aria-label="Loading, please wait">
          <div className="spinner-iconClassItem" aria-hidden="true"></div>
          <h3 className="spinner-textClassItem">Loading...</h3>
        </div>
      ) : (
        professorData?.courses.map((course, index) => {
          const filtered = course.accommodations.filter(acc =>
            allowedAccommodations.has(acc.type)
          );

          if (!accommodationRefs.current[course.id]) {
            accommodationRefs.current[course.id] = createRef();
          }

          const isOpen = !!openProfessorCourses[course.id];

          return (
            <div
              key={course.id}
              className="courseCard"
              ref={index === 0 ? headingRef : accommodationRefs.current[course.id]}
              tabIndex={0}
              onClick={() => toggleDropdown(course.id, true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleDropdown(course.id, true);
                }
              }}
            >
              <button
                tabIndex={-1}
                className="courseDropdown"
                aria-expanded={isOpen}
                aria-controls={`accommodations-${course.id}`}
                aria-label={`Toggle accommodations for ${course.name} (${course.department})`}
              >
                {course.name} ({course.department})
                <span aria-hidden="true">
                  {isOpen
                    ? <FontAwesomeIcon icon={faCaretUp} />
                    : <FontAwesomeIcon icon={faCaretDown} />}
                </span>
              </button>

              <div
                id={`accommodations-${course.id}`}
                role="region"
                aria-label={`Accommodations for ${course.name}`}
                hidden={!isOpen}
              >
                {isOpen ? (
                  filtered.length > 0 ? (
                    <div role="list" className="accommodationCards">
                      {filtered.map((acc, index) => (
                        <div key={acc.id} className="accommodationCard" role="listitem">
                          <div><strong>Type:</strong> {acc.type || 'N/A'}</div>
                          <div><strong>Status:</strong> {acc.status}</div>
                          <div><strong>Date Requested:</strong> {new Date(acc.date_requested).toLocaleDateString()}</div>
                          <div><strong>Advisor ID:</strong> {acc.advisorId || 'N/A'}</div>
                          <div><strong>Notes:</strong> {acc.notes}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="noAccommodations" tabIndex={0} aria-live="polite">
                      No accommodations available.
                    </div>
                  )
                ) : (
                  <span className="visually-hidden">Accommodations hidden</span>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default ProfessorAccommodations;
