import { useState, useEffect } from 'react';
import './StaffDash.css'; // Make sure to create this CSS file for styling

function StaffDash() {
  const [view, setView] = useState(null); // 'students', 'accommodations', 'forms'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Sample alert data
  const alerts = [
    { id: 1, date: '2024-03-05', message: 'New accommodation request from John Doe', notes: 'Pending approval' },
    { id: 2, date: '2024-03-04', message: '2 pending form approvals', notes: 'Review before end of day' },
    { id: 3, date: '2024-03-02', message: 'System maintenance scheduled for Friday', notes: '12 AM - 3 AM downtime' }
  ];

  // Handle student search input
  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 1) {
      try {
        const response = await fetch(`/api/searchStudents?query=${query}`);
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  // Handle selecting a student from search results
  const handleStudentSelect = async (student) => {
    setSelectedStudent(student);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Handle student info updates
  const handleUpdateStudent = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/updateStudent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedStudent),
      });

      if (response.ok) {
        setSuccessMessage('Changes saved successfully!');
        setTimeout(() => setSuccessMessage(''), 5000); // Fade out after 5 seconds
      } else {
        console.error('Failed to update student');
      }
    } catch (error) {
      console.error('Error updating student:', error);
    }
    setLoading(false);
  };

  return (
    <div className="staff-dashboard-container">
      {/* Main Content Section */}
      <div className="staff-main-content">
        <div className="staff-header">
          {view !== null && <button className="back-btn" onClick={() => setView(null)}>← Back</button>}
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
        {view === 'students' && !selectedStudent && (
          <div className="dashboard-section">
            <h3>Search for Students</h3>
            <input 
              type="text" 
              placeholder="Enter student name or UIN" 
              className="search-input" 
              value={searchQuery} 
              onChange={handleSearchChange} 
            />
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map(student => (
                  <div 
                    key={student.uin} 
                    className="search-result-item" 
                    onClick={() => handleStudentSelect(student)}
                  >
                    {student.name} ({student.uin})
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Student Profile for Editing */}
        {selectedStudent && (
          <div className="student-profile">
            <h3>Student Profile</h3>
            <div className="form-group">
              <label>Name</label>
              <input 
                type="text" 
                value={selectedStudent.name} 
                onChange={(e) => setSelectedStudent({ ...selectedStudent, name: e.target.value })} 
              />
            </div>
            <div className="form-group">
              <label>UIN</label>
              <input 
                type="text" 
                value={selectedStudent.uin} 
                readOnly 
              />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input 
                type="date" 
                value={selectedStudent.dob} 
                onChange={(e) => setSelectedStudent({ ...selectedStudent, dob: e.target.value })} 
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                value={selectedStudent.email} 
                onChange={(e) => setSelectedStudent({ ...selectedStudent, email: e.target.value })} 
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input 
                type="text" 
                value={selectedStudent.phone_number} 
                onChange={(e) => setSelectedStudent({ ...selectedStudent, phone_number: e.target.value })} 
              />
            </div>

            {/* Buttons */}
            <div className="button-group">
              <button className="save-btn" onClick={handleUpdateStudent} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button className="cancel-btn" onClick={() => setSelectedStudent(null)}>Cancel</button>
            </div>

            {/* Success Message */}
            {successMessage && <div className="success-message">{successMessage}</div>}
          </div>
        )}
      </div>

      {/* Alerts Section */}
      <aside className="staff-alerts">
        <h3>📢 Alerts</h3>
        <div className="alert-box">
          {alerts.map(alert => (
            <div key={alert.id} className="alert-item">
              <p className="alert-date">{alert.date}</p>
              <p className="alert-message"><strong>{alert.message}</strong></p>
              <p className="alert-notes">{alert.notes}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

export default StaffDash;
