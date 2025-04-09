
import { useEffect, useState, useRef } from 'react';


export function UserAccommodations({userInfo, setAlertMessage, setShowAlert, settingsTabOpen, displayHeaderRef}) {
        const localRef = useRef(null);
        const headingRef = displayHeaderRef || localRef;
        const [loading, setLoading] = useState(false);
        const [loaded, setLoaded] = useState(false);
        const [formData, setFormData] = useState({
                name: userInfo.name || "",
                email: userInfo.email || "",
                dob: userInfo.dob || "",
                uin: userInfo.uin || "",
                phone_number: userInfo.phone_number || "",
                disability: '',
                testing: '',
                inClass: '',
                housing: '',
                sideEffect: '',
                accommodations: '',
                pastAcc: '',
                file: null,
        });

        const [errors, setErrors] = useState(null);

        const [existingRequest, setExistingRequest] = useState(null);

        const handleFileChange = (event) => {
                setFormData(prevState => ({
                        ...prevState,
                        ["file"]: event.target.files[0]
                }));
        };

        const handleChange = (e) => {
                const { name, value } = e.target;
                if (!name) {
                        console.log('Missing name or value in handleChange', e.target);
                        return;
                }
                setFormData(prevState => ({
                        ...prevState,
                        [name]: value
                }));
        };

        const validateForm = () => {
                let newErrors = {};

                if (!formData.name || formData.name === '') newErrors.name = "Name is required";
                if (!formData.email) newErrors.email = "Email is required";
                
                // Validate Date of Birth
                if (!formData.dob) newErrors.dob = "Date of Birth is required";
                
                // Validate UIN (assuming it should be 9 digits)
                if (!formData.uin || !/^\d{9}$/.test(formData.uin)) newErrors.uin = "UIN must be 9 digits";
                
                // Validate Phone Number (simple check for 10 digits)
                if (!formData.phone_number || !/^\d{10}$/.test(formData.phone_number)) newErrors.phone_number = "Please enter a valid 10-digit phone number";
                
                                // Validate text areas (checking if they're not empty)
                if(['disability', 'testing', 'inClass', 'housing', 'sideEffect', 'accommodations', 'pastAcc'].some(field => !formData[field].trim())) newErrors.notes = "Please answer all of the longform questions";

                //alert(JSON.stringify(newErrors));
                setErrors(newErrors);
                /*if(Object.keys(newErrors).length !== 0){
                        alert(errors.name);
                }*/
                return { isValid: Object.keys(newErrors).length === 0, newErrors };
        };

        const handleFileUpload = async (file) => {
                console.log("TRYING FILE UPLOAD");
                if (!file) return null;
                const formDataToSend = new FormData();
                formDataToSend.append("file", file);
                try {
                        const response = await fetch("/api/submitDocumentation", {
                            method: "POST",
                            body: formDataToSend,
                        });
                
                        const result = await response.json();
                        console.log("URL: ", result);
                        return result.url || null;
                } catch (error) {
                        console.error("Error uploading file:", error);
                        return null;
                }
                return null;
        };

        const handleSubmit = async (e) => {
                e.preventDefault();
                const { isValid, newErrors } = validateForm();
              
                if (!isValid) {
                  const errorMsg = Object.values(newErrors).reduce(
                    (msg, err) => `${msg}${err}\n`,
                    'Incorrect required fields: \n'
                  );
                  setAlertMessage(errorMsg);
                  setShowAlert(true);
                  return;
                }
              
                console.log("before Form submitted:", formData);
              
                let fileUrl = null;
                let has_doc = false;
              
                if (formData.file) {
                  try {
                    fileUrl = await handleFileUpload(formData.file);
                    has_doc = fileUrl !== null;
                  } catch (error) {
                    console.error('Error submitting documentation:', error);
                    setAlertMessage("Documentation Submission failed. Please try again.");
                    setShowAlert(true);
                    return;
                  }
                }
              
                try {
                  const response = await fetch('/api/createRequest', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      userId: userInfo.id,
                      documentation: has_doc,
                      notes: [
                        formData.disability,
                        formData.testing,
                        formData.inClass,
                        formData.housing,
                        formData.sideEffect,
                        formData.accommodations,
                        formData.pastAcc
                      ].join('\n'),
                      doc_url: fileUrl
                    }),
                  });
              
                  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
              
                  const result = await response.json();
                  console.log("SUBMIT: ", result);
              
                  if (result?.success) {
                    setAlertMessage("Request submitted successfully");
                    setShowAlert(true);
              
                    const request = await checkRequests(userInfo.id);
                    setExistingRequest(request);
                  } else {
                    setAlertMessage("Request submission failed. Please try again.");
                    setShowAlert(true);
                  }
                } catch (error) {
                  console.error('Error submitting request:', error);
                  setAlertMessage("Request submission failed. Please try again.");
                  setShowAlert(true);
                }
        };
              
            

        const handleCancel = async (e) => {
                e.preventDefault();
                let deletedForm = await deleteDocumentation(userInfo.id);
                if(deletedForm === true){
                        await cancelRequest(userInfo.id);
                }
        };

        const deleteDocumentation = async (userId) => {
                try {
                  const response = await fetch('/api/deleteForm', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      userId,
                      type: 'REGISTRATION_ELIGIBILITY',
                    }),
                  });
              
                  const result = await response.json();
              
                  if (!response.ok || !result || result.message !== 'Form deleted successfully') {
                    throw new Error('Deletion failed');
                  }
              
                  setAlertMessage('Documentation deleted successfully!');
                  setShowAlert(true);
                  return true;
              
                } catch (error) {
                  console.error('Error deleting form:', error);
                  setAlertMessage('Form deletion failed.');
                  setShowAlert(true);
                  return false;
                }
        };
              

        const cancelRequest = async (userId) => {
                try {
                  const response = await fetch('/api/cancelRequest', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId }),
                  });
              
                  const result = await response.json();
              
                  if (!response.ok || !result || result.message !== 'Request deleted successfully') {
                    throw new Error('Cancellation failed');
                  }
              
                  setAlertMessage('Request cancelled successfully!');
                  setShowAlert(true);
                  setExistingRequest(null);
                  return true;
              
                } catch (error) {
                  console.error('Error cancelling request:', error);
                  setAlertMessage('Request cancellation failed. Please try again.');
                  setShowAlert(true);
                  return false;
                }
        };
              

        const checkRequests = async (userId) => {
                try {
                        const response = await fetch(`/api/checkRequests?userId=${userId}`);
                        if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        const data = await response.json();
                        console.log("CHECK REQUESTS DATA: ", data);
                        if (data.exists) {
                                return data.request;
                        } else {
                                console.log('No request found for this user');
                                return null;
                        }
                } catch (error) {
                        console.error('Error while checking user requests:', error);
                        // Consider if you really want to redirect on error
                        // window.location.href = "/";
                        return null;
                }
        };

        const getUserDocumentation = async (userId) => {
                try {
                  const response = await fetch(`/api/getUserDocumentation?user_id=${userId}`);
                  if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                  }
              
                  const data = await response.json();
                  return data?.exists ? data.form : null;
              
                } catch (error) {
                  console.error('Error while getting user documentation:', error);
                  return null;
                }
        };
              

        function formatDate(dateString) {
                console.log("FORMAT: ", dateString);
                if (!dateString) return '';
                const date = new Date(dateString);
                return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
        }
        

        useEffect(() => {
                console.log("USER INFO: ", userInfo);
                setLoading(true);
                const fetchRequest = async () => {
                    const request = await checkRequests(userInfo.id);
                    setExistingRequest(request);
                    console.log("in use effect: ", request);
                    setLoading(false);
                };
                fetchRequest();
        }, [userInfo]);

        useEffect(() => {
                setFormData({...formData, name: userInfo.name,
                        email: userInfo.email,
                        dob: userInfo.dob,
                        uin: userInfo.uin,
                        phone_number: userInfo.phone_number});
        }, [userInfo]);

        useEffect(() => {
                if(!existingRequest || !userInfo) return;

                const fetchForm = async () => {
                        const form = await getUserDocumentation(userInfo.id);
                        setExistingRequest({...existingRequest, form: form});
                };
                fetchForm();
        }, [userInfo, existingRequest]);

        useEffect(() => {
                if (
                  loading ||
                  !headingRef.current ||
                  loaded ||
                  (existingRequest && !existingRequest.documentation) || 
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
        }, [loading, existingRequest, headingRef, loaded]);
              

        UserAccommodations.setExistingRequest = setExistingRequest;
        UserAccommodations.existingRequest = existingRequest;
        UserAccommodations.handleChange = handleChange;
        UserAccommodations.formData = formData;
        UserAccommodations.setFormData = setFormData;
        UserAccommodations.errors = errors;
        UserAccommodations.validateForm = validateForm;
        UserAccommodations.handleFileUpload = handleFileUpload;
        UserAccommodations.getUserDocumentation = getUserDocumentation;
        UserAccommodations.deleteDocumentation = deleteDocumentation;

        if (loading) {
                return (
                        <>
                        <div role="presentation" className="newStudentDiv">
                                <h2 className='dashboardTitle'
                                        >New Student Application</h2>
                                <p>Loading...</p>
                        </div>
                        </>
                );
        }

        return (
                <>
                <div role="presentation" className="newStudentDiv">
                        <h2 className='dashboardTitle'
                                >New Student Application</h2>
                        {existingRequest === null ? (
                                <>
                                <h3 className='subTitle'>Need Accommodations? Start Here!</h3>
                                <form className="newStudentApp" onSubmit={handleSubmit} data-testid="newStudentApp">
                                        <div role="group">
                                                <label htmlFor="name">Name</label>
                                                <input ref={headingRef} data-testid="name" id="name" name="name" value={formData.name || ""} type="text" onChange={handleChange}/>
                                        </div>
                                        <div role="group">
                                                <label htmlFor="email">Email</label>
                                                <input data-testid="email" id="email" name="email" value={formData.email || ""} type="email" onChange={handleChange} />
                                        </div>
                                        <div role="group">
                                                <label htmlFor="dob">Date of Birth</label>
                                                <input data-testid="dob" id="dob" type="date" name="dob" value={formatDate(formData.dob) || ""} onChange={handleChange} />
                                        </div>
                                        <div role="group">
                                                <label htmlFor="uin">UIN</label>
                                                <input data-testid="uin" id="uin" type="number" name="uin" value={formData.uin || ""} onChange={handleChange} />
                                        </div>
                                        <div role="group">
                                                <label htmlFor="phone_number" >Phone Number</label>
                                                <input data-testid="phone_number" id="phone_number" type="tel" name="phone_number" value={formData.phone_number || ""} onChange={handleChange} />
                                        </div>
                                        <div role="group">
                                                <label htmlFor="disability">What is your disability or disabilities?</label>
                                                <textarea data-testid="disability" id="disability" name="disability" rows="5" value={formData.disability || ""} onChange={handleChange}></textarea>
                                        </div>
                                        <div role="group">
                                                <label htmlFor="testing">What challenges do you experience related to taking tests/exams, if any?</label>
                                                <textarea data-testid="testing" id="testing" name="testing" rows="5" value={formData.testing || ""} onChange={handleChange}></textarea>
                                        </div>
                                        <div role="group">
                                                <label htmlFor="inClass">What challenges do you experience in the classroom or learning environment, if any?</label>
                                                <textarea data-testid="inClass" id="inClass" name="inClass" rows="5" value={formData.inClass || ""} onChange={handleChange}></textarea>
                                        </div>
                                        <div role="group">
                                                <label htmlFor="housing">If you are living on-campus, do you require any disability accommodations in the housing environment?</label>
                                                <textarea data-testid="housing" id="housing" name="housing" rows="5" value={formData.housing || ""} onChange={handleChange}></textarea>
                                        </div>
                                        <div role="group">
                                                <label htmlFor="sideEffect">Do you experience any side effects related to treatment or medications that may be relevant to identifying accommodations?</label>
                                                <textarea data-testid="sideEffect" id="sideEffect" name="sideEffect" rows="5" value={formData.sideEffect || ""} onChange={handleChange}></textarea>
                                        </div>
                                        <div role="group">
                                                <label htmlFor="accommodations">What specific accommodations are you requesting?</label>
                                                <textarea data-testid="accommodations" id="accommodations" name="accommodations" rows="5" value={formData.accommodations || ""} onChange={handleChange}></textarea>
                                        </div>
                                        <div role="group">
                                                <label htmlFor="pastAcc">What accommodations have you used in the past?</label>
                                                <textarea data-testid="pastAcc" id="pastAcc" name="pastAcc" rows="5" value={formData.pastAcc || ""} onChange={handleChange}></textarea>
                                        </div>
                                        <div role="group" id="uploadFileOuter">
                                                <label htmlFor="uploadFile">Already have documentation? Upload Here!</label>
                                                <input type="file" onChange={handleFileChange} data-testid="uploadFile" id="uploadFile" name="uploadFile"/>
                                        </div>
                                        <button type="submit" aria-label="submit">Submit</button>
                                </form>
                                </>
                        ) : (
                                <>
                                <h3 className='subTitle'>You already have an existing request: </h3>
                                {
                                        existingRequest.documentation ? (
                                                <p className='subTitle'>You have submitted your documentation, and your request is under review! Review your documentation <a ref={headingRef} href={existingRequest?.form?.formUrl} tabIndex={0} id="firstFocus">here</a></p>
                                        ) : (
                                                <p className='subTitle'>You have not submitted your documentation yet. Please submit it in Forms before we can review your request.</p>
                                        )
                                }
                                <form className="newStudentApp" onSubmit={handleCancel} data-testid="existingRequest">
                                        <div role="group">
                                        <label htmlFor="name">Name</label>
                                        <input data-testid="name" id="name" name="name" type="text" value={userInfo.name} readOnly/>
                                        </div>
                                        <div role="group">
                                        <label htmlFor="email">Email</label>
                                        <input data-testid="email" id="email" name="email" type="email" value={userInfo.email} readOnly/>
                                        </div>
                                        <div role="group">
                                        <label htmlFor="dob">Date of Birth</label>
                                        <input data-testid="dob" id="dob" type="date" name="dob" value={formatDate(userInfo.dob)} readOnly/>
                                        </div>
                                        <div role="group">
                                        <label htmlFor="uin">UIN</label>
                                        <input data-testid="uin" id="uin" type="number" name="uin" value={userInfo.uin} readOnly/>
                                        </div>
                                        <div role="group">
                                        <label htmlFor="phone_number">Phone Number</label>
                                        <input data-testid="phone_number" id="phone_number" type="tel" name="phone_number" value={userInfo.phone_number} readOnly/>
                                        </div>
                                        <div role="group">
                                        <label htmlFor="notes">Notes</label>
                                        <textarea data-testid="notes" id="notes" name="notes" value={existingRequest.notes} readOnly></textarea>
                                        </div>
                                        <button type="submit" aria-label="cancel request" data-testid="cancelBtn">Cancel Request</button>
                                        <a href="#firstFocus">Back to Top</a>
                                </form>
                                </>
                        )}
                </div>
                </>
        );
}

export default UserAccommodations;