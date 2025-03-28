import { useState, useEffect, useCallback  } from 'react';

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
  const totalPages = Math.ceil(filteredRequests.length / 10);
  const [requestsData, setRequestsData] = useState([]); // Holds the requests from the DB
  const [requests, setRequests] = useState([]);
  const [expandedRequest, setExpandedRequest] = useState(null); // Track which request is expanded
  const [showAccommodations, setShowAccommodations] = useState(false);
  const [showAssistiveTech, setShowAssistiveTech] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [showStudentInfo, setShowStudentInfo] = useState(false);
  const [refreshingStudent, setRefreshingStudent] = useState(false);
  const [studentNeedsRefresh, setStudentNeedsRefresh] = useState(false);






  const alerts = [
    { id: 1, date: '2024-03-05', message: 'New accommodation request from John Doe', notes: 'Pending approval by staff' },
    { id: 2, date: '2024-03-04', message: '2 pending form approvals', notes: 'Review submitted forms by end of day' },
    { id: 3, date: '2024-03-02', message: 'System maintenance scheduled for Friday', notes: 'Potential downtime from 12 AM - 3 AM' }
  ];

  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };
  const refreshStudentData = async (userId) => {
    setRefreshingStudent(true);
    try {
      const res = await fetch('/api/getStudents');
      const data = await res.json();
  
      const updatedStudent = data.students.find(s => s.userId === userId);
      if (updatedStudent) {
        // ✅ Replace the updated student in the list
        setStudentsData(prev =>
          prev.map(s => (s.userId === userId ? updatedStudent : s))
        );
  
        // ✅ Update selected + edited student
        setSelectedStudent(updatedStudent);
        setEditedStudent(updatedStudent);
      }
    } catch (err) {
      console.error("❌ Error refreshing student data:", err);
    } finally {
      setRefreshingStudent(false);
    }
  };
  
  

    // Optimized Search with Debounce
    const performSearch = useCallback(
      debounce((query) => {
        if (query.length === 0) {
          setFilteredStudents([]);
          return;
        }
  
        const results = studentsData.filter(
          (student) =>
            (student.student_name &&
              student.student_name.toLowerCase().includes(query)) ||
            (student.UIN && student.UIN.toString().includes(query))
        );
  
        setFilteredStudents(results);
      }, 300), // Delay of 300ms
      [studentsData]
    );
    useEffect(() => {
      if (view == null) {
        setSearchTerm("");
        setSelectedStudent(null);
        setShowAccommodations(false);
        setShowAssistiveTech(false);
      }
    }, [view]);
    

    useEffect(() => {
      const fetchRequests = async () => {
        setLoadingRequests(true); // Show loading spinner
        try {
          const response = await fetch('/api/getRequests'); // Replace with actual API
          const data = await response.json();
          setRequests(data.requests);
        } catch (error) {
          console.error("Error fetching requests:", error);
        } finally {
          setLoadingRequests(false); // Hide loading spinner
        }
      };
    
      fetchRequests();
    }, []);
    
  


  // Fetch students from API when component mounts
  useEffect(() => {
    setLoading(true);
    fetch('/api/getStudents')
      .then((response) => response.json())
      .then((data) => {
        setStudentsData(data.students);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching students:', error);
        setLoading(false);
      });
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
        (request.UIN && request.UIN.toString().includes(query)) ||  // ✅ Correct field
        (request.notes && request.notes.toLowerCase().includes(query)) // ✅ Allows search by notes
      );
    });

    setFilteredRequests(filtered);
    setCurrentPage(1); // Reset to first page when search updates
}, [searchTerm, requestsData]);

  
  const handleRequestClick = (request) => {
    setSelectedRequest({
      id: request.id,
      advisorId: request.advisorId,
      advisorRole: request.advisorRole || "N/A",
      userId: request.userId,
      UIN: request.UIN || "N/A",
      dob: request.dob || "N/A",
      phone_number: request.phone_number || "N/A",
      notes: request.notes,
      documentation: request.documentation,
      non_registered_userId: request.non_registered_userId,
    });
  
    setView('requestDetails');
  };
  

  // Handle search input
  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchTerm(query);
  
    if (query.length === 0) {
      setFilteredStudents([]);
      return;
    }
  
    // Case-insensitive search on student_name or UIN (updated for new API format)
    const results = studentsData.filter(student =>
      (student.student_name && student.student_name.toLowerCase().includes(query)) ||
      student.UIN.toString().includes(query) // UIN must be referenced correctly
    );
  
    setFilteredStudents(results);
  };

  // Handle clicking a student to open details
