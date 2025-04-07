import { useEffect, useState, useRef } from 'react';
import CreateExamModal from "./createExamModal";
import './Professor.css';

function ProfessorTesting({ userInfo, displayHeaderRef, settingsTabOpen, lastIntendedFocusRef }) {
  const localRef = useRef(null);
  const headingRef = displayHeaderRef || localRef;

  const [loading, setLoading] = useState(false);
  const [professorData, setProfessorData] = useState(null);
  const [openProfessorCourses, setOpenProfessorCourses] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showStudentsWithExams, setShowStudentsWithExams] = useState(false);

  const studentRefs = useRef({});
  const triggerButtonRefs = useRef({});
  const lastTriggerButtonRef = useRef(null);

  useEffect(() => {
    if (!headingRef.current || settingsTabOpen) return;
    if (lastIntendedFocusRef?.current !== headingRef.current) {
      lastIntendedFocusRef.current = headingRef.current;
    }
  }, [settingsTabOpen, headingRef]);

  useEffect(() => {
    if (!headingRef.current || settingsTabOpen) return;
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

  const openModal = (course, refKey) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
    lastTriggerButtonRef.current = triggerButtonRefs.current[refKey];
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  const toggleDropdown = (courseId, focusAfter = false) => {
    setOpenProfessorCourses((prev) => {
      const isOpen = !prev[courseId];
      if (isOpen && focusAfter) {
        setTimeout(() => {
          studentRefs.current[courseId]?.focus();
        }, 0);
      }
      return {
        ...prev,
        [courseId]: isOpen,
      };
    });
  };

  const toggleFilter = () => {
    setShowStudentsWithExams((prev) => !prev);
  };

  const addExamToStudent = (courseId, examData) => {
    setProfessorData((prevData) => {
      const updatedCourses = prevData.courses.map((course) => {
        if (course.id === courseId) {
          return {
            ...course,
            exams: [...course.exams, examData],
          };
        }
        return course;
      });
      return { ...prevData, courses: updatedCourses };
    });
  };
  

  const handleDeleteExam = async (examId, courseId) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) return;

    try {
      const res = await fetch(`/api/deleteExam?examId=${examId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const deletedExam = await res.json();

        setProfessorData((prevData) => {
          const updatedCourses = prevData.courses.map((course) => {
            if (course.id === courseId) {
              return {
                ...course,
                exams: course.exams.filter((exam) => exam.id !== examId),
              };
            }
            return course;
          });
          return { ...prevData, courses: updatedCourses };
        });
      } else {
        console.error('Failed to delete exam');
      }
    } catch (error) {
      console.error('Error deleting exam:', error);
    }
  };

  useEffect(() => {
    if (userInfo?.role === 'PROFESSOR' && userInfo?.id) {
      setLoading(true);
      fetch(`/api/getProfessorStudents?userId=${userInfo.id}`)
        .then(res => res.json())
        .then(data => setProfessorData(data))
        .catch(err => console.error('Failed to fetch professor data', err))
        .finally(() => setLoading(false));
    }
  }, [userInfo]);

  return (
    <main className='dashboardOuter'>
      {loading ? (
        <div className="loadingScreen" role="status" aria-live="polite">
          <div className="spinner">
            <div className="spinner-icon"></div>
            <p className="spinner-text">Loading accommodations...</p>
          </div>
        </div>
      ) : (
        <div className="accommodationsContainer">
          <h2 ref={headingRef} tabIndex={0}>PROFESSOR TESTING</h2>

          <div className="filterButtonContainer">
            <button onClick={toggleFilter}>
              {showStudentsWithExams ? 'Filter: Show Students with Exams' : 'Filter: Show All Students'}
            </button>
          </div>

          {professorData?.courses.map((course) => (
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
                aria-controls={`students-${course.id}`}
              >
                {course.name} ({course.department})
                <span aria-hidden="true">{openProfessorCourses[course.id] ? "🔼" : "🔽"}</span>
              </button>

              <div className="examModalButton">
                <button
                  ref={(el) => (triggerButtonRefs.current[course.id] = el)}
                  onClick={() => openModal(course, course.id)}
                >
                  Create Exam
                </button>
              </div>

              {openProfessorCourses[course.id] && (
                <div id={`students-${course.id}`} role="region" aria-label={`Students for ${course.name}`}>
                  {professorData?.students
                    .filter((student) => {
                      const studentExams = course.exams.filter((exam) =>
                        exam.studentIds.includes(Number(student.userId))
                      );
                      return showStudentsWithExams ? studentExams.length > 0 : true;
                    })
                    .map((student, index) => {
                      const studentExams = course.exams.filter((exam) =>
                        exam.studentIds.includes(Number(student.userId))
                      );

                      return (
                        <div
                          key={student.userId}
                          className="professorTestingStudentCard"
                          tabIndex={0}
                          ref={index === 0 ? (el) => studentRefs.current[course.id] = el : null}
                        >
                          <details className="examsDropdown">
                            <summary>{student.account.name}</summary>
                            <div><strong>UIN:</strong> {student.UIN || 'N/A'}</div>
                            <div><strong>Email:</strong> {student.account.email || 'N/A'}</div>

                            {studentExams.length > 0 ? (
                              <>
                                <div>Exams:</div>
                                {studentExams.map((exam) => (
                                  <div key={exam.id} className="professorTestingStudentCard" tabIndex={0}>
                                    <div><strong>Name:</strong> {exam.name}</div>
                                    <div><strong>Date:</strong> {new Date(exam.date).toLocaleDateString()}</div>
                                    <div><strong>Location:</strong> {exam.location}</div>
                                    <button onClick={() => handleDeleteExam(exam.id, course.id)}>Delete Exam</button>
                                  </div>
                                ))}
                              </>
                            ) : (
                              <div className="noExams">No exams assigned.</div>
                            )}
                          </details>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedCourse && (
        <CreateExamModal
        course={selectedCourse}
        students={professorData.students}
        isOpen={isModalOpen}
        onClose={closeModal}
        returnFocusRef={lastTriggerButtonRef}
        addExamToStudent={addExamToStudent}
      />
      
      )}
    </main>
  );
}

export default ProfessorTesting;
