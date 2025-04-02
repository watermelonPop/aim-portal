
import { useState, useEffect } from 'react';

function SignUp({ userInfo, setUserInfo, setAlertMessage, setShowAlert, setUserConnected, setSettings, setLoading }) {
        const [chosenRole, setChosenRole] = useState("USER");
        const [formData, setFormData] = useState({
                id: userInfo.id,
                name: userInfo.name || "",
                email: userInfo.email || "",
                dob: userInfo.dob || "",
                phone_number: userInfo.phone_number || "",
                uin: userInfo.uin || "",
                role: "", // in case of STAFF
        });
        const [errors, setErrors] = useState(null);

        useEffect(() => {
                console.log("USE EFFECT");
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

        const signUpUser = async (chosenRole, userInfo) => {
                const { isValid, newErrors } = validateForm(chosenRole);
              
                if (!isValid) {
                  const errorMsg = Object.values(newErrors).reduce(
                    (msg, err) => `${msg}${err}\n`,
                    'Incorrect required fields: \n'
                  );
                  setAlertMessage(errorMsg);
                  setShowAlert(true);
                  return;
                }
              
                if (chosenRole !== 'USER') return; // Staff handling can be added later
              
                try {
                  const payload = {
                    userId: formData.id,
                    dob: new Date(formData.dob).toISOString(),
                    uin: Number(formData.uin),
                    phoneNumber: formData.phone_number,
                  };
              
                  const response = await fetch('/api/createUser', {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                  });
              
                  const data = await response.json();
              
                  if (!response.ok || !data?.success) {
                    throw new Error(data.message || 'Sign Up failed');
                  }
              
                  setLoading(true);
                  setUserConnected(true);
                  setUserInfo({
                    ...userInfo,
                    dob: formData.dob,
                    uin: formData.uin,
                    phone_number: formData.phone_number,
                  });
                } catch (error) {
                  console.error('Error Signing Up:', error);
                  setAlertMessage('Failed to sign up. Please try again.');
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
                <main className='basicScreen' data-testid="sign-up-screen">
                        <div className='stickyContainer'>
                                <header className='signUpHeader' role="heading" aria-level="1">
                                        <svg alt="Texas A&M University Logo" aria-label='TAMU' className='basicLogoImg' xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 216 216"><defs></defs><title>Artboard 1</title><polygon className="cls-1" points="190.36 84.32 173.7 84.32 172.73 84.32 172.31 85.19 160.22 110.34 148.1 85.19 147.69 84.32 146.72 84.32 130.63 84.32 129.09 84.32 129.09 85.85 129.09 94.43 129.09 95.96 130.63 95.96 133.38 95.96 133.38 131.97 130.4 131.97 128.86 131.97 128.86 133.51 128.86 142.08 128.86 143.62 130.4 143.62 148.48 143.62 150.02 143.62 150.02 142.08 150.02 133.51 150.02 131.97 148.48 131.97 145.35 131.97 145.35 106.42 158.86 134.28 160.23 137.12 161.62 134.28 175.27 106.36 175.27 131.97 172.28 131.97 170.74 131.97 170.74 133.51 170.74 142.08 170.74 143.62 172.28 143.62 190.36 143.62 191.9 143.62 191.9 142.08 191.9 133.51 191.9 131.97 190.36 131.97 187.25 131.97 187.25 95.96 190.36 95.96 191.9 95.96 191.9 94.43 191.9 85.85 191.9 84.32 190.36 84.32"></polygon><path className="cls-1" d="M85.37,131.94h-4.8L64.91,95.77h3V84.11H42.78V95.77h3.46L30.6,131.94H24.1v11.64H46.91V131.94H43.58l2.6-6H65l2.6,6H64.08v11.64H86.91V131.94ZM60,114.27H51.21l4.37-10.11Z"></path><path className="cls-1" d="M171.23,39.11H42.6v37.4H68V62.16H95.08v89.33H80.74v25.4h54.1v-25.4H120.51V62.16h26.9V76.35H173V39.11h-1.75ZM124.15,162l5.36-5.51v15.15l-5.36-5.13Zm-8.95-5.12-5.36,5.29V51.63L115.2,57Zm-62-107.21-5.53-5.37H165l-6.94,5.37Zm114.7,21.78-5.36-5.12V52.68l5.36-5.52Z"></path><path className="cls-1" d="M140.77,171.62a5.2,5.2,0,1,1,5.2,5.2A5.21,5.21,0,0,1,140.77,171.62Zm9.14,0a3.94,3.94,0,1,0-3.94,4.19A4,4,0,0,0,149.91,171.62Zm-5.94-3h2.19c1.41,0,2.17.5,2.17,1.73a1.47,1.47,0,0,1-1.54,1.59l1.58,2.58h-1.12L145.72,172h-.66v2.54H144Zm1.1,2.52h1c.65,0,1.21-.08,1.21-.87s-.63-.81-1.19-.81h-1v1.68Z"></path></svg> 
                                        <h1 className='signUpTitle'>AIM Portal Sign Up</h1>
                                </header>
                                <nav className='tabNav'>
                                        <ul>
                                        {["USER", "STAFF"].map((role) => (
                                                <li 
                                                key={role} 
                                                onClick={() => handleRoleChange(role)} 
                                                id={chosenRole === role ? 'signUpActive' : ''}
                                                data-testid={role}
                                                >
                                                {role}
                                                </li>
                                        ))}
                                        </ul>
                                </nav>
                        </div>
                        <main className='dashboardOuter'>
                                <form className='newStudentApp'>
                                        <label htmlFor="name" data-testid="nameLabel">Name</label>
                                        <input 
                                        type="text" 
                                        value={formData.name}
                                        onChange={handleChange}
                                        name="name" 
                                        />

                                        <label htmlFor="email" data-testid="emailLabel">Email</label>
                                        <input 
                                        type="email" 
                                        value={formData.email} 
                                        onChange={handleChange}
                                        name="email" 
                                        />

                                        {chosenRole === "USER" && (
                                        <>
                                                <label htmlFor="dob" data-testid="dobLabel">Date of Birth</label>
                                                <input type='date' onChange={handleChange} name="dob"></input>
                                                <label htmlFor="uin" data-testid="uinLabel">UIN</label>
                                                <input onChange={handleChange} name="uin"></input>
                                                <label htmlFor="phone_number" data-testid="phoneLabel">Phone Number</label>
                                                <input type='tel' onChange={handleChange} name="phone_number"></input>
                                        </>
                                        )}

                                        {chosenRole === "STAFF" && (
                                        <>
                                                <label htmlFor='role' data-testid="staffRole">Staff Role</label>
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
                                        data-testid="submitSignUp"
                                        >Sign Up as {chosenRole}</button>
                                </form>
                        </main>
                </main>
        );
}

export default SignUp;
