import './App.css';
import { useEffect, useState } from 'react';
import UserAccommodations from './userAccommodations';

export function Accommodations({ userInfo, setAlertMessage, setShowAlert }) {
  const [studentAccommodations, setStudentAccommodations] = useState([]);
  const [loading, setLoading] = useState(false); // For loading state

  useEffect(() => {
    if (userInfo?.role === 'STUDENT' && userInfo?.id) {
      setLoading(true);
      fetch(`/api/getStudentAccommodations?userId=${userInfo.id}`)
        .then(res => res.json())
        .then(data => setStudentAccommodations(data))
        .catch(err => console.error('Failed to fetch accommodations', err))
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
          ) : studentAccommodations.length > 0 ? (
            <div className="studentAccommodationsWrapper">
              <div className="accommodationsContainer">
                {studentAccommodations.map((acc, index) => (
                  <div key={index} className="accommodationCard">
                    <div><strong>Type:</strong> {acc.type || 'N/A'}</div>
                    <div><strong>Status:</strong> {acc.status}</div>
                    <div><strong>Date Requested:</strong> {new Date(acc.date_requested).toLocaleDateString()}</div>
                    <div><strong>Advisor:</strong> {acc.advisor?.account?.name || 'N/A'}</div>
                    <div><strong>Notes:</strong> {acc.notes}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p>No accommodations found.</p>
          )}
        </>
      )}

      {userInfo.role === "PROFESSOR" && <p className='dashboardTitle'>PROFESSOR ACCOMMODATIONS</p>}
      {userInfo.role === "ADVISOR" && <p className='dashboardTitle'>STAFF ACCOMMODATIONS</p>}
    </main>
  );
}

export default Accommodations;