// Ensure correct structure when selecting a student
const handleStudentClick = (student) => {
  setSelectedStudent({
    userId: student.userId,
    student_name: student.student_name,
    UIN: student.UIN,
    dob: student.dob,
    email: student.email,
    phone_number: student.phone_number,

    accommodations: student.accommodations || [],
    assistive_technologies: student.assistive_technologies || [],
  });

  setEditedStudent({ ...student });
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
  const handleSaveChanges = async () => {
    setInfoMessage('');
    setSuccessMessage('');
  
    if (!hasChanges()) {
      setInfoMessage('⚠️ No changes to save.');
      setTimeout(() => setInfoMessage('fade-out'), 3000);
      setTimeout(() => setInfoMessage(''), 4000);
      return;
    }
    const errors = [];
  
    const nameRegex = /^[A-Za-z\s.,'-]+$/;
    if (!editedStudent.student_name || !nameRegex.test(editedStudent.student_name)) {
      errors.push("• Name must only contain letters and spaces.");
    }
  
    if (!/^\d{9}$/.test(editedStudent.UIN)) {
      errors.push("• UIN must be exactly 9 digits.");
    }
  
    if (!editedStudent.dob || isNaN(new Date(editedStudent.dob).getTime())) {
      errors.push("• Date of Birth is not valid.");
    }
  
    const tamuEmailRegex = /^[^\s@]+@tamu\.edu$/i;
    if (!tamuEmailRegex.test(editedStudent.email)) {
      errors.push("• Email must end with @tamu.edu.");
    }
  
    const phoneRegex = /^[()\d.\-\s]+(?: x\d+)?$/;
    if (!phoneRegex.test(editedStudent.phone_number)) {
      errors.push("• Phone number format is invalid.");
    }
  
    if (errors.length > 0) {
      setInfoMessage(`❌ Please fix the following:\n${errors.join("\n")}`);
      setSuccessMessage('');
      setLoading(false);
      return;
    }
  
    setLoading(true);
    setInfoMessage('');
    setSuccessMessage('');
  
    const studentUpdatePayload = {
      userId: editedStudent.userId,
      student_name: editedStudent.student_name.trim(),
      UIN: parseInt(editedStudent.UIN, 10),
      dob: editedStudent.dob,
      email: editedStudent.email.trim(),
      phone_number: editedStudent.phone_number.trim(),
    };
  
    try {
      const response = await fetch('/api/updateStudent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentUpdatePayload),
      });
  
      const result = await response.json();
  
      if (!response.ok) throw new Error(result.error || 'Failed to update student.');
  
      setSuccessMessage('✅ Changes saved successfully!');
      setSuccessMessage('✅ Changes saved successfully!');
    setStudentNeedsRefresh(true); // mark that changes were made

      setTimeout(() => setSuccessMessage('fade-out'), 3000);
      setTimeout(() => setSuccessMessage(''), 4000);
  
    } catch (err) {
      console.error("❌ Update error:", err);
      setInfoMessage('❌ Failed to update student.');
    } finally {
      setLoading(false);
    }
  };
  
  
  // Function to reset everything when going back
  const resetToMainMenu = async () => {
    if (studentNeedsRefresh && selectedStudent) {
      await refreshStudentData(selectedStudent.userId);
      setStudentNeedsRefresh(false);
    }
    if (isEditing && hasChanges()) {
      const confirmLeave = window.confirm(
        "⚠️ Are you sure you want to leave? Unsaved changes will be discarded."
      );
      if (!confirmLeave) return;
    }
    setView(null);
    setSearchTerm('');
    setFilteredStudents([]);
    setSelectedStudent(null);
    setIsEditing(false);
    setEditedStudent(null);
    setSelectedRequest(null);
    setShowAccommodations(false);
    setShowAssistiveTech(false);
  };

  

  const resetToStudentSearch = async () => {
    if (studentNeedsRefresh && selectedStudent) {
      await refreshStudentData(selectedStudent.userId);
      setStudentNeedsRefresh(false);
    }
    if (isEditing && hasChanges()) {
      const confirmLeave = window.confirm(
        "⚠️ Are you sure you want to leave? Unsaved changes will be discarded."
      );
      if (!confirmLeave) return;
    }
    setView('students');
    setShowAccommodations(false);
    setShowAssistiveTech(false);
    setIsEditing(false);
    setShowStudentInfo(false);

  }

  return (
    <div className="staff-dashboard-container">
      {/* Main Content Section */}
      <div className="staff-main-content">

        {/* Dashboard Title & Back Button */}
        <div className="staff-header">
          {view !== null && (
            <button className="back-btn" onClick={resetToMainMenu}>
              ← Back to Dashboard
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
  <div className="staff-dashboard">

    {/* Show loading icon while fetching requests */}
    {loadingRequests ? (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Requests...</p>
      </div>
    ) : selectedRequest ? (
      <div className="request-details-container">
        <button className="back-btn" onClick={() => setSelectedRequest(null)}>
          ← Back to Requests
        </button>

        <div className="request-details-grid">
          <div>
            <p><strong>Request ID:</strong> {selectedRequest.id}</p>
            <p><strong>Advisor ID:</strong> {selectedRequest.advisorId}</p>
            <p><strong>Advisor Role:</strong> {selectedRequest.advisorRole || "N/A"}</p>
          </div>

          <div>
            <p><strong>User ID:</strong> {selectedRequest.userId}</p>
          </div>

          <div className="full-width">
            <p><strong>Notes:</strong> {selectedRequest.notes}</p>
            <p><strong>Documentation:</strong> {selectedRequest.documentation ? "Yes" : "No"}</p>
          </div>
        </div>

        {/* Student Info Button */}
        <button 
          className="dropdown-button"
          onClick={() => setExpandedRequest(expandedRequest === selectedRequest.id ? null : selectedRequest.id)}
        >
          {expandedRequest === selectedRequest.id ? "Hide Student Info" : "Show Student Info"}
        </button>

        {/* Compact Student Info Section */}
        {expandedRequest === selectedRequest.id && (
          <div className="student-info">
            <h3>Student Info</h3>
            <p><strong>Name:</strong> {selectedRequest.student_name || "N/A"}</p>
            <p><strong>DOB:</strong> {selectedRequest.dob ? new Date(selectedRequest.dob).toLocaleDateString() : "N/A"}</p>
            <p><strong>UIN:</strong> {selectedRequest.UIN || "N/A"}</p>
            <p><strong>Phone Number:</strong> {selectedRequest.phone_number || "N/A"}</p>
          </div>
        )}
      </div>
    ) : (
      <div>
        <input
          type="text"
          placeholder="Search by UIN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="staff-search-bar"
        />

        {/* Requests List */}
        <div className="requests-container">
          {filteredRequests
            .slice((currentPage - 1) * 10, currentPage * 10) // Show only 10 per page
            .map((request) => (
              <div 
                className="request-tile"
                key={request.id}
                onClick={() => setSelectedRequest(request)}
                tabIndex="0"
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedRequest(request);
                  }
                }}
              >
                <p className="student-name">{request.student_name || "N/A"}</p>
                <p className="student-uin">UIN: {request.UIN || "N/A"}</p>
              </div>
            ))}
        </div>

        {/* Pagination Controls */}
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
      </div>
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

    {/* Display search results */}
    {filteredStudents.length > 0 ? (
      <div className="staff-search-results">
        {filteredStudents.map(student => (
          <div
            key={student.userId}
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
              <strong>{student.student_name || "N/A"}</strong> (UIN: {student.UIN || "N/A"})
            </p>
          </div>
        ))}
      </div>
    ) : (
      searchTerm.length > 0 && <p>No matching students found.</p>
    )}
  </div>
)}

{/* Student Details View */}
{view === 'studentDetails' && selectedStudent && (
  <div className="staff-student-details-container two-column-layout">
    
    {/* LEFT COLUMN - Student Info */}
    <div className="student-left-column">
      <h2 className="student-profile-heading">
        {selectedStudent.student_name}'s Profile
      </h2>

      <button 
        className="dropdown-button" 
        onClick={() => setShowStudentInfo(prev => !prev)}
      >
        {showStudentInfo ? 'Hide Information' : 'Show Information'}
      </button>

      {showStudentInfo && (
  <div className={`student-info-box ${refreshingStudent ? "blurred" : ""}`}>
    {refreshingStudent && (
      <div className="overlay-spinner">
        <div className="loading-spinner"></div>
        <p>Refreshing student data...</p>
      </div>
    )}
          {isEditing ? (
  <>
    {/* Message banners */}
    {infoMessage && (
      <div className="form-warning">
        {infoMessage}
      </div>
    )}

    {successMessage && (
      <div className="form-success">
        {successMessage}
      </div>
    )}

    <div className="edit-student-form">
      <div className="staff-form-group">
        <label htmlFor="name">Full Name:</label>
        <input
          id="name"
          type="text"
          name="student_name"
          value={editedStudent.student_name || ""}
          onChange={handleEditChange}
        />
      </div>

      <div className="staff-form-group">
        <label htmlFor="uin">UIN:</label>
        <input
          id="uin"
          type="text"
          name="UIN"
          value={editedStudent.UIN || ""}
          onChange={handleEditChange}
        />
      </div>

      <div className="staff-form-group">
        <label htmlFor="dob">Date of Birth:</label>
        <input
          id="dob"
          type="date"
          name="dob"
          value={editedStudent.dob ? editedStudent.dob.split("T")[0] : ""}
          onChange={handleEditChange}
        />
      </div>

      <div className="staff-form-group">
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          name="email"
          value={editedStudent.email || ""}
          onChange={handleEditChange}
        />
      </div>

      <div className="staff-form-group">
        <label htmlFor="phone_number">Phone Number:</label>
        <input
          id="phone_number"
          type="text"
          name="phone_number"
          value={editedStudent.phone_number || ""}
          onChange={handleEditChange}
        />
      </div>

      <button onClick={handleSaveChanges} disabled={loading}>
        {loading ? 'Saving...' : 'Save Changes'}
        {loading && <div className="staff-loading-spinner"></div>}
      </button>

      <button
        className="staff-backtoprofile-btn"
        onClick={() => {
          setIsEditing(false);
          refreshStudentData(editedStudent.userId); // ← only reloads and triggers spinner on exit
        }}
      >
        Back to Profile View
      </button>

    </div>
  </>
) : (
  <>
    <p><strong>Name:</strong> {selectedStudent?.student_name || "N/A"}</p>
    <p><strong>UIN:</strong> {selectedStudent?.UIN || "N/A"}</p>
    <p><strong>Date of Birth:</strong> {selectedStudent?.dob ? new Date(selectedStudent.dob).toLocaleDateString() : "N/A"}</p>
    <p><strong>Email:</strong> {selectedStudent?.email || "N/A"}</p>
    <p><strong>Phone Number:</strong> {selectedStudent?.phone_number || "N/A"}</p>
    <button className="edit-profile-button" onClick={() => setIsEditing(true)}>
      ✏️ Edit Profile
    </button>
  </>
)}

    </div>
      )}

      <button className="staff-cancel-btn" onClick={() => resetToStudentSearch()}>
        Back to Search
      </button>
    </div>

    {/* RIGHT COLUMN - Actions */}
    <div className="student-right-column">
      <button 
        className="toggle-button" 
        onClick={() => setShowAccommodations(prev => !prev)}
      >
        {showAccommodations ? "Hide Accommodations" : "Show Accommodations"}
      </button>

      {showAccommodations && (
        <div className="dropdown-content">
          <h4>Accommodations</h4>
          {selectedStudent?.accommodations?.length > 0 ? (
            <ul>
              {selectedStudent.accommodations.map(acc => (
                <li key={acc.id}>
                  <p><strong>Type:</strong> {acc.type || "N/A"}</p>
                  <p><strong>Status:</strong> {acc.status || "N/A"}</p>
                  <p><strong>Date Requested:</strong> {acc.date_requested ? new Date(acc.date_requested).toLocaleDateString() : "N/A"}</p>
                  <p><strong>Advisor ID:</strong> {acc.advisorId || "N/A"}</p>
                  <p><strong>Notes:</strong> {acc.notes || "N/A"}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No accommodations assigned.</p>
          )}
        </div>
      )}

      <button 
        className="toggle-button" 
        onClick={() => setShowAssistiveTech(prev => !prev)}
      >
        {showAssistiveTech ? "Hide Assistive Technologies" : "Show Assistive Technologies"}
      </button>

      {showAssistiveTech && (
        <div className="dropdown-content">
          <h4>Assistive Technologies</h4>
          {selectedStudent?.assistive_technologies?.length > 0 ? (
            <ul>
              {selectedStudent.assistive_technologies.map(tech => (
                <li key={tech.id}>
                  <p><strong>Type:</strong> {tech.type || "N/A"}</p>
                  <p><strong>Available:</strong> {tech.available !== undefined ? (tech.available ? "Yes" : "No") : "N/A"}</p>
                  <p><strong>Advisor ID:</strong> {tech.advisorId || "N/A"}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No assistive technologies assigned.</p>
          )}
        </div>
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
