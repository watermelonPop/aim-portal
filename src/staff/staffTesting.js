import { useState, useEffect, useRef, useMemo } from 'react';

function StaffExamView({ userInfo, settingsTabOpen, displayHeaderRef }) {
        const [exams, setExams] = useState([]);
        const [student, setStudent] = useState([]);
        const [loadingStudent, setLoadingStudent] = useState(false);
        const [loadingProfessor, setLoadingProfessor] = useState(false);
        const [loading, setLoading] = useState(false);
        const [professor, setProfessor] = useState(null);
        const [selectedExam, setSelectedExam] = useState(null);
        const [selectedFile, setSelectedFile] = useState(null);
        const [uploading, setUploading] = useState(false);
        const [errorMessage, setErrorMessage] = useState(null);
        const [fileUrl, setFileUrl] = useState(null);
        
      // ========================================== USE EFFECT LOGIC ==========================================

        useEffect(() => {
        if (userInfo?.id) {
        setLoading(true);
        fetch(`/api/getExamFromAdvisor?userId=${userInfo.id}`)
                .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch exams");
                return res.json();
                })
                .then((data) => {
                setExams(data);
                })
                .catch((error) => {
                console.error("Error fetching exams:", error);
                })
                .finally(() => {
                setLoading(false);
                
                });
        }
        }, [userInfo]);


        //FOR PRINTING ONLY
        useEffect(()=>{
                if(loading === false && exams.length != 0){
                        //console.log("EXAMS HERE:",exams);
                }
        },[exams]);

        useEffect(()=>{
                if(loadingStudent === false && student.length != 0){
                        //console.log("STUDENT HERE:",student);
                }
        },[student]);


        useEffect(()=>{
                if(loadingProfessor === false && professor){
                        //console.log("PROFESSOR HERE:",professor);
                }
        },[professor]);


