
import { useEffect, useState, useRef } from 'react';


export function StudentAccommodations({userInfo, setAlertMessage, setShowAlert, settingsTabOpen}) {
        const [loading, setLoading] = useState(false);
        const [studentData, setStudentData] = useState(null);

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
        
                <>
            <div className="studentAccommodationsWrapper">
              {/* Accommodations Section */}
              <h2>Accommodations</h2>
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
        </>
        );
}

export default StudentAccommodations;