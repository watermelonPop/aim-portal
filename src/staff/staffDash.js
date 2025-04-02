import { useState, useEffect, useCallback  } from 'react';
import PopupModal from "../PopupModal"; // adjust path as needed




//helper functions

export function renderNotes(type) {
  switch (type.toLowerCase()) {
    case 'break': return 'Scheduled break in academic calendar';
    case 'office closure': return 'University offices closed';
    case 'weather': return 'Weather-related advisory';
    case 'deadline': return 'Upcoming student-related deadline';
    default: return 'Important update';
  }
}

function formatFormType(type) {
  if (!type) return 'N/A';
  return type
    .toLowerCase()
    .split('_')
    .map(word => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}


export function capitalizeWords(text) {
  return text.replace(/\b\w/g, char => char.toUpperCase());
}

function DropdownSection({ title, isOpen, toggleOpen, children }) {
  return (
    <div className="dropdown-section">
      <button className="toggle-button" onClick={toggleOpen}>
        {isOpen ? `Hide ${title}` : `Show ${title}`}
      </button>
      {isOpen && <div className="dropdown-content">{children}</div>}
    </div>
  );
}



// ============================== MAIN STAFF DASH FUNCTION ==============================================//

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
  const [editedAccommodations, setEditedAccommodations] = useState({});
  const [loadingStudentList, setLoadingStudentList] = useState(false);
  const [importantDates, setImportantDates] = useState([]);
  const [loadingDates, setLoadingDates] = useState(true);  
  const [showForms, setShowForms] = useState(false);
  const [submittedForms, setSubmittedForms] = useState([]);
  const [editedRequests, setEditedRequests] = useState({});
  const [updatingRequestId, setUpdatingRequestId] = useState(null);
  const [refreshingRequests, setRefreshingRequests] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'forms', 'accommodations', 'tech'
  const [formEdits, setFormEdits] = useState({}); // { formId: newStatus }






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

  const handleFormStatusChange = async (formId, newStatus) => {
    const confirmed = window.confirm("Are you sure you want to change the form status?");
    if (!confirmed) return;
  
    try {
      const response = await fetch("/api/updateFormStatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ formId, status: newStatus }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to update form status: ${response.status}`);
      }
  
      setFormEdits((prev) => ({ ...prev, [formId]: newStatus }));
      alert("Form status updated successfully.");
    } catch (err) {
      console.error("Error updating form status:", err);
      alert("An error occurred while updating the status. Please try again.");
    }
  };
  
  
  

  const handleStatusChange = (accId, newStatus) => {
    setEditedAccommodations(prev => ({
      ...prev,
      [accId]: newStatus
    }));
  
    // Optimistically update the UI
    setSelectedStudent(prev => ({
      ...prev,
      accommodations: prev.accommodations.map(acc =>
        acc.id === accId ? { ...acc, status: newStatus } : acc
      )
    }));
  };

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
  const handleStudentClick = async (student) => {
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
  
    // 🆕 Fetch submitted forms from the API
    try {
      const res = await fetch(`/api/getForms?userId=${student.userId}`);
      const data = await res.json();
      setSubmittedForms(data.forms || []);
    } catch (err) {
      console.error("❌ Error fetching submitted forms:", err);
      setSubmittedForms([]);
    }
  };

  // Handle input change for editing
  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditedStudent((prev) => ({ ...prev, [name]: value }));
  };

  const hasChanges = () => {
    return JSON.stringify(editedStudent) !== JSON.stringify(selectedStudent);
  };

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

  const confirmAndSaveStatus = async (accId) => {
    const newStatus = editedAccommodations[accId];
    if (!newStatus) return;

    const confirmed = window.confirm("Are you sure you want to save this change?");
    if (!confirmed) return;

    try {
      const res = await fetch('/api/updateAccommodationStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accommodationId: accId, status: newStatus })
      });

      if (res.ok) {
        alert('✅ Status updated successfully!');
      } else {
        alert('❌ Failed to update status.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('❌ Error while updating status.');
    }

    
  };

  const resetToMainMenu = async () => {
    if (isEditing && hasChanges()) {
      const confirmLeave = window.confirm(
        "⚠️ Are you sure you want to leave? Unsaved changes will be discarded."
      );
      if (!confirmLeave) return;
    }



    setView(null);
    // setSearchTerm('');
    setFilteredStudents([]);
    setSelectedStudent(null);
    setIsEditing(false);
    setEditedStudent(null);
    setSelectedRequest(null);
    setShowAccommodations(false);
    setShowAssistiveTech(false);
  };

  const resetToStudentSearch = async () => {
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
    setSelectedStudent(null);
    setEditedStudent(null);
  };

  const confirmAndSaveRequestStatus = async (requestId) => {
    const newStatus = editedRequests[requestId];
    if (!newStatus) return;
  
    const confirmed = window.confirm("Are you sure you want to save this status change?");
    if (!confirmed) return;
  
    try {
      const res = await fetch('/api/updateRequestStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status: newStatus }),
      });
  
      if (res.ok) {
        alert('✅ Request status updated!');
        
        // Refresh requests list
        const updated = await fetch('/api/getRequests');
        const data = await updated.json();
        setRequestsData(data.requests || []);
        setEditedRequests((prev) => {
          const copy = { ...prev };
          delete copy[requestId];
          return copy;
        });
      } else {
        alert('❌ Failed to update request status.');
      }
    } catch (err) {
      console.error("❌ Error updating request status:", err);
      alert("❌ Error while saving request status.");
    }
  };
  
    
  // =========================================== USE EFFECTS ====================================================== //

  useEffect(() => {
    const fetchImportantDates = async () => {
      try {
        const res = await fetch('/api/staffgetImportantDates');
        const data = await res.json();
        setImportantDates(data.dates);
      } catch (err) {
        console.error("Failed to fetch important dates:", err);
      } finally {
        setLoadingDates(false);
      }
    };

    fetchImportantDates();
  }, []);

  useEffect(() => {
    if (view == null) {
      setSearchTerm("");
      setSelectedStudent(null);
      setShowAccommodations(false);
      setShowAssistiveTech(false);

    }
  }, [view]);

  useEffect(() => {
    const fetchImportantDates = async () => {
      try {
        const res = await fetch('/api/studentgetImportantDates');
        const data = await res.json();
        setImportantDates(data.dates);
      } catch (err) {
        console.error("Failed to fetch important dates:", err);
      }
    };
  
    fetchImportantDates();
  }, []);

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
        {view === 'forms' && (
  <div className="staff-forms-section">
    <h2>Submitted Forms</h2>
    {/* more content goes here */}
  </div>
)}
        {/* Default Staff Menu */}
        {view === null && (
          <div className="staff-menu">
            <h2>Select an action:</h2>
            <div className="staff-menu-buttons">
              <button onClick={() => setView('students')}>🔍 Student Profiles</button>
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
      <div className="request-details-card">
  <h2 className="card-title">📌 Request Details</h2>

  {/* Dropdown for Advisor Info */}
  <details className="request-meta-dropdown">
    <summary className="meta-toggle">Toggle Request Metadata</summary>
    
    <div className="request-meta-grid">
      <div><strong>Request ID:</strong> {selectedRequest.id}</div>
      <div><strong>User ID:</strong> {selectedRequest.userId}</div>
      <div><strong>Advisor ID:</strong> {selectedRequest.advisorId}</div>
      <div><strong>Advisor Role:</strong> {selectedRequest.advisorRole || "N/A"}</div>
    </div>
  </details>

  {/* Centered Status Control */}
  <div className="status-control-centered">
    <label><strong>Status:</strong></label>
    <select
      value={editedRequests[selectedRequest.id] || selectedRequest.status || "PENDING"}
      onChange={(e) =>
        setEditedRequests((prev) => ({
          ...prev,
          [selectedRequest.id]: e.target.value,
        }))
      }
    >
      <option value="PENDING">Pending</option>
      <option value="APPROVED">Approved</option>
      <option value="DENIED">Denied</option>
    </select>

    <button
      className="save-icon-button"
      onClick={() => confirmAndSaveRequestStatus(selectedRequest.id)}
      title="Save status change"
    >
      💾
    </button>
  </div>

  <div className="request-notes">
    <strong>Notes:</strong>
    <p>{selectedRequest.notes || "N/A"}</p>
  </div>

  <div className="request-docs">
    <strong>Documentation:</strong>
    <span className={`doc-badge ${selectedRequest.documentation ? "yes" : "no"}`}>
      {selectedRequest.documentation ? "✔️ Yes" : "❌ No"}
    </span>
  </div>

  <button
    className="expand-button"
    onClick={() =>
      setExpandedRequest(
        expandedRequest === selectedRequest.id ? null : selectedRequest.id
      )
    }
  >
    {expandedRequest === selectedRequest.id ? "Hide Student Info" : "Show Student Info"}
  </button>

  {expandedRequest === selectedRequest.id && (
    <div className="student-info-box">
      <h3>🎓 Student Info</h3>
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
            data-testid={`student-item-${student.userId}`}
            tabIndex="0"
            role="button"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleStudentClick(student);
              }
            }}
          >
            <p data-testid={`student-${student.userId}`}>
              {student.student_name || "N/A"} (UIN: {student.UIN || "N/A"})
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
  <div className="staff-student-details-container updated-layout">

{/* LEFT COLUMN – Student Info and Edit Form */}
<div className="student-profile-card">
  <h2 className="student-profile-heading">{selectedStudent.student_name}'s Profile</h2>

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
          {infoMessage && <div className="form-warning">{infoMessage}</div>}
          {successMessage && <div className="form-success">{successMessage}</div>}

          <div className="edit-student-form">
            {/* Editable fields (name, UIN, DOB, etc) */}
            {/* KEEP ALL YOUR EXISTING EDIT FORM HERE */}
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
                refreshStudentData(editedStudent.userId);
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
          <p><strong>DOB:</strong> {selectedStudent?.dob ? new Date(selectedStudent.dob).toLocaleDateString() : "N/A"}</p>
          <p><strong>Email:</strong> {selectedStudent?.email || "N/A"}</p>
          <p><strong>Phone Number:</strong> {selectedStudent?.phone_number || "N/A"}</p>
          <button className="edit-profile-button" onClick={() => setIsEditing(true)}>✏️ Edit Profile</button>
        </>
      )}
    </div>
  )}

  <button className="staff-cancel-btn" onClick={() => resetToStudentSearch()}>
    Back to Search
  </button>
