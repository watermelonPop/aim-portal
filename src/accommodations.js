import './App.css';
import { useEffect, useState } from 'react';
import UserAccommodations from './userAccommodations';

export function Accommodations({ userInfo, setAlertMessage, setShowAlert }) {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userInfo?.role === 'STUDENT' && userInfo?.id) {
      setLoading(true);
      fetch(`/api/getStudentData?userId=${userInfo.id}`)
        .then(res => res.json())
        .then(data => setStudentData(data))
        .catch(err => console.error('Failed to fetch student data', err))
        .finally(() => setLoading(false));
    }
  }, [userInfo]);

  return (
    <main className='dashboardOuter' data-testid='basicAccommodations'>
      {userInfo.role === "USER" && (
        <UserAccommodations
          userInfo={userInfo}
          setAlertMessage={setAlertMessage}
          setShowAlert={setShowAlert}
        />
      )}

      {userInfo.role === "STUDENT" && (
        <>
          {loading ? (
            <div className="loadingScreen">
              <div className="spinner">
                <div className="spinner-icon"></div>
                <p className="spinner-text">Loading accommodations...</p>
              </div>
            </div>
          ) : (
            <div className="studentAccommodationsWrapper">
              {/* Accommodations Section */}
              <h3>Accommodations</h3>
              {studentData?.accommodations?.length > 0 ? (
                <div className="accommodationsContainer">
                  {studentData.accommodations.map((acc, index) => (
                    <div key={index} className="accommodationCard">
                      <div><strong>Type:</strong> {acc.type || 'N/A'}</div>
                      <div><strong>Status:</strong> {acc.status}</div>
                      <div><strong>Date Requested:</strong> {new Date(acc.date_requested).toLocaleDateString()}</div>
                      <div><strong>Advisor:</strong> {acc.advisor?.account?.name || 'N/A'}</div>
                      <div><strong>Notes:</strong> {acc.notes}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No accommodations found.</p>
              )}

              {/* Assistive Technology Section */}
              <h3>Assistive Technology</h3>
              {studentData?.assistive_technologies?.length > 0 ? (
                <div className="accommodationsContainer">
                  {studentData.assistive_technologies.map((tech, index) => (
                    <div key={index} className="accommodationCard">
                      <div><strong>Type:</strong> {tech.type}</div>
                      <div><strong>Available:</strong> {tech.available ? 'Yes' : 'No'}</div>
                      <div><strong>Advisor:</strong> {tech.advisor?.account?.name || 'N/A'}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No assistive technologies found.</p>
              )}
            </div>
          )}
        </>
      )}

      {userInfo.role === "PROFESSOR" && <p className='dashboardTitle'>PROFESSOR ACCOMMODATIONS</p>}
      {userInfo.role === "ADVISOR" && <p className='dashboardTitle'>STAFF ACCOMMODATIONS</p>}
    </main>
  );
}

export default Accommodations;
