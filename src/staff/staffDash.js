import { useState, useEffect } from 'react';

function StaffDash() {
  const [view, setView] = useState(null); // 'students', 'requests', 'forms', 'studentDetails'
  const [studentsData, setStudentsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStudent, setEditedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null); // Stores the selected request

  const [currentPage, setCurrentPage] = useState(1); // Tracks the current page
const [filteredRequests, setFilteredRequests] = useState([]); // Stores filtered results

// Calculate total pages dynamically
const totalPages = Math.ceil(filteredRequests.length / 10);


  // ADDED FOR REQUESTS:
  const [requestsData, setRequestsData] = useState([]); // Holds the requests from the DB

  // Sample alerts (Replace with real-time data)
  const alerts = [
    { id: 1, date: '2024-03-05', message: 'New accommodation request from John Doe', notes: 'Pending approval by staff' },
    { id: 2, date: '2024-03-04', message: '2 pending form approvals', notes: 'Review submitted forms by end of day' },
    { id: 3, date: '2024-03-02', message: 'System maintenance scheduled for Friday', notes: 'Potential downtime from 12 AM - 3 AM' }
  ];

  // Fetch students from API when component mounts
  useEffect(() => {
    fetch('/api/getStudents') // API endpoint to get students
      .then(response => response.json())
      .then(data => setStudentsData(data.students))
      .catch(error => console.error('Error fetching students:', error));
  }, []);

  // ADDED FOR REQUESTS: Fetch requests when view is 'requests'
  useEffect(() => {
    if (view === 'requests') {
      fetch('/api/getRequests')
        .then(res => res.json())
        .then(data => {
          setRequestsData(data.requests);
        })
        .catch(err => console.error('Error fetching requests:', err));
    }
  }, [view]);

  useEffect(() => {
    // Filter results based on search
    const filtered = requestsData.filter((request) => {
      const query = searchTerm.toLowerCase();
      return (
        request.user_name.toLowerCase().includes(query) ||
        request.uin.toString().includes(query)
      );
    });
  
    setFilteredRequests(filtered);
    setCurrentPage(1); // Reset to first page when search updates
  }, [searchTerm, requestsData]);
  
  

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
      student.name.toLowerCase().includes(query) ||
      student.uin.toString().includes(query)
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

  const hasChanges = () => {
    return JSON.stringify(editedStudent) !== JSON.stringify(selectedStudent);
  };

  // Submit edited student data to the database
  const handleSaveChanges = () => {
    if (!hasChanges()) {
      setInfoMessage('⚠️ No changes to save.');
      setTimeout(() => setInfoMessage('fade-out'), 4000);
      setTimeout(() => setInfoMessage(''), 3000);
      return;
    }

    setLoading(true);
    setSuccessMessage('');

    fetch('/api/updateStudent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editedStudent),
    })
      .then(response => response.json())
      .then(() => {
        setSuccessMessage('✅ Changes saved successfully!');
        setTimeout(() => setSuccessMessage('fade-out'), 4000);
        setTimeout(() => setSuccessMessage(''), 5000);
      })
      .catch(error => alert('❌ Failed to update student.'))
      .finally(() => setLoading(false));
  };

  // Function to reset everything when going back
  const resetToMainMenu = () => {
    setView(null);
    setSearchTerm('');
    setFilteredStudents([]);
    setSelectedStudent(null);
    setIsEditing(false);
    setEditedStudent(null);
  };

  return (
    <div className="staff-dashboard-container">
      {/* Main Content Section */}
      <div className="staff-main-content">

        {/* Dashboard Title & Back Button */}
        <div className="staff-header">
          {view !== null && (
            <button className="back-btn" onClick={resetToMainMenu}>
              ← Back
            </button>
          )}
        </div>

        {/* Default Staff Menu */}
        {view === null && (
          <div className="staff-menu">
            <h2>Select an action:</h2>
            <div className="staff-menu-buttons">
              <button onClick={() => setView('students')}>🔍 Student Search</button>
              <button onClick={() => setView('requests')}>📌 Manage Requests</button>
              <button onClick={() => setView('forms')}>📄 Review Submitted Forms</button>
            </div>
          </div>
        )}

{view === 'requests' && (
  <div className="staff-dashboard-section">
    {/* Back Button (Always Visible) */}
    <button className="back-btn" onClick={() => {
      setSelectedStudent(null);
      setSearchTerm('');
    }}>
      ← Back to Search
    </button>

    {/* Show Search Bar ONLY When No Request is Selected */}
    {!selectedStudent && (
      <input
        type="text"
        placeholder="Search by Name or UIN..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="staff-search-bar"
      />
    )}

    {/* If a Student is Selected, Show Full Details */}
    {selectedStudent ? (
      <div className="staff-student-details-container">
        <h3>Student Request Details</h3>
        <div className="staff-student-info">
          <p><strong>Name:</strong> {selectedStudent.user_name}</p>
          <p><strong>Email:</strong> {selectedStudent.user_email}</p>
          <p><strong>Advisor ID:</strong> {selectedStudent.advisor_id}</p>
          <p><strong>Date of Birth:</strong> {selectedStudent.dob}</p>
          <p><strong>UIN:</strong> {selectedStudent.uin}</p>
          <p><strong>Phone Number:</strong> {selectedStudent.phone_number}</p>
          <p><strong>Full Notes:</strong></p>
          <div className="full-notes-box">
            {selectedStudent.notes}
          </div>
        </div>
      </div>
    ) : (
      <>
        {/* Requests Container (Only Shown When No Student is Selected) */}
        <div className="requests-container">
          {filteredRequests
            .slice((currentPage - 1) * 10, currentPage * 10) // Only show 10 per page
            .map((request) => {
              const previewLength = 100;
              const notesPreview = request.notes?.length > previewLength
                ? request.notes.substring(0, previewLength) + '...'
                : request.notes;

              return (
                <div 
                  className="request-tile"
                  key={request.user_id}
                  onClick={() => setSelectedStudent(request)}
                  tabIndex="0"
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedStudent(request);
                    }
                  }}
                >
                  <h4>{request.user_email}</h4>
                  <p className="subheading">
                    <em>UIN:</em> {request.uin}
                  </p>
                  <p className="notes-preview">{notesPreview}</p>
                </div>
              );
            })}
        </div>

        {/* Pagination Controls (Only Shown When No Student is Selected) */}
        <div className="pagination-controls">
          <button 
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ← Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button 
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next →
          </button>
        </div>
      </>
    )}
  </div>
)}


        {/* Search for Students */}
        {view === 'students' && (
          <div className="staff-dashboard-section">
            <h3>Search for Students</h3>
            <input
              type="text"
              placeholder="Enter student name or UIN..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="staff-search-bar"
            />

            {/* Display search results (ONLY name and UIN) */}
            {filteredStudents.length > 0 ? (
              <div className="staff-search-results">
                {filteredStudents.map(student => (
                  <div
                    key={student.student_id}
                    className="staff-search-item"
                    onClick={() => handleStudentClick(student)}
                    tabIndex="0"
                    role="button"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleStudentClick(student);
                      }
                    }}
                  >
                    <p>
                      <strong>{student.name}</strong> (UIN: {student.uin})
                    </p>
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
          <div className="staff-student-details-container">
            <h3>Student Profile</h3>
            <div className="staff-student-info">
              {isEditing ? (
                <div className="edit-student-form">
                  <div className="staff-form-group">
                    <label htmlFor="name">Full Name:</label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={editedStudent.name}
                      onChange={handleEditChange}
                    />
                  </div>

                  <div className="staff-form-group">
                    <label htmlFor="uin">UIN:</label>
                    <input
                      id="uin"
                      type="text"
                      name="uin"
                      value={editedStudent.uin}
                      onChange={handleEditChange}
                    />
                  </div>

                  <div className="staff-form-group">
                    <label htmlFor="dob">Date of Birth:</label>
                    <input
                      id="dob"
                      type="date"
                      name="dob"
                      value={editedStudent.dob}
                      onChange={handleEditChange}
                    />
                  </div>

                  <div className="staff-form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={editedStudent.email}
                      onChange={handleEditChange}
                    />
                  </div>

                  <div className="staff-form-group">
                    <label htmlFor="phone">Phone Number:</label>
                    <input
                      id="phone"
                      type="tel"
                      name="phone_number"
                      value={editedStudent.phone_number}
                      onChange={handleEditChange}
                    />
                  </div>

                  <button onClick={handleSaveChanges} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                    {loading && <div className="staff-loading-spinner"></div>}
                  </button>

                  {successMessage && (
                    <p
                      className={`staff-success-message ${
                        successMessage === 'fade-out' ? 'fade-out' : ''
                      }`}
                    >
                      {successMessage !== 'fade-out' ? successMessage : ''}
                    </p>
                  )}

                  {infoMessage && (
                    <p
                      className={`staff-info-message ${
                        infoMessage === 'fade-out' ? 'fade-out' : ''
                      }`}
                    >
                      {infoMessage !== 'fade-out' ? infoMessage : ''}
                    </p>
                  )}

                  <button
                    className="staff-cancel-btn"
                    onClick={() => setIsEditing(false)}
                  >
                    Back to Profile
                  </button>
                </div>
              ) : (
                <>
                  <p>
                    <strong>Name:</strong> {selectedStudent.name}
                  </p>
                  <p>
                    <strong>UIN:</strong> {selectedStudent.uin}
                  </p>
                  <p>
                    <strong>Date of Birth:</strong> {selectedStudent.dob}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedStudent.email}
                  </p>
                  <p>
                    <strong>Phone Number:</strong> {selectedStudent.phone_number}
                  </p>
                  <button
                    className="staff-edit-btn"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Alerts Section */}
      {/* Alerts Section - Only Show on Landing Page */}
{view === null && (
  <aside className="staff-alerts">
    <h3>📢 Alerts</h3>
    <div className="alert-box">
      {alerts.map(alert => (
        <div key={alert.id} className="alert-item">
          <p className="alert-date">{alert.date}</p>
          <p className="alert-message">
            <strong>{alert.message}</strong>
          </p>
          <p className="alert-notes">{alert.notes}</p>
        </div>
      ))}
    </div>
  </aside>
)}

    </div>
  );
}

export default StaffDash;
