import './App.css';
import { useState, useEffect } from 'react';
import logo2 from './logo2.png';

function SignUp({ userInfo, setUserInfo, setAlertMessage, setShowAlert, setUserConnected, setSettings, setLoading }) {
        const [chosenRole, setChosenRole] = useState("USER");
        const [formData, setFormData] = useState({
                id: userInfo.id,
                name: userInfo.name || "",
                email: userInfo.email || "",
                dob: userInfo.dob || "",
                phone_number: userInfo.phone_number || ""
        });
        const [errors, setErrors] = useState(null);

        useEffect(() => {
                console.log("USEE EFFECT");
                setLoading(false);
        }, []);

        const handleRoleChange = (role) => {
                setChosenRole(role);
        };

        const handleChange = (e) => {
                const { name, value } = e.target;
                setFormData(prevState => ({
                        ...prevState,
                        [name]: value
                }));
        };

        const signUpUser = async (chosenRole, userInfo)=> {
                const { isValid, newErrors } = validateForm(chosenRole);
                if(isValid){
                        if(chosenRole === "USER"){
                                console.log(formData);
                                try {
                                        const response = await fetch('/api/createUser', {
                                                method: 'POST',
                                                credentials: 'include', // Ensure cookies are sent with the request
                                                headers: {
                                                        'Content-Type': 'application/json'
                                                },
                                                body: JSON.stringify({ 
                                                        userId: formData.id, 
                                                        dob: new Date(formData.dob).toISOString(), 
                                                        uin: Number(formData.uin), 
                                                        phoneNumber: formData.phone_number
                                                }),
                                        });
                                
                                        const data = await response.json();
                                
                                        if (!response.ok) {
                                                throw new Error(data.message || 'Sign Up failed');
                                        }

                                        if(data && data.success){
                                                if(data.success === true){
                                                        setLoading(true);
                                                        setUserConnected(true);
                                                        console.log("SETS USER INFO: ", formData);
                                                        setUserInfo({...userInfo, dob: formData.dob, uin: formData.uin, phone_number: formData.phone_number});
                                                }
                                        }
                                } catch (error) {
                                        console.error('Error Signing Up:', error);
                                }
                        }else if(chosenRole === "PROFESSOR"){
        
                        }else if(chosenRole === "STAFF"){
        
                        }
                }else{
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

        const validateForm = (chosenRole) => {
                let newErrors = {};

                if (!formData.name) newErrors.name = "Name is required";
                if (!formData.email) newErrors.email = "Email is required";
                

                if(chosenRole === "USER"){
                        //dob, uin, phone number
                        if (!formData.dob) newErrors.dob = "Date of Birth is required";
                        if (!formData.uin || !/^\d{9}$/.test(formData.uin)) newErrors.uin = "UIN must be 9 digits";
                        if (!formData.phone_number || !/^\d{10}$/.test(formData.phone_number)) newErrors.phone_number = "Please enter a valid 10-digit phone number";
                }else if(chosenRole === "PROFESSOR"){
                        //department
                        if (!formData.department) newErrors.department = "Department is required";
                }else if(chosenRole === "STAFF"){
                        //staff role
                        if (!formData.role) newErrors.role = "Staff Role is required";
                }

                //alert(JSON.stringify(newErrors));
                setErrors(newErrors);
                /*if(Object.keys(newErrors).length !== 0){
                        alert(errors.name);
                }*/
                return { isValid: Object.keys(newErrors).length === 0, newErrors };
        };

        return (
                <main className='basicScreen'>
                        <div className='stickyContainer'>
                                <header className='signUpHeader' role="heading" aria-level="1">
                                        <img src={logo2} alt="TAMU Logo" className='basicLogoImg' />
                                        <h1 className='signUpTitle'>AIM Portal Sign Up</h1>
                                </header>
                                <nav className='tabNav'>
                                        <ul>
                                        {["USER", "PROFESSOR", "STAFF"].map((role) => (
                                                <li 
                                                key={role} 
                                                onClick={() => handleRoleChange(role)} 
                                                id={chosenRole === role ? 'signUpActive' : ''}
                                                >
                                                {role}
                                                </li>
                                        ))}
                                        </ul>
                                </nav>
                        </div>
                        <main className='dashboardOuter'>
                                <form className='newStudentApp'>
                                        <label htmlFor="name">Name</label>
                                        <input 
                                        type="text" 
                                        value={userInfo.name} 
                                        onChange={handleChange}
                                        name="name" 
                                        />

                                        <label htmlFor="email">Email</label>
                                        <input 
                                        type="email" 
                                        value={userInfo.email} 
                                        onChange={handleChange}
                                        name="email" 
                                        />

                                        {chosenRole === "USER" && (
                                        <>
                                                <label htmlFor="dob">Date of Birth</label>
                                                <input type='date' onChange={handleChange} name="dob"></input>
                                                <label htmlFor="uin">UIN</label>
                                                <input onChange={handleChange} name="uin"></input>
                                                <label htmlFor="phone_number">Phone Number</label>
                                                <input type='tel' onChange={handleChange} name="phone_number"></input>
                                        </>
                                        )}

                                        {chosenRole === "PROFESSOR" && (
                                        <>
                                                <label htmlFor='department'>Department</label>
                                                <select onChange={handleChange} name="department">
                                                        <option>College of Agriculture and Life Sciences</option>
                                                        <option>College of Architecture</option>
                                                        <option>College of Arts and Sciences</option>
                                                        <option>Mays Business School</option>
                                                        <option>College of Dentistry</option>
                                                        <option>College of Education and Human Development</option>
                                                        <option>College of Engineering</option>
                                                        <option>School of Engineering Medicine</option>
                                                        <option>Bush School of Government and Public Service</option>
                                                        <option>School of Law</option>
                                                        <option>College of Marine Sciences and Maritime Studies</option>
                                                        <option>College of Medicine</option>
                                                        <option>College of Nursing</option>
                                                        <option>College of Performance, Visualization and Fine Arts</option>
                                                        <option>Irma Lerma Rangel College of Pharmacy</option>
                                                        <option>School of Public Health</option>
                                                        <option>College of Veterinary Medicine and Biomedical Sciences</option>
                                                </select>
                                        </>
                                        )}

                                        {chosenRole === "STAFF" && (
                                        <>
                                                <label htmlFor='role'>Staff Role</label>
                                                <select onChange={handleChange} name='role'>
                                                        <option>Administration</option>
                                                        <option>Testing Center</option>
                                                        <option>Assistive Technology</option>
                                                        <option>Coordinator</option>
                                                </select>
                                        </>
                                        )}

                                        <button type="submit" onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        signUpUser(chosenRole, userInfo);
                                        }}
                                        >Sign Up as {chosenRole}</button>
                                </form>
                        </main>
                </main>
        );
}

export default SignUp;
