import React, { useEffect, useState, useRef } from 'react';
import AlertsArea from '../AlertsArea'; // Import the alerts component
import '../index.css';

export default function StudentDashboard({ userInfo, settingsTabOpen, displayHeaderRef}) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('card');
  const [error, setError] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Ref for the modal container
  const modalRef = useRef(null);

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
    if (selectedCourse && document.getElementById("profContact")) {
      document.getElementById("profContact").focus();
    }
  }, [selectedCourse]);

  // Trap focus within the modal and handle Escape to close.
  const handleModalKeyDown = (e) => {
    if (e.key === 'Escape') {
      setSelectedCourse(null);
      displayHeaderRef.current.focus();
    }
  };

  return (
    <div className="studentDashboard" role="main">
      <div className="leftColumn">
        <h2>
          Welcome, {userInfo?.name || 'Student'}
        </h2>
        <div className="viewToggle">
          <button
            className={`toggleBtn ${viewMode === 'card' ? 'active' : ''}`}
            onClick={() => setViewMode('card')}
            aria-pressed={viewMode === 'card'}
            ref={displayHeaderRef}
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
          <div className="spinnerClassItem" role="status" aria-label="Loading, please wait">
          <div className="spinner-iconClassItem" aria-hidden="true"></div>
          <h3 className="spinner-textClassItem">Loading...</h3>
          </div>
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
                    <p className="examDate">
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
            data-testid="modalOverlay"
            onClick={() => setSelectedCourse(null)}
          >
            <div
              className="modalContent"
              data-testid="course-modal"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="course-modal-heading"
              ref={modalRef}
              onKeyDown={handleModalKeyDown}
            >
              <h2 id="course-modal-heading" data-testid="course-modal-heading">
                {selectedCourse.name}
              </h2>
              <p className="infoRow">
                <strong>Professor:</strong> {selectedCourse.professor?.account?.name || 'N/A'}
              </p>
              <p className="infoRow">
                <strong>Email:</strong> {selectedCourse.professor?.account?.email}{' '}
                <a
                  href={`mailto:${selectedCourse.professor?.account?.email}?subject=${selectedCourse.name} Inquiry`}
                  className="emailButton"
                  tabIndex={0}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="profContact"
                >
                  Contact
                </a>
              </p>
              <p className="infoRow">
                <strong>Department:</strong> {selectedCourse.professor?.department || 'N/A'}
              </p>
              <p>
                <strong>Exam Dates:</strong>
              </p>
              <ul>
                {selectedCourse.exams && selectedCourse.exams.length > 0 ? (
                  selectedCourse.exams.map((exam) => (
                    <li key={exam.id}>
                      {exam.date ? new Date(exam.date).toLocaleString() : 'No date'} — {exam.location}
                    </li>
                  ))
                ) : (
                  <li>No exams scheduled</li>
                )}
              </ul>
              <button id="stuDashModalClose" className="modalCloseBtn" onClick={() => {
              setSelectedCourse(null);
              displayHeaderRef.current.focus();
            }}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="rightColumn">
        <AlertsArea displayHeaderRef={displayHeaderRef} />
      </div>
    </div>
  );
}
