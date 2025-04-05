import React, { useEffect, useState, useRef } from 'react';
import AlertsArea from '../AlertsArea'; // Import the alerts component

export default function StudentDashboard({ userInfo, displayHeaderRef, settingsTabOpen, lastIntendedFocusRef }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('card');
  const [error, setError] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);

  const localRef = useRef(null);
  // Use passed-in header ref or local ref.
  const headingRef = displayHeaderRef || localRef;
  // Ref for the modal container
  const modalRef = useRef(null);

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
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/getStudentCourses?userId=${userInfo?.id}`);
        if (!res.ok) throw new Error('Failed to fetch courses');
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (userInfo?.id) {
      fetchCourses();
    }
  }, [userInfo]);

  // When modal opens, move focus into it.
  useEffect(() => {
    if (selectedCourse && modalRef.current) {
      modalRef.current.focus();
    }
  }, [selectedCourse]);

  // Trap focus within the modal and handle Escape to close.
  const handleModalKeyDown = (e) => {
    if (e.key === 'Escape') {
      setSelectedCourse(null);
    } else if (e.key === 'Tab') {
      const focusableElements = modalRef.current.querySelectorAll(
        'a, button, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    }
  };

  return (
    <div className="studentDashboard" role="main">
      <div className="leftColumn">
        <h2 ref={headingRef} tabIndex={0}>
          Welcome, {userInfo?.name || 'Student'}
        </h2>
        <div className="viewToggle">
          <button
            className={`toggleBtn ${viewMode === 'card' ? 'active' : ''}`}
            onClick={() => setViewMode('card')}
            aria-pressed={viewMode === 'card'}
          >
            Card View
          </button>
          <button
            className={`toggleBtn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            aria-pressed={viewMode === 'list'}
          >
            List View
          </button>
        </div>
        {loading ? (
          <p>Loading courses...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : courses.length === 0 ? (
          <p>No courses found.</p>
        ) : viewMode === 'card' ? (
          <div className="courseGrid">
            {courses.map((course) => {
              const latestExam = course.exams?.reduce((latest, exam) => {
                if (!exam.date) return latest;
                return new Date(exam.date) > new Date(latest?.date || 0) ? exam : latest;
              }, null);
              return (
                <div
                  key={course.id}
                  className="courseCard"
                  onClick={() => setSelectedCourse(course)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedCourse(course);
                    }
                  }}
                  aria-label={`Course: ${course.name}. ${
                    latestExam?.date
                      ? `Next Exam on ${new Date(latestExam.date).toLocaleDateString()}`
                      : 'No exams scheduled'
                  }`}
                >
                  <h3 className="courseTitle">{course.name}</h3>
                  {latestExam?.date ? (
                    <p className="examDate" tabIndex={0}>
                      Next Exam: {new Date(latestExam.date).toLocaleDateString()}
                    </p>
                  ) : (
                    <p className="examDate examDate--none" tabIndex={0}>
                      No exams scheduled
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="courseList">
            {courses.map((course) => (
              <div
                key={course.id}
                className="courseListItem"
                onClick={() => setSelectedCourse(course)}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedCourse(course);
                  }
                }}
                aria-label={`Course: ${course.name}`}
              >
                <div className="courseListName">{course.name}</div>
              </div>
            ))}
          </div>
        )}

        {selectedCourse && (
          <div
            className="modalOverlay"
            onClick={() => setSelectedCourse(null)}
          >
            <div
              className="modalContent"
              data-testid="course-modal"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="course-modal-heading"
              tabIndex={0}
              ref={modalRef}
              onKeyDown={handleModalKeyDown}
            >
              <h2 id="course-modal-heading" tabIndex={0} data-testid="course-modal-heading">
                {selectedCourse.name}
              </h2>
              <p className="infoRow" tabIndex={0}>
                <strong>Professor:</strong> {selectedCourse.professor?.account?.name || 'N/A'}
              </p>
              <p className="infoRow" tabIndex={0}>
                <strong>Email:</strong> {selectedCourse.professor?.account?.email}{' '}
                <a
                  href={`mailto:${selectedCourse.professor?.account?.email}?subject=${selectedCourse.name} Inquiry`}
                  className="emailButton"
                  tabIndex={0}
                >
                  Contact
                </a>
              </p>
              <p className="infoRow" tabIndex={0}>
                <strong>Department:</strong> {selectedCourse.professor?.department || 'N/A'}
              </p>
              <p tabIndex={0}>
                <strong>Exam Dates:</strong>
              </p>
              <ul>
                {selectedCourse.exams && selectedCourse.exams.length > 0 ? (
                  selectedCourse.exams.map((exam) => (
                    <li key={exam.id} tabIndex={0}>
                      {exam.date ? new Date(exam.date).toLocaleString() : 'No date'} — {exam.location}
                    </li>
                  ))
                ) : (
                  <li tabIndex={0}>No exams scheduled</li>
                )}
              </ul>
              <button className="modalCloseBtn" onClick={() => setSelectedCourse(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="rightColumn">
        <AlertsArea />
      </div>
    </div>
  );
}