</div>

{/* RIGHT COLUMN – Dropdowns */}
<div className="student-modal-buttons">
  <button onClick={() => setActiveModal({ type: 'forms' })}>📄 View Submitted Forms</button>
  <button onClick={() => setActiveModal({ type: 'accommodations' })}>📝 View Accommodations</button>
  <button onClick={() => setActiveModal({ type: 'tech' })}>💻 View Assistive Tech</button>
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
      {loadingDates ? (
        <div className="loading-spinner-small" aria-label="Loading alerts..." />
      ) : (
        importantDates.map(date => (
          <div key={date.id} className="alert-item">
            <p className="alert-date">{new Date(date.date).toISOString().split('T')[0]}</p>
            <p className="alert-message">
              <strong>{capitalizeWords(date.name)}</strong>
            </p>
            <p className="alert-notes">{renderNotes(date.type)}</p>
          </div>
        ))
      )}
    </div>
  </aside>
)}


{activeModal?.type === 'formStatus' && (
  <div className="modalOverlay">
    <div className="modalContent">
      <h2>Update Form Status</h2>
      <p><strong>Form:</strong> {formatFormType(activeModal.form.type)}</p>
      <p><strong>Current Status:</strong> {activeModal.form.status}</p>

      <label htmlFor="newStatusSelect">Select New Status:</label>
      <select
        id="newStatusSelect"
        value={formEdits[activeModal.form.id] || activeModal.form.status}
        onChange={(e) =>
          setFormEdits((prev) => ({
            ...prev,
            [activeModal.form.id]: e.target.value,
          }))
        }
      >
        <option value="PENDING">Pending</option>
        <option value="APPROVED">Approved</option>
        <option value="DENIED">Denied</option>
      </select>

      <div className="viewToggle" style={{ marginTop: '1rem' }}>
        <button onClick={() => handleFormStatusChange(activeModal.form.id, formEdits[activeModal.form.id] || activeModal.form.status)}>
          ✅ Save
        </button>
        <button onClick={() => setActiveModal(null)}>Cancel</button>
      </div>
    </div>
  </div>
)}
{activeModal?.type === 'forms' && (
  <div className="modalOverlay">
    <div className="modalContent">
    <div className="modalHeader">
      <h2>Submitted Forms</h2>
      <button className="modalHeaderCloseBtn" onClick={() => setActiveModal(null)}>✕</button>
    </div>
      {submittedForms.length > 0 ? (
        submittedForms.map(form => (
          <div key={form.id} className="form-entry">
            <p><strong>Type:</strong> {formatFormType(form.type)}</p>
            <p><strong>Status:</strong> {form.status}</p>
            <p><strong>Submitted:</strong> {form.submittedDate ? new Date(form.submittedDate).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Due:</strong> {form.dueDate ? new Date(form.dueDate).toLocaleDateString() : 'N/A'}</p>
            {form.formUrl && (
              <p><a href={form.formUrl} target="_blank" rel="noopener noreferrer">🔗 View Form</a></p>
            )}
            <label htmlFor={`status-${form.id}`}>Change Status:</label>
            <select
              id={`status-${form.id}`}
              value={formEdits[form.id] || form.status}
              onChange={(e) =>
                setFormEdits((prev) => ({
                  ...prev,
                  [form.id]: e.target.value,
                }))
              }
            >
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="DENIED">Denied</option>
            </select>
            <button onClick={() => handleFormStatusChange(form.id, formEdits[form.id] || form.status)}>💾 Save</button>
          </div>
        ))
      ) : (
        <p>No forms submitted.</p>
      )}
    </div>
  </div>
)}

{activeModal?.type === 'accommodations' && (
  <div className="modalOverlay">
    <div className="modalContent">
    <div className="modalHeader">
      <h2>Accomodations</h2>
      <button className="modalHeaderCloseBtn" onClick={() => setActiveModal(null)}>✕</button>
    </div>
      {selectedStudent.accommodations?.length > 0 ? (
        selectedStudent.accommodations.map(acc => (
          <div key={acc.id} className="accommodation-entry">
            <p><strong>Type:</strong> {acc.type}</p>
            <p><strong>Status:</strong> {acc.status}</p>
            <p><strong>Requested On:</strong> {new Date(acc.date_requested).toLocaleDateString()}</p>
          </div>
        ))
      ) : (
        <p>No accommodations available.</p>
      )}
    </div>
  </div>
)}

{activeModal?.type === 'tech' && (
  <div className="modalOverlay">
    <div className="modalContent">
        <div className="modalHeader">
        <h2>Assistive Technologies</h2>
        <button className="modalHeaderCloseBtn" onClick={() => setActiveModal(null)}>✕</button>
      </div>
      {selectedStudent.assistive_technologies?.length > 0 ? (
        selectedStudent.assistive_technologies.map(tech => (
          <div key={tech.id} className="assistive-tech-entry">
            <p><strong>Type:</strong> {tech.type}</p>
            <p><strong>Available:</strong> {tech.available ? "Yes" : "No"}</p>
          </div>
        ))
      ) : (
        <p>No assistive technology assigned.</p>
      )}
    </div>
  </div>
)}

    </div>
  );
}

export default StaffDash;
