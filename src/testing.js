import './App.css';
import { useEffect, useState } from 'react';


function Testing({userInfo}) {

    const [loading, setLoading] = useState(false);
    const [professorData, setProfessorData] = useState(null);
    const [openProfessorCourses, setOpenProfessorCourses] = useState({});

    const toggleDropdown = (courseId) => {
        setOpenProfessorCourses((prev) => ({
          ...prev,
          [courseId]: !prev[courseId],
        }));
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
                {userInfo.role === "STUDENT" && <p className='dashboardTitle'>STUDENT TESTING</p>}
                {userInfo.role === "PROFESSOR" && (
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
                            {professorData?.courses.map((course) => (
                            <div key={course.id} className="courseCard">
                                <button
                                className="courseDropdown"
                                onClick={() => toggleDropdown(course.id)}
                                aria-expanded={openProfessorCourses[course.id]}
                                aria-controls={`students-${course.id}`}
                                >
                                {course.name} ({course.department})  
                                <span aria-hidden="true">{openProfessorCourses[course.id] ? "🔼" : "🔽"}</span>
                                </button>

                                {openProfessorCourses[course.id] && (
                                <div id={`students-${course.id}`} role="region" aria-label={`Students for ${course.name}`}>
                                    {course.students.length > 0 ? (
                                    course.students.map((student) => {
                                        // Filter exams for this student
                                        const studentExams = course.exams.filter((exam) =>
                                        exam.studentIds.includes(student.userId)
                                        );

                                        return (
                                        <div key={student.userId} className="accommodationCard">
                                            <div><strong>Name:</strong> {student.account.name || 'N/A'}</div>
                                            <div><strong>UIN:</strong> {student.UIN || 'N/A'}</div>
                                            <div><strong>Email:</strong> {student.account.email || 'N/A'}</div>

                                            {/* Exams Section */}
                                            <details className="examsDropdown">
                                            <summary>
                                                Exams for {student.account.name} ({studentExams.length} total)
                                            </summary>
                                            {studentExams.length > 0 ? (
                                                studentExams.map((exam) => (
                                                <div key={exam.id} className="examCard">
                                                    <div><strong>Date:</strong> {new Date(exam.date).toLocaleDateString()}</div>
                                                    <div><strong>Location:</strong> {exam.location}</div>
                                                    <div><strong>Advisor ID:</strong> {exam.advisorId}</div>
                                                </div>
                                                ))
                                            ) : (
                                                <div className="noExams">No exams assigned.</div>
                                            )}
                                            </details>
                                        </div>
                                        );
                                    })
                                    ) : (
                                    <div className="noAccommodations">No students in class.</div>
                                    )}
                                </div>
                                )}
                            </div>
                            ))}
                        </div>
                        )}
                    </>
                    )}

                {/* when generating an exam just assign a random advisor of testing staff */}
                {userInfo.role === "ADVISOR" && <p className='dashboardTitle'>STAFF TESTING</p>}
            </main>
        );
}

export default Testing;