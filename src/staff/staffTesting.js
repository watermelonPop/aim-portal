import { useEffect, useRef, useState } from 'react';

function StaffTesting({ userInfo, displayHeaderRef, settingsTabOpen, lastIntendedFocusRef }) {
        //====================================================== DONT TOUCH ======================================================
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

        useEffect(()=>{
                console.log("last intended focus ref");
        },[lastIntendedFocusRef]);

        //====================================================== USE EFFECT ======================================================
        
        /*
        1. should only be viewable to those with testing access.
                1.1 go into loginscreen and make sure that it is sorted by role.
        2. exams should be in list view with click to expand portions for each exam.
                2.2:the expanded form of the list should include: 
                - name of the student
                - date of the exam
                - course of the exam
                - any accomodations regarding the taking of the exam
                - pdf of the exam
        3. include pagination
        4. maybe include a sort by date/class?
        5. ability to upload a completed exam.
        
        sort exams by the userID?
                -exams are already sorted to advisors
        */

        const [exams, setExams] = useState([]);
        const [loading, setLoading] = useState(false);

        useEffect(()=>{
                const fetchExamsByAdvisor = async() => {
                        setLoading(true);
                        try{
                                const res = await fetch(`/api/getExamFromAdvisor?userId=${userInfo?.id}`);
                                if(!res.ok) throw new Error('Failed to fetch courses');
                                const data = await res.json();
                                setExams(data);
                                //console.log("EXAMS RELATED TO ADVISOR",data);
                        }
                        catch(error){
                                console.error("error fetching exams:",error);
                        }
                        finally{
                                setLoading(false);
                        }
                };

                if(userInfo?.id){
                        console.log("fetching exams");
                        fetchExamsByAdvisor();
                }
        },[userInfo]);

        const [selectedFile, setSelectedFile] = useState(null);
        const [uploading, setUploading] = useState(false);
        const [fileUrl, setFileUrl] = useState(null);
        const [errorMessage, setErrorMessage] = useState(null);
        
        
        // This function handles the change event on the file input
        const handleFileChange = (event) => {
                const file = event.target.files[0];
                if (file) {
                    setSelectedFile(file);
                    setErrorMessage(null);
                    setFileUrl(null);
                }
            };
        
        // Component for file upload button and input
        function ExamSubmissionButton() {
                return (
                    <div id="uploadFileOuter">
                        <label htmlFor="uploadFile">Upload Exam Here</label>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            data-testid="uploadFile"
                            id="uploadFile"
                            name="uploadFile"
                        />
                        <button onClick={handleSubmitUpload} disabled={!selectedFile || uploading}>
                            Submit
                        </button>
                    </div>
                );
            }
            

        const handleSubmitUpload = async () => {
                if (!selectedFile) {
                    setErrorMessage("Please select a file first.");
                    return;
                }
            
                setUploading(true);
                try {
                    const formData = new FormData();
                    formData.append("file", selectedFile);
            
                    const response = await fetch("/api/submitDocumentation", {
                        method: "POST",
                        body: formData,
                    });
            
                    if (!response.ok) throw new Error("Failed to upload file");
            
                    const result = await response.json();
                    setFileUrl(result.url);
                    console.log("Uploaded URL:", result.url);
                } catch (error) {
                    console.error("Upload error:", error);
                    setErrorMessage("Upload failed.");
                } finally {
                    setUploading(false);
                }
            };

        
        return (
            <div className="staffTesting">
                <h2 ref={headingRef} tabIndex={0} className="dashboardTitle">
                    STAFF TESTING
                </h2>
                {ExamSubmissionButton()}
                {uploading && <p>Uploading file...</p>}
                {fileUrl && (
                <p>
                        File uploaded! View it here:{" "}
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                        {fileUrl}
                        </a>
                </p>
                )}
                {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            </div>
        );
}

export default StaffTesting;