//   // Handle file selection
        const handleFileChange = (event) => {
                setSelectedFile(event.target.files[0]);
                //console.log("HANDLE FILE CHANGE REACHED");
        };



  // Handle file upload using .then to ensure order
        const handleFileUpload = async (file) => {
                
                //console.log("TRYING FILE UPLOAD");
                //console.log("selected FIle:",selectedFile);
                //console.log("caled File:",file);
                const formDataToSend = new FormData();
                formDataToSend.append("file", file);
                if (!file) return null;
                setUploading(true);
                try {
                        const response = await fetch("/api/submitCompletedExam", {
                        method: "POST",
                        body: formDataToSend,
                        });
                
                        const result = await response.json();
                        //console.log("URL: ", result);
                        
                        const updatedExam = await fetch("/api/updateExam", {
                                method: "POST",
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ examid: selectedExam.id, completedUrl: result.url})
                        });

                        const resultExam = await updatedExam.json();


                        setSelectedExam(resultExam);

                        //console.log("resultExam: ", resultExam);

                        return result.url || null;
                } catch (error) {
                        console.error("Error uploading file:", error);
                        return null;
                } finally{
                        setUploading(false);
                }
                return null;
        };

        // ========================================== JSX ELEMENT FUNCTIONS ==========================================
        function ExamListView({ exams, loading, setSelectedExam }) {
                // Define container styles for a list view
                const localRef = useRef(null);
                const headingRef = displayHeaderRef || localRef;
                const [loaded, setLoaded] = useState(false);
                const displayedExams = exams.length === 0 ? [] : exams;
                //console.log("displayedExams:", displayedExams);

                useEffect(() => {
                        if (
                          loading ||
                          !headingRef.current ||
                          loaded ||
                          (!displayedExams) || 
                          settingsTabOpen ||
                          document.querySelector('[data-testid="alert"]') !== null
                        ) return;
                      
                        const timeout = setTimeout(() => {
                          if (headingRef.current) {
                            headingRef.current.focus();
                            setLoaded(true);
                          }
                        }, 100);
                      
                        return () => clearTimeout(timeout);
                }, [loading, displayedExams, headingRef, loaded]);
                
        
                // Display a loading message if data hasn't loaded yet
                if (loading) {
                        //console.log("returning loading");
                return (<div className="spinnerClassItem" role="status" aria-label="Loading, please wait">
                <div className="spinner-iconClassItem" aria-hidden="true"></div>
                <h3 className="spinner-textClassItem">Loading...</h3>
                </div>);
                }
        
                // Function to handle click on an exam list item
                const handleExamClick = (exam) => {
                setSelectedExam(exam);
                //console.log("SELECTED EXAM:",exam)
                setLoadingStudent(true);
                fetch(`/api/getStudentData?userId=${exam.studentIds[0]}`)
                        .then((res) => {
                        if (!res.ok) throw new Error("Failed to fetch student");
                        return res.json();
                        })
                        .then((data) => {
                        setStudent(data);
                        })
                        .catch((error) => {
                        console.error("Error fetching student:", error);
                        })
                        .finally(() => {
                        setLoadingStudent(false);
                        });
                
                setLoadingProfessor(true);
                fetch(`/api/getProfessor?userId=${exam.course.professorId}`)
                        .then((res) => {
                        if (!res.ok) throw new Error("Failed to fetch professor");
                        return res.json();
                        })
                        .then((data) => {
                        setProfessor(data);
                        })
                        .catch((error) => {
                        console.error("Error fetching professor", error);
                        })
                        .finally(() => {
                        setLoadingProfessor(false);
                        });
                

                };
        
                // Determine which array to slice based on the search query
                
                return (
                <div className="listContainerStyle">
                {displayedExams?.map((exam, index) => (
                <div
                        key={exam.id}
                        className="listItemStyle"
                        onClick={() => handleExamClick(exam)}
                        role="button"
                        tabIndex={0}
                        ref={index === 0 ? headingRef : null}
                        id={index === 0 ? "topStaffTestingResult" : null}
                        onKeyDown={(e) => {
                        if (e.key === 'Enter') handleExamClick(exam);
                        }}
                        //TODO: FIX THESE
                        aria-label={`Exam titled ${exam.name}, subject: ${exam.courseId}, date: ${exam.date}`}
                >
                        <h3 className="titleStyle">{exam.studentName}</h3>
                        <p className="detailStyle">Subject: {exam.course.name}</p>
                        <p className="detailStyle">Exam Number: {exam.name}</p>
                        <p className="detailStyle">Date: {new Date(exam.date).toLocaleDateString()}</p>
                </div>
                ))}
                <a href="#topStaffTestingResult" className='backToTop'>Back to Top</a>
                </div>
                );
        }

        // EXAM CARD  EXAM CARD  EXAM CARD  EXAM CARD  EXAM CARD  EXAM CARD  EXAM CARD  EXAM CARD  EXAM CARD 

        function ExamCard({
                selectedExam,
                student,
                onClose,
                handleFileUpload,
                selectedFile,
                setSelectedFile,
                fileUrl,
                uploading,
                errorMessage
              }) {
                // Styles for the modal overlay and card
                const localRef = useRef(null);
                const headingRef = displayHeaderRef || localRef;

                useEffect(() => {
                        if (
                          loading ||
                          !headingRef.current ||
                          settingsTabOpen ||
                          document.querySelector('[data-testid="alert"]') !== null
                        ) return;
                      
                        const timeout = setTimeout(() => {
                          if (headingRef.current) {
                            headingRef.current.focus();
                          }
                        }, 100);
                      
                        return () => clearTimeout(timeout);
                }, [loading, headingRef]);
                


                return (
                        <div className="card-overlay">
                        <div className="card">
                        <button
                        className="close-button"
                        onClick={onClose}
                        ref={headingRef}
                        >
                        &times;
                        </button>

                        {/* Render the spinner if the data is not loaded */}
                        {loadingStudent && loadingProfessor && (
                        <div className="spinnerClassItem" role="status" aria-label="Loading, please wait">
                                <div className="spinner-iconClassItem" aria-hidden="true"></div>
                                <h3 className="spinner-textClassItem">Loading...</h3>
                        </div>
                        )}

                        {/* Render the content only when loaded */}
                        {!loadingStudent && !loadingProfessor && (
                        <>
                                {/* ================== EXAM DETAILS ================== */}
                                <h2>
                                {selectedExam?.course?.name} - {selectedExam.name}
                                </h2>
                                <p>
                                <strong>Date:</strong>{' '}
                                {new Date(selectedExam.date).toLocaleDateString()}
                                </p>
                                <p>
                                <strong>Time:</strong>{' '}
                                {new Date(selectedExam.date).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: 'numeric',
                                second: 'numeric'
                                })}
                                </p>
                                <p>
                                <strong>Location:</strong> {selectedExam.location}
                                </p>

                                {/* ================== COURSE DETAILS ================== */}
                                <h3 className="section-title">Course Information</h3>
                                <p>
                                <strong>Course Name:</strong> {selectedExam?.course?.name}
                                </p>

                                {loadingProfessor ? (
                                <p>loading professor information</p>
                                ) : (
                                professor && professor.account ? (
                                <>
                                <p>
                                        <strong>Professor Name: </strong> {professor.account.name}
                                </p>
                                <p>
                                        <strong>Professor Email: </strong> {professor.account.email}
                                </p>
                                </>
                                ) : (
                                <p>No professor data available.</p>
                                )
                                )}

                                {/* ================== STUDENT DETAILS ================== */}
                                <h3 className="section-title">Student Information</h3>
                                {loadingStudent ? (
                                <p>loading student information</p>
                                ) : (
                                student && student.account ? (
                                <>
                                <p>
                                        <strong>Student Name: </strong> {student.account.name}
                                </p>
                                <p>
                                        <strong>Student Email: </strong> {student.account.email}
                                </p>
                                <p>
                                        <strong>Accommodations: </strong>
                                        {student.accommodations.length === 0
                                        ? 'No Accommodations'
                                        : student.accommodations.map((acc) => acc.type).join(", ")}
                                </p>
                                </>
                                ) : (
                                <p>No student data available.</p>
                                )
                                )}

                                {/* ================== EXAM UPLOAD/DOWNLOAD ================== */}
                                <h3 className="section-title">Exam Download/Upload</h3>
                                <button
                                onClick={() =>
                                window.open(selectedExam.examUrl, '_blank', 'noopener,noreferrer')
                                }
                                >
                                Download Exam
                                </button>

                                <input type="file" onChange={handleFileChange} />

                                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                                {selectedExam.completedExamURL && (
                                <p style={{ color: 'green' }}>
                                File uploaded!{' '}
                                <a
                                href={selectedExam.completedExamURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                >
                                View File
                                </a>
                                </p>
                                )}

                                <button
                                onClick={() => handleFileUpload(selectedFile)}
                                disabled={uploading}
                                >
                                {uploading
                                ? 'Uploading...'
                                : selectedExam.completedExamURL
                                ? 'Reupload Exam'
                                : 'Upload Exam'}
                                </button>
                        </>
                        )}
                        </div>
                        </div>

                );
              }



  //========================================== RETURN LOGIC ==========================================
        return (
        <div className="staffExamView">
                <h2 aria-label="Exams Assigned to You">
                        Exams Assigned to You
                </h2>
                
                        {selectedExam ? (
                                <ExamCard
                                selectedExam={selectedExam}
                                student={student}
                                onClose={() => setSelectedExam(null)}
                                handleFileUpload={handleFileUpload} // ensure this function is defined
                                selectedFile={selectedFile}
                                setSelectedFile={setSelectedFile}
                                fileUrl={fileUrl}
                                uploading={uploading}
                                errorMessage={errorMessage}
                              />
                        ):(
                                <ExamListView
                                exams={exams}
                                loading={loading}
                                setSelectedExam={setSelectedExam}
                                />
                        )}
                
        </div>
        );
}

export default StaffExamView;
