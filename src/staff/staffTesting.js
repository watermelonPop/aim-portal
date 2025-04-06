import { fa } from '@faker-js/faker';
import { useState, useEffect, useRef, useMemo } from 'react';

function StaffExamView({ userInfo, displayHeaderRef, settingsTabOpen, lastIntendedFocusRef }) {
        const [exams, setExams] = useState([]);
        const [student, setStudent] = useState([]);
        const   [loadingStudent, setLoadingStudent] = useState(false);
        const [loading, setLoading] = useState(false);
        const [expandedExam, setExpandedExam] = useState(null);
        const [selectedExam, setSelectedExam] = useState([]);
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
                setExams(data.exams);
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


//   // Handle file selection

//   const handleFileChange = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       setSelectedFile(file);
//       setErrorMessage(null);
//       setFileUrl(null);
//     }
//   };

//   // Handle file upload using .then to ensure order
//   const handleFileUpload = (examId) => {
//     if (!selectedFile) {
//       setErrorMessage("Please select a file first.");
//       return;
//     }
//     setUploading(true);
//     const formData = new FormData();
//     formData.append("file", selectedFile);
//     formData.append("examId", examId);

//     fetch("/api/submitCompletedExam", {
//       method: "POST",
//       body: formData,
//     })
//       .then((response) => {
//         if (!response.ok) throw new Error("Upload failed.");
//         return response.json();
//       })
//       .then((result) => {
//         setFileUrl(result.url);
//       })
//       .catch((error) => {
//         console.error("File upload error:", error);
//         setErrorMessage("Upload failed.");
//       })
//       .finally(() => {
//         setUploading(false);
//       });
//   };

        // ========================================== JSX ELEMENT FUNCTIONS ==========================================
        function ExamListView({ exams, loading, setSelectedExam }) {
                // Define container styles for a list view
                const listContainerStyle = {
                padding: '16px',
                maxWidth: '600px',
                margin: '0 auto'
                };
        
                // Define styles for each exam list item
                const listItemStyle = {
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '12px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column'
                };
        
                const titleStyle = {
                margin: '0 0 8px',
                fontSize: '1.2em'
                };
        
                const detailStyle = {
                margin: 0,
                fontSize: '0.9em',
                color: '#555'
                };
        
                // Display a loading message if data hasn't loaded yet
                if (loading) {
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
                };      
        
                // Determine which array to slice based on the search query
                const displayedExams = exams.length === 0 ? [] : exams;
                console.log("displayedExams:", displayedExams);
                return (
                <div style={listContainerStyle}>
                {displayedExams?.map((exam) => (
                <div
                        key={exam.id}
                        style={listItemStyle}
                        onClick={() => handleExamClick(exam)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                        if (e.key === 'Enter') handleExamClick(exam);
                        }}
                        //TODO: FIX THESE
                        aria-label={`Exam titled ${exam.name}, subject: ${exam.courseId}, date: ${exam.date}`}
                >
                        <h3 style={titleStyle}>{exam.course.name}</h3>
                        <p style={detailStyle}>Subject: {exam.courseId}</p>
                        <p style={detailStyle}>Date: {exam.date}</p>
                </div>
                ))}
                </div>
                );
        }


  //========================================== RETURN LOGIC ==========================================
        return (
        <div className="staffExamView">
                <h2 ref={headingRef} tabIndex={0} aria-label="Exams Assigned to You">
                        Exams Assigned to You
                </h2>
                <div>
                        <ExamListView
                        exams={exams}
                        loading={loading}
                        setSelectedExam={setSelectedExam}
                        />
                </div>
        </div>
        );
}

export default StaffExamView;
