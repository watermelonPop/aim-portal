import { useEffect, useState, useRef } from 'react';
import CreateExamModal from "./createExamModal";
import './Professor.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faCaretDown, faCaretUp} from '@fortawesome/free-solid-svg-icons';

function ProfessorTesting({ userInfo, settingsTabOpen, displayHeaderRef }) {
  const localRef = useRef(null);
  const headingRef = displayHeaderRef || localRef;
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [professorData, setProfessorData] = useState(null);
  const [openProfessorCourses, setOpenProfessorCourses] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showStudentsWithExams, setShowStudentsWithExams] = useState(false);

  const studentRefs = useRef({});
  const triggerButtonRefs = useRef({});
  const lastTriggerButtonRef = useRef(null);

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
        .then(res => {
          if (!res.ok) throw new Error('Network response was not ok');
          return res.json();
        })
        .then(data => setProfessorData(data))
        .catch(err => {
          console.error('Failed to fetch professor data', err);
        })
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
    <main className='dashboardProfTestingOuter' role="main">
      <h2 id="professor-testing-heading">Professor Testing</h2>
  
      {loading ? (
        <div className="spinnerClassItem" role="status" aria-label="Loading, please wait">
        <div className="spinner-iconClassItem" aria-hidden="true"></div>
        <h3 className="spinner-textClassItem">Loading...</h3>
        </div>
      ) : (
        <div>
          <div className="filterButtonContainer">
            <button ref={headingRef} onClick={toggleFilter} aria-pressed={showStudentsWithExams}>
              {showStudentsWithExams ? 'Filter: Show Students with Exams' : 'Filter: Show All Students'}
            </button>
          </div>
  
          {professorData?.courses.map((course) => (
            <section key={course.id} className="courseCard" aria-labelledby={`course-heading-${course.id}`}>
              <h3 id={`course-heading-${course.id}`} className="sr-only">
                {`${course.name} (${course.department})`}
              </h3>
  
              <button
                className="courseDropdownTesting"
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
                aria-label={`Toggle students list for ${course.name}`}
                id={course.id}
              >
                {course.name} ({course.department})
                <span aria-hidden="true">{openProfessorCourses[course.id] ? <FontAwesomeIcon icon={faCaretUp} /> : <FontAwesomeIcon icon={faCaretDown} />}</span>
              </button>
  
              <div className="examModalButton">
                <button
                  ref={(el) => (triggerButtonRefs.current[course.id] = el)}
                  onClick={() => openModal(course, course.id)}
                  aria-label={`Create exam for ${course.name}`}
                >
                  Create Exam
                </button>
              </div>
  
              <div
                id={`students-${course.id}`}
                role="region"
                aria-labelledby={`course-heading-${course.id}`}
                hidden={!openProfessorCourses[course.id]}
              >
                {openProfessorCourses[course.id] ? (
                  <>
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
                            ref={index === 0 ? (el) => (studentRefs.current[course.id] = el) : null}
                            role="region"
                            aria-label={`Student: ${student.account.name}`}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                const detailsElement = e.target.querySelector('.examsDropdown');
                                if (detailsElement) {
                                  detailsElement.open = !detailsElement.open;
                                }
                              }
                            }}
                          >
                            <details className="examsDropdown">
                              <summary tabIndex={-1}>{student.account.name}</summary>
                              <div><strong>UIN: </strong> {student.UIN || 'N/A'}</div>
                              <div><strong>Email: </strong> {student.account.email || 'N/A'}</div>

                              {studentExams.length > 0 ? (
                                <>
                                  <div>Exams:</div>
                                  {studentExams.map((exam) => (
                                    <div key={exam.id} className="professorTestingStudentCardInner">
                                      <div><strong>Name:</strong> {exam.name}</div>
                                      <div><strong>Date:</strong> {new Date(exam.date).toLocaleDateString()}</div>
                                      <div><strong>Location:</strong> {exam.location}</div>
                                      <button
                                        onClick={() => handleDeleteExam(exam.id, course.id)}
                                        aria-label={`Delete exam ${exam.name}`}
                                      >
                                        Delete Exam
                                      </button>
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
                    <a href={'#' + course.id} className="backToTop">Back to Top of Class</a>
                  </>
                ) : (
                  <span className="visually-hidden">Students are collapsed</span>
                )}
              </div>
            </section>
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
