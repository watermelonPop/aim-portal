import './App.css';
import { useEffect, useState } from 'react';

function Profile({ userType }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (userType === "User") {
      // Try to get user data from localStorage
      const storedUser = localStorage.getItem('userData');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, [userType]);

  return (
    <main className="dashboardOuter">
      {userType === "User" && (
        <>
          {user ? (
            <div>
                <div className="profilePicContainer">
                    <img 
                        src={user.picture} 
                        alt={`${user.name}'s profile`} 
                        className="profilePic"
                    />
                </div>
                <div className="profileText">
                    <p>Name: {user.name}</p>
                    <p>Email: {user.email}</p>
                </div>
            </div>
          ) : (
            <p>Loading user info...</p>
          )}
        </>
      )}
      {userType === "Student" && <h2 className="dashboardTitle">STUDENT PROFILE</h2>}
      {userType === "Professor" && <h2 className="dashboardTitle">PROFESSOR PROFILE</h2>}
      {userType === "Staff" && <h2 className="dashboardTitle">STAFF PROFILE</h2>}
    </main>
  );
}

export default Profile;
