import './App.css';
import { useEffect, useState } from 'react';


function Dash({userType}) {
    const [view, setView] = useState(null); // 'students', 'accommodations', 'forms'

  // Sample alert data
  const alerts = [
    { 
      id: 1, 
      date: "2024-03-05", 
      message: "New accommodation request from John Doe", 
      notes: "Pending approval by staff" 
    },
    { 
      id: 2, 
      date: "2024-03-04", 
      message: "2 pending form approvals", 
      notes: "Review submitted forms by end of day" 
    },
    { 
      id: 3, 
      date: "2024-03-02", 
      message: "System maintenance scheduled for Friday", 
      notes: "Potential downtime from 12 AM - 3 AM" 
    }
  ];

  return (
    <main className="dashboardOuter">
      
      {userType === "User" && (
        <div className="staff-dashboard-container">

          {/* Main Content Section */}
          <div className="staff-main-content">
            
            {/* Dashboard Title */}
            <div className="staff-header">
              {view !== null && (
                <button className="back-btn" onClick={() => setView(null)}>← Back</button>
              )}
            </div>

            {/* Default Staff Menu */}
            {view === null && (
              <div className="staff-menu">
                <h2>Select an action:</h2>
                <div className="staff-menu-buttons">
                  <button onClick={() => setView('students')}>🔍 Search for Students</button>
                  <button onClick={() => setView('accommodations')}>📌 Manage Accommodations</button>
                  <button onClick={() => setView('forms')}>📄 Review Submitted Forms</button>
                </div>
              </div>
            )}

            {/* Search for Students */}
            {view === 'students' && (
              <div className="dashboard-section">
                <h3>Search for Students</h3>
                <input type="text" placeholder="Enter student name or ID" className="search-input" />
                <p>Feature to search and view student profiles.</p>
              </div>
            )}

            {/* Manage Accommodations */}
            {view === 'accommodations' && (
              <div className="dashboard-section">
                <h3>Manage Accommodations</h3>
                <p>List of student accommodations to approve or deny.</p>
              </div>
            )}

            {/* Review Submitted Forms */}
            {view === 'forms' && (
              <div className="dashboard-section">
                <h3>Review Submitted Forms</h3>
                <p>View and process student form submissions.</p>
              </div>
            )}

          </div>

          {/* Alerts Section - Positioned on the Right */}
          <aside className="staff-alerts">
            <h3>📢 Alerts</h3>
            <div className="alert-box">
              {alerts.map(alert => (
                <div key={alert.id} className="alert-item">
                  <p className="alert-date">{alert.date}</p>
                  <p className="alert-message">{alert.message}</p>
                  <p className="alert-notes">{alert.notes}</p>
                </div>
              ))}
            </div>
          </aside>

        </div>
      )}

    </main>
  );
}

export default Dash;
