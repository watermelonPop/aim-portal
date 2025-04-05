import React, { useEffect, useState, useRef } from 'react';
import AlertsArea from '../AlertsArea'; // Import the alerts component

export default function StudentDashboard({ userInfo, displayHeaderRef, settingsTabOpen, lastIntendedFocusRef }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('card');
  const [error, setError] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);

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

  return (
    <div className="studentDashboard">
      <div className="leftColumn">
        <h2 ref={headingRef} tabIndex={0}>Welcome, {userInfo?.name || 'Student'}</h2>
        <div className="viewToggle">
          <button
            className={`toggleBtn ${viewMode === 'card' ? 'active' : ''}`}
            onClick={() => setViewMode('card')}
          >
            Card View
          </button>
          <button
            className={`toggleBtn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
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
                >
                  <h3 className="courseTitle">{course.name}</h3>
                  {latestExam?.date ? (
                    <p className="examDate">
                      Next Exam: {new Date(latestExam.date).toLocaleDateString()}
                    </p>
                  ) : (
                    <p className="examDate examDate--none">No exams scheduled</p>
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
              >
                <div className="courseListName">{course.name}</div>
              </div>
            ))}
          </div>
        )}
        {selectedCourse && (
          <div className="modalOverlay" onClick={() => setSelectedCourse(null)}>
            <div
              className="modalContent"
              data-testid="course-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 data-testid="course-modal-heading">{selectedCourse.name}</h2>
              <p className="infoRow">
                <strong>Professor:</strong> {selectedCourse.professor?.account?.name || 'N/A'}
              </p>
              <p className="infoRow">
                <strong>Email:</strong> {selectedCourse.professor?.account?.email}
                <a
                  href={`mailto:${selectedCourse.professor?.account?.email}?subject=${selectedCourse.name} Inquiry`}
                  className="emailButton"
                >
                  Contact
                </a>
              </p>
              <p className="infoRow">
                <strong>Department:</strong> {selectedCourse.professor?.department || 'N/A'}
              </p>
              <p><strong>Exam Dates:</strong></p>
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
