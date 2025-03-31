import React, { useEffect, useState } from 'react';
import './App.css'; // Make sure your styles are imported

export default function StudentDashboard({ userInfo }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('card');
  const [error, setError] = useState('');

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
            <h2>Welcome, {userInfo?.name || 'Student'}</h2>

            <div className="viewToggle">
            <button onClick={() => setViewMode('card')}>Card View</button>
            <button onClick={() => setViewMode('list')}>List View</button>
            </div>

            {loading ? (
            <p>Loading courses...</p>
            ) : error ? (
            <p style={{ color: 'red' }}>{error}</p>
            ) : courses.length === 0 ? (
            <p>No courses found.</p>
            ) : viewMode === 'card' ? (
            <div className="courseGrid">
                {courses.map(course => (
                <div key={course.id} className="courseCard">
                    <h3 className="courseTitle">{course.name}</h3>
                    {course.exams?.length > 0 ? (
                        (() => {
                            const latest = course.exams.reduce((latest, exam) => {
                                if (!exam.date) return latest;
                                return new Date(exam.date) > new Date(latest?.date || 0) ? exam : latest;
                            }, null);

                            return latest?.date ? (
                                <p className="examDate">
                                    Exam: {new Date(latest.date).toLocaleDateString()}
                                </p>
                            ) : (
                                <p className="examDate examDate--none">No exams scheduled</p>
                            );
                        })()
                    ) : (
                        <p className="examDate examDate--none">No exams scheduled</p>
                    )}
                </div>
                ))}
            </div>
            ) : (
            <div className="courseList">
                {courses.map(course => (
                  <div key={course.id} className="courseListItem">
                    <div className="courseListName">{course.name}</div>
                  </div>
                ))}
            </div>  
            )}
        </div>

        <div className="rightColumn">
            {/* Future content here (ex: widgets, alerts, etc.) */}
        </div>
    </div>
  );
}
