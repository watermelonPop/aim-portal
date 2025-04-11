import { useEffect, useRef, useState, useMemo, useLayoutEffect} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faCheck, faArrowLeft} from '@fortawesome/free-solid-svg-icons';

export const formatDate = (dateString) => {
        console.log("FORMAT: ", dateString);
        if (!dateString) return '';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
}

export function ProfessorDashboard({ userInfo, setAlertMessage, setShowAlert, settingsTabOpen, displayHeaderRef}){
        const localRef = useRef(null);
        const headingRef = displayHeaderRef || localRef;
        const backBtnRef = useRef(null);
        const [selectedTab, setSelectedTab] = useState('class'); // 'class' or 'student'
        const [classes, setClasses] = useState([]);
        const [students, setStudents] = useState([]);
        const [selectedClass, setSelectedClass] = useState(null);
        const [selectedStudent, setSelectedStudent] = useState(null);
        const selectedClassObj = useMemo(() => {
                return classes.find((cls) => cls.id === selectedClass) || null;
        }, [selectedClass, classes]);
        const selectedStudentObj = useMemo(() => {
                return students.find((s) => s.userId === selectedStudent) || null;
        }, [selectedStudent, students]);
        const [loading, setLoading] = useState(false);

        useEffect(() => {
                setSelectedClass(null);
                setSelectedStudent(null);
        }, [selectedTab]);

        useEffect(() => {
                if (!userInfo.id) return;
            
                const fetchClasses = async () => {
                        setLoading(true);
                    try {
                        const response = await fetch(`/api/getProfClasses?user_id=${userInfo.id}`);
                        if (!response.ok) throw new Error('Failed to fetch classes');
            
                        const data = await response.json();
                        console.log('Fetched classes:', data);
                        setClasses(data.courses);

                        const studentMap = new Map();

                        data.courses.forEach(course => {
                        course.accommodations.forEach(acc => {
                        const studentId = acc.student.userId;

                        if (!studentMap.has(studentId)) {
                                // Add student if not seen before
                                studentMap.set(studentId, {
                                ...acc.student,
                                accommodations: [],
                                });
                        }

                        // Add the current accommodation to the student's list
                        studentMap.get(studentId).accommodations.push({
                                id: acc.id,
                                type: acc.type,
                                status: acc.status,
                                date_requested: acc.date_requested,
                                notes: acc.notes,
                                advisor: acc.advisor,
                                class: {
                                        id: course.id,
                                        name: course.name,
                                        department: course.department,
                                },
                        });
                        });
                        });

                        console.log("STUDENTS", Array.from(studentMap.values()));

                        setStudents(Array.from(studentMap.values()));
                        setLoading(false);
                    } catch (error) {
                        console.error('Error fetching classes:', error);
                    }
                };
            
                fetchClasses();
        }, [userInfo]);

        const getClassAlertNumber = (classObj) => {
                let num = 0;
                for(let i = 0; i < classObj.accommodations.length; i++){
                        if(classObj.accommodations[i].status == "PENDING"){
                                num += 1;
                        }
                }
                return num;
        };

        const getStudentAlertNumber = (studentObj) => {
                let num = 0;
                for(let i = 0; i < studentObj.accommodations.length; i++){
                        if(studentObj.accommodations[i].status == "PENDING"){
                                num += 1;
                        }
                }
                return num;
        };

        const acceptAccommodationRequest = async (request_id) => {
                console.log("ACCEPTING");
                try {
                    const response = await fetch('/api/professorAcceptStudentAccommodation', {
                        method: 'POST',
                        credentials: 'include', // Ensure cookies are sent with the request
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                                id: request_id, // ✅ Properly stringified
                        }),
                    });
              
                    const data = await response.json();
              
                    if (!response.ok) {
                        throw new Error(data.message || 'accept accommodation process failed');
                    }

                    if (data && data.success === true) {
                        const updatedClassId = selectedClass;
                      
                        let newClasses = classes.map((classObj) => {
                          return {
                            ...classObj,
                            accommodations: classObj.accommodations.map((accObj) => {
                              if (accObj.id === request_id) {
                                return {
                                  ...accObj,
                                  ...data.new_request,
                                };
                              }
                              return accObj;
                            }),
                          };
                        });
                      
                        setClasses(newClasses); // this alone won't reset state if component doesn't unmount
                        setSelectedClass(selectedClass);

                        console.log("selectedClass:", selectedClass);
                        console.log("selectedClassObj:", selectedClassObj);
                      
                        setAlertMessage(`Accommodation Request Acknowledged and Accepted!`);
                        setShowAlert(true);
                      }                    
                } catch (error) {
                    console.error('Error accept accommodation process: ', error);
                }
        };

        useEffect(() => {
          const isAlertOpen = document.querySelector('[data-testid="alert"]') !== null;
          if(isAlertOpen) return;
          if (selectedClass !== null) {
              const raf = requestAnimationFrame(() => {
                  backBtnRef.current?.focus();
              });
              return () => cancelAnimationFrame(raf);
          } else if (selectedClass === null) {
              const raf = requestAnimationFrame(() => {
                  headingRef.current?.focus();
              });
              return () => cancelAnimationFrame(raf);
          }
  }, [selectedClass]);

  useEffect(() => {
    const isAlertOpen = document.querySelector('[data-testid="alert"]') !== null;
    if(isAlertOpen) return;
    if (selectedStudent !== null) {
        const raf = requestAnimationFrame(() => {
            backBtnRef.current?.focus();
        });
        return () => cancelAnimationFrame(raf);
    } else if (selectedStudent === null) {
        const raf = requestAnimationFrame(() => {
            headingRef.current?.focus();
        });
        return () => cancelAnimationFrame(raf);
    }
}, [selectedStudent]);

        return (
                <div role="presentation" className="professorDashOuter">
                  <div className="tabControls" role="tablist">
                    <button
                      className={selectedTab === "class" ? "activeTab" : ""}
                      id={selectedTab === "class" ? "activeTab" : ""}
                      onClick={() => setSelectedTab("class")}
                      role="tab"
                      aria-selected={selectedTab === "class"}
                      ref={displayHeaderRef}
                    >
                      Class View
                    </button>
                    <button
                      className={selectedTab === "student" ? "activeTab" : ""}
                      onClick={() => setSelectedTab("student")}
                      role="tab"
                      id={selectedTab === "student" ? "activeTab" : ""}
                      aria-selected={selectedTab === "student"}
                    >
                      Student View
                    </button>
                  </div>
              
                  <div className="tabContent" role="tabpanel">
                  {selectedTab === "class" ? (
  <div>
    <h2 className="dashboardTitle">
      Class View Dashboard
    </h2>
    <div>
      {!selectedClassObj ? (
        loading ?(
                <div className="spinnerClassItem" role="status" aria-label="Loading, please wait">
                <div className="spinner-iconClassItem" aria-hidden="true"></div>
                <h3 className="spinner-textClassItem">Loading...</h3>
                </div>
        ) :
        Array.isArray(classes) && classes.length > 0 ? (
          <>
            {classes.map((item, index) => (
              <div
                key={index}
                className="classItem"
                onClick={() => setSelectedClass(item.id)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedClass(item.id);
                  }
                }}
                role="button"
                aria-pressed={selectedClass === item.id}
                aria-label={`Open class ${item.name} with ${item.accommodations.length} accommodations`}
              >
                <div>
                  {getClassAlertNumber(item) === 0 ? (
                    <p className="classAlertCheck">
                      <FontAwesomeIcon icon={faCheck} aria-hidden="true" />
                    </p>
                  ) : (
                    <p className="classAlertNum">{getClassAlertNumber(item)}</p>
                  )}
                </div>
                <p>{item.name}</p>
                <p>{item.accommodations.length} students</p>
              </div>
            ))}
          </>
        ) : (
          <p>No classes available.</p>
        )
      ) : (
        <>
          <div className="outerInnerClass">
            <div className="backBtnClasses">
              <button
                aria-label="back"
                onClick={() => setSelectedClass(null)}
                ref={backBtnRef}
                id="backBtnProfDash"
              >
                <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
              </button>
            </div>
            <h3>{selectedClassObj.name}</h3>
            <p>{selectedClassObj.department}</p>
            <p>{selectedClassObj.accommodations.length} Requests</p>
            <div className="studentCards">
              {selectedClassObj.accommodations.map((item, index) => (
                <div key={index} className="studentCard">
                  <h4>Request {item.status}</h4>
                  {item.status === "PENDING" ? (
                    <button onClick={() => acceptAccommodationRequest(item.id)}>
                      acknowledge & accept
                    </button>
                  ) : null}
                  <div>
                    <label>Student:</label>
                    <p>{item.student.account.name}</p>
                  </div>
                  <div>
                    <label>UIN:</label>
                    <p>{item.student.UIN}</p>
                  </div>
                  <div>
                    <label>Email:</label>
                    <a
                      tabIndex={0}
                      href={`mailto:${item.student.account.email}`}
                    >
                      {item.student.account.email}
                    </a>
                  </div>
                  <div>
                    <label >Advisor:</label>
                    <p >{item.advisor.account.name}</p>
                  </div>
                  <div>
                    <label >Advisor Contact:</label>
                    <a
                      tabIndex={0}
                      href={`mailto:${item.advisor.account.email}`}
                    >
                      {item.advisor.account.email}
                    </a>
                  </div>
                  <div>
                    <label >Requested:</label>
                    <p >
                      {item.type} Accommodations on{" "}
                      {formatDate(item.date_requested)}
                    </p>
                  </div>
                  <div>
                    <label >Notes:</label>
                    <p >{item.notes}</p>
                  </div>
                </div>
              ))}
            </div>
            <a href="#backBtnProfDash" className="backToTop">Back to Top</a>
          </div>
        </>
      )}
    </div>
  </div>
                    ) : (
                      <div>
                        <h2 className="dashboardTitle">
                          Student View Dashboard
                        </h2>
                        <div>
                        {!selectedStudentObj ? (
                                loading ?(
                                        <p>LOADING</p>
                                ) :
                            Array.isArray(students) && students.length > 0 ? (
                              <>
                                {students.map((student) => (
                                  <div
                                    key={student.userId}
                                    className="classItem"
                                    tabIndex={0}
                                    onClick={() => setSelectedStudent(student.userId)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                          e.preventDefault();
                                          setSelectedStudent(student.userId);
                                        }
                                      }}
                                        role="button"
                                        aria-pressed={selectedStudent === student.userId}
                                        aria-label={`Open student ${student.account.name} with ${student.accommodations.length} requests`}
                                  >
                                    <div>
                                        {getStudentAlertNumber(student) === 0 ? (
                                                <p className="classAlertCheck">
                                          <FontAwesomeIcon icon={faCheck} aria-hidden="true" />
                                          </p>
                                        ) : (
                                                <p className="classAlertNum">
                                          {getStudentAlertNumber(student)}
                                          </p>
                                        )}
                                    </div>
                                    <p>{student.account.name}</p>
                                    <p>UIN: {student.UIN}</p>
                                    <p>{student.accommodations.length} Requests</p>
                                  </div>
                                ))}
                              </>
                            ) : (
                              <p>No students available.</p>
                            )
                          ) : (
                            <>
                              <div className="outerInnerClass">
                                        <div className="backBtnClasses">
                                                <button
                                                aria-label="back"
                                                onClick={() => setSelectedStudent(null)}
                                                ref={backBtnRef}
                                                id="backBtnProfDash"
                                                >
                                                        <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
                                                </button>
                                        </div>
                                        <h3>{selectedStudentObj.account.name}</h3>
                                        <p>UIN: {selectedStudentObj.UIN}</p>
                                        <a href={`mailto:${selectedStudentObj.account.email}`}>Email: {selectedStudentObj.account.email}</a>
                                        <div className="studentCards">
                                        {selectedStudentObj.accommodations.map((item, index) => (
                                                <div key={index} className="studentCard">
                                                        <h4>{item.class.name} Request {item.status}</h4>
                                                        {item.status === "PENDING" ? (
                                                                <button
                                                                onClick={() =>
                                                                acceptAccommodationRequest(item.id)
                                                                }
                                                                >
                                                                acknowledge & accept
                                                                </button>
                                                        ) : null}
                                                        <div>
                                                                <label>Requested: </label>
                                                        <p >
                                                                {item.type} Accommodations on{" "}
                                                                {formatDate(item.date_requested)}
                                                        </p>
                                                        </div>
                                                        <div>
                                                        <label>Advisor:</label>
                                                        <p >{item.advisor.account.name}</p>
                                                        </div>
                                                        <div>
                                                        <label >Advisor Contact:</label>
                                                        <a tabIndex={0} href={`mailto:${item.advisor.account.email}`}>{item.advisor.account.email}</a>
                                                        </div>
                                                        <div>
                                                        <label>Notes:</label>
                                                        <p>{item.notes}</p>
                                                        </div>
                                                </div>
                                        ))}
                                        </div>
                                        <a href="#backBtnProfDash" className="backToTop">Back to Top</a>
                                </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
        );
              
              
              
}

export default ProfessorDashboard;
