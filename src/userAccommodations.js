import './App.css';
import { useEffect, useState } from 'react';


function UserAccommodations({name, email, setAlertMessage, setShowAlert}) {
        const [formData, setFormData] = useState({
                name: name,
                email: email,
                dob: '',
                uin: '',
                phoneNumber: '',
                disability: '',
                testing: '',
                inClass: '',
                housing: '',
                sideEffect: '',
                accommodations: '',
                pastAcc: ''
        });

        const [errors, setErrors] = useState(null);

        const [existingRequest, setExistingRequest] = useState(null);

        const handleChange = (e) => {
                const { name, value } = e.target;
                setFormData(prevState => ({
                        ...prevState,
                        [name]: value
                }));
        };

        const validateForm = () => {
                let newErrors = {};

                if (!formData.name) newErrors.name = "Name is required";
                if (!formData.email) newErrors.email = "Email is required";
                
                // Validate Date of Birth
                if (!formData.dob) newErrors.dob = "Date of Birth is required";
                
                // Validate UIN (assuming it should be 9 digits)
                if (!formData.uin || !/^\d{9}$/.test(formData.uin)) newErrors.uin = "UIN must be 9 digits";
                
                // Validate Phone Number (simple check for 10 digits)
                if (!formData.phoneNumber || !/^\d{10}$/.test(formData.phoneNumber)) newErrors.phoneNumber = "Please enter a valid 10-digit phone number";
                
                                // Validate text areas (checking if they're not empty)
                ['disability', 'testing', 'inClass', 'housing', 'sideEffect', 'accommodations', 'pastAcc'].forEach(field => {
                        if (!formData[field].trim()) newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
                });

                //alert(JSON.stringify(newErrors));
                setErrors(newErrors);
                /*if(Object.keys(newErrors).length !== 0){
                        alert(errors.name);
                }*/
                return { isValid: Object.keys(newErrors).length === 0, newErrors };
        };

        const handleSubmit = async (e) => {
                e.preventDefault();
                const { isValid, newErrors } = validateForm();
                if (isValid) {
                        console.log("before Form submitted:", formData);
                        try {
                                const response = await fetch('/api/createRequest', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ 
                                        user_name: formData.name,
                                        user_email: formData.email,
                                        dob: formData.dob,
                                        uin: formData.uin,
                                        phone_number: formData.phoneNumber, // Note: changed from phoneNumber to phone_number to match API
                                        notes: formData.disability + "\n" + formData.testing + "\n" + formData.inClass + "\n" + formData.housing + "\n" + formData.sideEffect + "\n" + formData.accommodations + "\n" + formData.pastAcc
                                }),
                                });
                
                                if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                                }
                
                                const result = await response.json();
                
                                if (result.message === 'Request created successfully') {
                                        // You might want to clear the form or redirect the user here
                                        setAlertMessage("Request submitted successfully");
                                        setShowAlert(true);

                                        const fetchRequest = async () => {
                                                const request = await checkRequests(email);
                                                setExistingRequest(request);
                                        };
                                        fetchRequest();
                                } else {
                                        setAlertMessage("Request submission failed. Please try again.");
                                        setShowAlert(true);
                                }
                        } catch (error) {
                                console.error('Error submitting request:', error);
                                setAlertMessage("Request submission failed. Please try again.");
                                setShowAlert(true);
                        }
                } else {
                        let newErrorMess = "Incorrect required fields: \n";
                        for (const key in newErrors) {
                                if (newErrors.hasOwnProperty(key)) {
                                    newErrorMess += newErrors[key] + "\n";
                                }
                        }
                       
                        setAlertMessage(newErrorMess);
                        setShowAlert(true);
                }
        };
            

        const handleCancel = async (e) => {
                e.preventDefault();
                //handleCancel HERE
                try {
                        const response = await fetch('/api/cancelRequest', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                                email: existingRequest.user_email
                            }),
                        });
            
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
            
                        const result = await response.json();
            
                        if (result.message === 'Request deleted successfully') {
                            //alert("Request cancelled successfully!");
                            // You might want to clear the form or redirect the user here
                            setAlertMessage("Request cancelled successfully!");
                            setShowAlert(true);
                            setExistingRequest(null);
                        } else {
                            setAlertMessage("Request cancellation failed. Please try again.");
                            setShowAlert(true);
                        }
                } catch (error) {
                        console.error('Error cancelling request:', error);
                        setAlertMessage("Request cancellation failed. Please try again.");
                        setShowAlert(true);
                }
        };

        const checkRequests = async (email) => {
                try {
                        const response = await fetch(`/api/checkRequests?email=${email}`);
                        if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        const data = await response.json();
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
        

        useEffect(() => {
                const fetchRequest = async () => {
                    const request = await checkRequests(email);
                    setExistingRequest(request);
                };
                fetchRequest();
        }, [email]);

        return (
                <>
                <div role="presentation" className="newStudentDiv">
                        <p className='dashboardTitle'>New Student Application</p>
                        {existingRequest === null ? (
                                <>
                                <p className='subTitle'>Need Accommodations? Start Here!</p>
                                <form className="newStudentApp" onSubmit={handleSubmit}>
                                        <label htmlFor="name">Name</label>
                                        <input name="name" value={formData.name} type="text" onChange={handleChange} />
                                        <label htmlFor="email">Email</label>
                                        <input name="email" value={formData.email} type="email" onChange={handleChange} />
                                        <label htmlFor="dob">Date of Birth</label>
                                        <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
                                        <label htmlFor="uin">UIN</label>
                                        <input type="number" name="uin" value={formData.uin} onChange={handleChange} />
                                        <label htmlFor="phoneNumber">Phone Number</label>
                                        <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
                                        <label htmlFor="disability">What is your disability or disabilities?</label>
                                        <textarea name="disability" rows="5" value={formData.disability} onChange={handleChange}></textarea>
                                        <label htmlFor="testing">What challenges do you experience related to taking tests/exams, if any?</label>
                                        <textarea name="testing" rows="5" value={formData.testing} onChange={handleChange}></textarea>
                                        <label htmlFor="inClass">What challenges do you experience in the classroom or learning environment, if any?</label>
                                        <textarea name="inClass" rows="5" value={formData.inClass} onChange={handleChange}></textarea>
                                        <label htmlFor="housing">If you are living on-campus, do you require any disability accommodations in the housing environment?</label>
                                        <textarea name="housing" rows="5" value={formData.housing} onChange={handleChange}></textarea>
                                        <label htmlFor="sideEffect">Do you experience any side effects related to treatment or medications that may be relevant to identifying accommodations?</label>
                                        <textarea name="sideEffect" rows="5" value={formData.sideEffect} onChange={handleChange}></textarea>
                                        <label htmlFor="accommodations">What specific accommodations are you requesting?</label>
                                        <textarea name="accommodations" rows="5" value={formData.accommodations} onChange={handleChange}></textarea>
                                        <label htmlFor="pastAcc">What accommodations have you used in the past?</label>
                                        <textarea name="pastAcc" rows="5" value={formData.pastAcc} onChange={handleChange}></textarea>
                                        <button type="submit" aria-label="submit">Submit</button>
                                </form>
                                </>
                        ) : (
                                <>
                                <p className='subTitle'>You already have an existing request: </p>
                                <form className="newStudentApp" onSubmit={handleCancel}>
                                        <label htmlFor="name">Name</label>
                                        <input name="name" type="text" value={existingRequest.user_name}/>
                                        <label htmlFor="email">Email</label>
                                        <input name="email" type="email" value={existingRequest.user_email}/>
                                        <label htmlFor="dob">Date of Birth</label>
                                        <input type="date" name="dob" value={existingRequest.dob}/>
                                        <label htmlFor="uin">UIN</label>
                                        <input type="number" name="uin" value={existingRequest.uin}/>
                                        <label htmlFor="phoneNumber">Phone Number</label>
                                        <input type="tel" name="phoneNumber" value={existingRequest.phone_number}/>
                                        <label htmlFor="notes">Notes</label>
                                        <textarea name="notes" value={existingRequest.notes}></textarea>
                                        <button type="submit" aria-label="cancel request">Cancel Request</button>
                                </form>
                                </>
                        )}
                </div>
                </>
        );
}

export default UserAccommodations;