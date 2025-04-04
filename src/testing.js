import './App.css';
import { useEffect, useState } from 'react';
import CreateExamModal from "./createExamModal";

function Testing({ userInfo }) {
    const [loading, setLoading] = useState(false);
    const [professorData, setProfessorData] = useState(null);
    const [openProfessorCourses, setOpenProfessorCourses] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showStudentsWithExams, setShowStudentsWithExams] = useState(false); // Track the filter state

    const openModal = (course) => {
        setSelectedCourse(course);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCourse(null);
    };

    const toggleDropdown = (courseId) => {
        setOpenProfessorCourses((prev) => ({
            ...prev,
            [courseId]: !prev[courseId],
        }));
    };

    const toggleFilter = () => {
        setShowStudentsWithExams((prev) => !prev); // Toggle filter state
    };

    const addExamToStudent = (studentId, courseId, examData) => {
        // Update exams for the selected course
        setProfessorData((prevData) => {
            const updatedCourses = prevData.courses.map((course) => {
                if (course.id === courseId) {
                    // Add the new exam to the course's exams array
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
    
                // Update state to remove exam from course
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

    // Recalculate students with exams after the exams data changes
    const getStudentsWithExams = (course) => {
        const studentsWithExams = new Set();
        course.exams.forEach((exam) => {
            exam.studentIds.forEach((studentId) => {
                studentsWithExams.add(studentId);
            });
        });
        return studentsWithExams;
    };

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
                            <div className="filterButtonContainer">
                                <button onClick={toggleFilter}>
                                    {showStudentsWithExams ? 'Filter: Show Students with Exams' : 'Filter: Show All Students'}
                                </button>
                            </div>
                            {professorData?.courses.map((course) => {
                                // Get the students with exams
                                const studentsWithExams = getStudentsWithExams(course);

                                return (
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

                                        <div key={course.id} className="examModalButton">
                                            <button onClick={() => openModal(course)}>Create Exam</button>
                                        </div>

                                        {/* <div className="filterButtonContainer">
                                            <button onClick={toggleFilter}>
                                                {showStudentsWithExams ? 'Show All Students' : 'Show Students with Exams'}
                                            </button>
                                        </div> */}

                                        {openProfessorCourses[course.id] && (
                                            <div id={`students-${course.id}`} role="region" aria-label={`Students for ${course.name}`}>
                                                {course.students.length > 0 ? (
                                                    course.students
                                                        .filter((student) => {
                                                            if (showStudentsWithExams) {
                                                                // Filter based on whether the student has exams
                                                                return studentsWithExams.has(student.userId);
                                                            }
                                                            return true; // No filter, show all students
                                                        })
                                                        .map((student) => {
                                                            // Filter exams for this student
                                                            const studentExams = course.exams.filter((exam) =>
                                                                exam.studentIds.includes(student.userId)
                                                            );

                                                            return (
                                                                <div key={student.userId} className="professorTestingStudentCard">
                                                                    <details className="examsDropdown">
                                                                        <summary>{student.account.name}</summary>
                                                                        {studentExams.length > 0 ? (
                                                                            <>
                                                                                <div><strong>UIN:</strong> {student.UIN || 'N/A'}</div>
                                                                                <div><strong>Email:</strong> {student.account.email || 'N/A'}</div>
                                                                                <div>Exams: </div>
                                                                                {studentExams.map((exam) => (
                                                                                    <div key={exam.id} className="professorTestingStudentCard">
                                                                                        <div><strong>Name:</strong> {exam.name}</div>
                                                                                        <div><strong>Date:</strong> {new Date(exam.date).toLocaleDateString()}</div>
                                                                                        <div><strong>Location:</strong> {exam.location}</div>
                                                                                        <button onClick={() => handleDeleteExam(exam.id, course.id)}>Delete Exam</button>
                                                                                    </div>
                                                                                ))}
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <div><strong>UIN:</strong> {student.UIN || 'N/A'}</div>
                                                                                <div><strong>Email:</strong> {student.account.email || 'N/A'}</div>
                                                                                <div className="noExams">No exams assigned.</div>
                                                                            </>
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
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {userInfo.role === "ADVISOR" && <p className='dashboardTitle'>STAFF TESTING</p>}

            {/* Modal to create exam */}
            {selectedCourse && (
                <CreateExamModal
                    course={selectedCourse}
                    students={selectedCourse.students}
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    addExamToStudent={addExamToStudent} // Pass the function to add an exam
                />
            )}
        </main>
    );
}

export default Testing;
