import { fa } from '@faker-js/faker';
import { useState, useEffect, useRef, useMemo } from 'react';

function StaffExamView({ userInfo, displayHeaderRef, settingsTabOpen, lastIntendedFocusRef }) {
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
        

        const localRef = useRef(null);
        const headingRef = displayHeaderRef || localRef;

  // ========================================== DO NOT TOUCH ==========================================
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
                        console.log("EXAMS HERE:",exams);
                }
        },[exams]);

        useEffect(()=>{
                if(loadingStudent === false && student.length != 0){
                        console.log("STUDENT HERE:",student);
                }
        },[student]);


        useEffect(()=>{
                if(loadingProfessor === false && professor){
                        console.log("PROFESSOR HERE:",professor);
                }
        },[professor]);


//   // Handle file selection
        const handleFileChange = (event) => {
                setSelectedFile(event.target.files[0]);
                console.log("HANDLE FILE CHANGE REACHED");
        };



  // Handle file upload using .then to ensure order
        const handleFileUpload = async (file) => {
                
                console.log("TRYING FILE UPLOAD");
                console.log("selected FIle:",selectedFile);
                console.log("caled File:",file);
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
                        console.log("URL: ", result);
                        
                        const updatedExam = await fetch("/api/updateExam", {
                                method: "POST",
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ examid: selectedExam.id, completedUrl: result.url})
                        });

                        const resultExam = await updatedExam.json();


                        setSelectedExam(resultExam);

                        console.log("resultExam: ", resultExam);

                        return result.url || null;
                } catch (error) {
                        console.error("Error uploading file:", error);
                        return null;
                } finally{
                        setUploading(false);
                }
                return null;
        };


//         const deleteDocumentation = async (userId) => {
//                 try {
//                   const response = await fetch('/api/deleteForm', {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify({
//                       userId,
//                       type: 'REGISTRATION_ELIGIBILITY',
//                     }),
//                   });
              
//                   const result = await response.json();
              
//                   if (!response.ok || !result || result.message !== 'Form deleted successfully') {
//                     throw new Error('Deletion failed');
//                   }
              
//                   setAlertMessage('Documentation deleted successfully!');
//                   setShowAlert(true);
//                   return true;
              
//                 } catch (error) {
//                   console.error('Error deleting form:', error);
//                   setAlertMessage('Form deletion failed.');
//                   setShowAlert(true);
//                   return false;
//                 }
//         };


//         const getUserDocumentation = async (userId) => {
//                 try {
//                   const response = await fetch(`/api/getUserDocumentation?user_id=${userId}`);
//                   if (!response.ok) {
//                     throw new Error(`HTTP error! status: ${response.status}`);
//                   }
              
//                   const data = await response.json();
//                   return data?.exists ? data.form : null;
              
//                 } catch (error) {
//                   console.error('Error while getting user documentation:', error);
//                   return null;
//                 }
//         };

        // ========================================== JSX ELEMENT FUNCTIONS ==========================================
        function ExamListView({ exams, loading, setSelectedExam }) {
                // Define container styles for a list view
                
        
                // Display a loading message if data hasn't loaded yet
                if (loading) {
                        console.log("returning loading");
                return <div style={{ padding: '16px', textAlign: 'center' }}>Loading exams...</div>;
                }
        
                // Function to handle click on an exam list item
                const handleExamClick = (exam) => {
                setSelectedExam(exam);
                console.log("SELECTED EXAM:",exam)
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
                const displayedExams = exams.length === 0 ? [] : exams;
                console.log("displayedExams:", displayedExams);
                return (
                <div className="listContainerStyle">
                {displayedExams?.map((exam) => (
                <div
                        key={exam.id}
                        className="listItemStyle"
                        onClick={() => handleExamClick(exam)}
                        role="button"
                        tabIndex={0}
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
                
                return (
                  <div className="card-overlay">
                    <div className="card">
                      <button
                        className="close-button"
                        onClick={onClose}
                        aria-label="Close exam details"
                      >
                        &times;
                      </button>
                        {/* ================== EXAM DETAILS ================== */}
                      <h2>{selectedExam.course.name} - {selectedExam.name}</h2>
                        <p>   
                                <strong>Date:</strong>{' '}
                                {new Date(selectedExam.date).toLocaleDateString()}
                        </p>
                        <p>  
                                <strong>Time:</strong>{' '}
                                {new Date(selectedExam.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric' })}
                        </p>
                        <p>
                                <strong>Location:</strong> {selectedExam.location}
                        </p>

                        {/* ================== COURSE DETAILS ================== */}

                                <h3 className="section-title">Course Information</h3>

                                <p>
                                <strong>Course Name:</strong> {selectedExam.course.name}
                                </p>
                                
                                {loadingProfessor ? (
                                        <p>loading professor information</p>
                                ):(
                                        professor && professor.account ? (
                                                <>
                                                        <p>
                                                        <strong>Professor Name: </strong> {professor.account.name}
                                                        </p>
                                                        <p>
                                                        <strong> Professor Email: </strong> {professor.account.email}
                                                        </p>
                                                </>
                                                ) : (
                                                <p>No student data available.</p>
                                                )
                                )}
                               

                                <h3 className="section-title">Student Information</h3>
                                {loadingStudent ? (
                                        <p>loading student information</p>
                                ):(
                                        student && student.account ? (
                                                <>
                                                        <p>
                                                        <strong>Student Name: {' '}</strong> {student.account.name}
                                                        </p>
                                                        <p>
                                                        <strong>Student Email: </strong> {student.account.email}
                                                        </p>
                                                        <p>
                                                        <strong>Accomodations: </strong> 
                                                        {student.accommodations.length === 0? 'No Accommodations' :student.accommodations
                                                                .map((acc) => acc.type)
                                                                .join(", ")}
                                                        </p>
                                                </>
                                                ) : (
                                                <p>No student data available.</p>
                                                )
                                )}
                       
                        {/* ================== EXAM UPLOAD/DOWNLOAD ================== */}
                        
                                <h3 className="section-title">Exam Download/Upload</h3>
                                        <button
                                                onClick={() => window.open(selectedExam.examUrl, '_blank', 'noopener,noreferrer')}
                                                >
                                                Download Exam
                                        </button>


                                        <input type="file" onChange={handleFileChange}/>
                                        

                                        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                                        {selectedExam.completedExamURL && (
                                        <p style={{ color: 'green' }}>
                                                File uploaded!{' '}
                                                <a href={selectedExam.completedExamURL} target="_blank" rel="noopener noreferrer"> View File </a>
                                        </p>
                                        )}

                                        <button onClick={() => handleFileUpload(selectedFile)} disabled={uploading}> {uploading ? 'Uploading...' : selectedExam.completedExamURL ? 'Reupload Exam':'Upload Exam'} </button>
                                    
                                        
                        
                    </div>
                  </div>
                );
              }



  //========================================== RETURN LOGIC ==========================================
        return (
        <div className="staffExamView">
                <h2 ref={headingRef} tabIndex={0} aria-label="Exams Assigned to You">
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
