import { useState, useEffect } from 'react';

function StaffDash() {
  const [view, setView] = useState(null); // 'students', 'accommodations', 'forms', 'studentDetails'
  const [studentsData, setStudentsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStudent, setEditedStudent] = useState(null);

  // Sample alerts (Replace with real-time data)
  const alerts = [
    { id: 1, date: "2024-03-05", message: "New accommodation request from John Doe", notes: "Pending approval by staff" },
    { id: 2, date: "2024-03-04", message: "2 pending form approvals", notes: "Review submitted forms by end of day" },
    { id: 3, date: "2024-03-02", message: "System maintenance scheduled for Friday", notes: "Potential downtime from 12 AM - 3 AM" }
  ];

  // Fetch students from API when component mounts
  useEffect(() => {
    fetch("/api/getStudents") // API endpoint to get students
      .then(response => response.json())
      .then(data => setStudentsData(data.students))
      .catch(error => console.error("Error fetching students:", error));
  }, []);

  // Handle search input
  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchTerm(query);

    if (query.length === 0) {
      setFilteredStudents([]);
      return;
    }

    // Case-insensitive search on name or UIN
    const results = studentsData.filter(student =>
      student.name.toLowerCase().includes(query) || student.uin.toString().includes(query)
    );

    setFilteredStudents(results);
  };

  // Handle clicking a student to open details
  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setEditedStudent({ ...student }); // Create a copy for editing
    setView('studentDetails');
  };

  // Handle input change for editing
  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditedStudent((prev) => ({ ...prev, [name]: value }));
  };

  // Submit edited student data to the database
  const [loading, setLoading] = useState(false); // New state for loading
  const [successMessage, setSuccessMessage] = useState('');


  const handleSaveChanges = () => {
    setLoading(true);
    setSuccessMessage(""); // Reset message before saving
  
    fetch('/api/updateStudent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editedStudent),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setSuccessMessage("✅ Changes saved successfully!");
  
        // Keep the edit form open
        setSelectedStudent(editedStudent);
  
        // Add "fade-out" class after 4 seconds
        setTimeout(() => {
          setSuccessMessage((prev) => prev ? "fade-out" : "");
        }, 4000);
  
        // Fully remove message after 5 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 5000);
      })
      .catch(error => {
        console.error('Error updating student:', error);
        alert('❌ Failed to update student. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  
  


  return (
    <div className="staff-dashboard-container">
      {/* Main Content Section */}
      <div className="staff-main-content">
        
        {/* Dashboard Title & Back Button */}
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
        {view === 'students' && (
          <div className="dashboard-section">
            <h3>Search for Students</h3>
            <input
              type="text"
              placeholder="Enter student name or UIN..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-bar"
            />

            {/* Display search results (ONLY name and UIN) */}
            {filteredStudents.length > 0 ? (
              <div className="search-results">
                {filteredStudents.map(student => (
                  <div 
                    key={student.student_id} 
                    className="search-item" 
                    onClick={() => handleStudentClick(student)}
                  >
                    <p><strong>{student.name}</strong> (UIN: {student.uin})</p>
                  </div>
                ))}
              </div>
            ) : (
              searchTerm.length > 0 && <p>No matching students found.</p>
            )}
          </div>
        )}

        {/* Student Details View (With Editing Feature) */}
        {view === 'studentDetails' && selectedStudent && (
          <div className="student-details-container">
            <h3>Student Profile</h3>
            <div className="student-info">
              {isEditing ? (
                <>
                  <input type="text" name="name" value={editedStudent.name} onChange={handleEditChange} />
                  <input type="text" name="uin" value={editedStudent.uin} onChange={handleEditChange} />
                  <input type="date" name="dob" value={editedStudent.dob} onChange={handleEditChange} />
                  <input type="email" name="email" value={editedStudent.email} onChange={handleEditChange} />
                  <input type="tel" name="phone_number" value={editedStudent.phone_number} onChange={handleEditChange} />
                  <button onClick={handleSaveChanges} disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                    {loading && <div className="loading-spinner"></div>}
                  </button>
                  {successMessage && (
                    <p className={`success-message ${successMessage === "fade-out" ? "fade-out" : ""}`}>
                      {successMessage !== "fade-out" ? successMessage : ""}
                    </p>
                  )}




                  <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                </>
              ) : (
                <>
                  <p><strong>Name:</strong> {selectedStudent.name}</p>
                  <p><strong>UIN:</strong> {selectedStudent.uin}</p>
                  <p><strong>Date of Birth:</strong> {selectedStudent.dob}</p>
                  <p><strong>Email:</strong> {selectedStudent.email}</p>
                  <p><strong>Phone Number:</strong> {selectedStudent.phone_number}</p>
                  <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit</button>
                </>
              )}
            </div>
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
