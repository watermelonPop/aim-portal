import { useState, useEffect, useCallback, useRef } from 'react';
import PopupModal from "../PopupModal"; 
import StaffRequests from './staffRequests';







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

function StaffDashboard() {
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
  const [isUpdatingFormStatus, setIsUpdatingFormStatus] = useState(false);
  const [fullscreenMessage, setFullscreenMessage] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  // const [isRefreshingData, setIsRefreshingData] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);



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

  const lastFocusedRef = useRef(null);


  const handleFormStatusChange = (formId, newStatus) => {
    setFullscreenMessage({
      title: "Confirm Status Update",
      message: "Are you sure you want to save this change?",
      confirm: async () => {
        setIsRefreshing(true); // start spinner
  
        try {
          const response = await fetch("/api/updateFormStatus", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ formId, status: newStatus }),
          });
  
          if (!response.ok) {
            throw new Error(`Failed to update form status: ${response.status}`);
          }
  
          await fetchForms(selectedStudent.userId); // reload forms
  
          setFullscreenMessage({
            title: "✅ Success!",
            message: "Form status updated successfully!",
          });
  
        } catch (err) {
          console.error("Form status update error:", err);
          setFullscreenMessage({
            title: "❌ Error",
            message: "An error occurred while updating the status.",
          });
        } finally {
          setIsRefreshing(false); // hide spinner
        }
      },
    });
  };
  
  
  


  const fetchForms = async (userId) => {
    try {
      const res = await fetch(`/api/getForms?userId=${userId}`);
      const data = await res.json();
      setSubmittedForms(data.forms || []);
    } catch (err) {
      console.error("Error fetching forms:", err);
      setSubmittedForms([]);
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
    setIsEditing(false);
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
  
    // const tamuEmailRegex = /^[^\s@]+@tamu\.edu$/i;
    // if (!tamuEmailRegex.test(editedStudent.email)) {
    //   errors.push("• Email must end with @tamu.edu.");
    // }
  
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
  
      setFullscreenMessage({
        title: "✅ Success!",
        message: "Changes saved successfully!"
      });
    setStudentNeedsRefresh(true); // mark that changes were made

      setTimeout(() => setSuccessMessage(''), 2500);
  
    } catch (err) {
      console.error("❌ Update error:", err);
      setInfoMessage('❌ Failed to update student.');
    } finally {
      setLoading(false);
    }
    refreshStudentData(editedStudent?.userId);

  };

  const confirmAndSaveStatus = async (accId) => {
    const newStatus = editedAccommodations[accId];
    if (!newStatus) return;

    setFullscreenMessage({
      title: "Confirm Action",
      message: "Are you sure you want to perform this action?",
      confirm: () => {
        // put your action that was previously after the "confirmed" check here
        confirmAndSaveStatus(accId);  // example function
      }
    });    

    try {
      const res = await fetch('/api/updateAccommodationStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accommodationId: accId, status: newStatus })
      });

      if (res.ok) {
        alert('✅ Status updated successfully!');
      } else {
        setFullscreenMessage({
          title: "❌ Error",
          message: "Failed to update status."
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('❌ Error while updating status.');
    }

    
  };

  const resetToMainMenu = async () => {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.overflow = '';
    document.body.style.width = '';
    
    // Now scroll to top
    window.scrollTo(0, 0);
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
    setShowStudentInfo(false);
  };
  const [savedScrollY, setSavedScrollY] = useState(0);

function openModal() {
  const scrollY = window.scrollY;

  // Keep track of where we were scrolled to
  setSavedScrollY(scrollY);

  // Lock the body
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.overflow = 'hidden';
  document.body.style.width = '100%';

  // Now show the modal:
  setActiveModal(true);
}

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
  const modalRef = useRef(null);


  useEffect(() => {
    if (fullscreenMessage && modalRef.current) {
      modalRef.current.focus();
    }
  }, [fullscreenMessage]);
  
    
  // =========================================== USE EFFECTS ====================================================== //

  useEffect(() => {
    if (fullscreenMessage) {
      document.querySelectorAll('button, input, select, a').forEach(el => {
        if (!el.closest('.fullscreen-message-overlay')) {
          el.setAttribute('tabIndex', '-1');
        }
      });
    } else {
      document.querySelectorAll('button, input, select, a').forEach(el => {
        if (el.getAttribute('tabIndex') === '-1') {
          el.removeAttribute('tabIndex');
        }
      });
    }
  }, [fullscreenMessage]);

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

  // useEffect(() => {
  //   const fetchImportantDates = async () => {
  //     try {
  //       const res = await fetch('/api/studentgetImportantDates');
  //       const data = await res.json();
  //       setImportantDates(data.dates);
  //     } catch (err) {
  //       console.error("Failed to fetch important dates:", err);
  //     }
  //   };
  
  //   fetchImportantDates();
  // }, []);

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
    if (activeModal) {
      // Add modal-open class to lock background scroll
      document.body.classList.add('modal-open');
      
      // Immediately scroll to the top of the page
      window.scrollTo(0, 0);
    } else {
      document.body.classList.remove('modal-open');
    }
  }, [activeModal]);
  
  
  
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
    // Only fetch when the view is set to 'requests'
    if (view === 'requests') {
      const fetchRequests = async () => {
        try {
          // If not already true, ensure we show the spinner while fetching
          setLoadingRequests(true);
  
          const response = await fetch('/api/getRequests');
          const data = await response.json();
  
          setRequestsData(data.requests || []);
        } catch (error) {
          console.error('Error fetching requests:', error);
        } finally {
          // Stop the spinner once we have the data (or on error)
          setLoadingRequests(false);
        }
      };
  
      fetchRequests();
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
    <div className="staff-dashboard-container" role="main" aria-label="Staff Dashboard">
      {/* Main Content Section */}
      <div className="staff-main-content">
      {(isLoadingData || isRefreshing) && (
        <div className="fullscreen-message-overlay">
          <div className="fullscreen-message-content">
            <div className="staffDash-loading-spinner"></div>
            {/* <p>
              {isRefreshing ? "🔄 Refreshing page..." : "⌛ Loading..."}
            </p> */}
          </div>
        </div>
      )}

        {/* Dashboard Title & Back Button */}
        <div className="staff-header" role="banner" aria-label="Dashboard Header">
          {view !== null && (
            <button className="back-btn" aria-label="Back to Dashboard" onClick={resetToMainMenu}>
              ← Back to Dashboard
            </button>
          )}
        </div>
        {view === 'forms' && (
  <div className="staff-forms-section">
    <h2 tabIndex={0}>Submitted Forms</h2>
    {/* more content goes here */}
  </div>
)}
        {/* Default Staff Menu */}
        {view === null && (
          <div className="staff-menu">
            <h2>Select an action:</h2>
            <div className="staff-menu-buttons">
              <button onClick={() => setView('students')}>🔍 Student Search</button>
              <button
                  onClick={() => {
                    setLoadingRequests(true);
                    setView('requests');
                  }}
                >
                  📌 Manage Requests
                </button>
              <button onClick={() => setView('forms')}>📄 Review Submitted Forms</button>
            </div>
          </div>
        )}

{view === 'requests' && (
  <StaffRequests
    selectedRequest={selectedRequest}
    setSelectedRequest={setSelectedRequest}
    currentPage={currentPage}
    setCurrentPage={setCurrentPage}
    filteredRequests={filteredRequests}
    setFilteredRequests={setFilteredRequests}
    requestsData={requestsData}
    setRequestsData={setRequestsData}
    editedRequests={editedRequests}
    setEditedRequests={setEditedRequests}
    loadingRequests={loadingRequests}
    setLoadingRequests={setLoadingRequests}
    searchTerm={searchTerm}
    setSearchTerm={setSearchTerm}
    expandedRequest={expandedRequest}
    setExpandedRequest={setExpandedRequest}
    confirmAndSaveRequestStatus={confirmAndSaveRequestStatus}
  />
)}





        {/* Search for Students */}
        {view === 'students' && (
  <div className="staff-dashboard-section">
    <h3>Search for Students</h3>
    <input
      type="text"
      placeholder="Enter student name or UIN..."
      aria-label="Search students by name or UIN"
      value={searchTerm}
      onChange={handleSearchChange}
      className="staffDash-search-bar"
    />

    {/* Display search results */}
    {filteredStudents.length > 0 ? (
      <div className="staffDash-search-results">
        {filteredStudents.map(student => (
          <div
            key={student.userId}
            className="staffDash-search-item"
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
  <div className="staff-student-details-container">
  <div className="student-profile-card">
    <h2 className="student-profile-heading">{selectedStudent.student_name}'s Profile</h2>
    
    <button className="staffDash-cancel-btn" aria-label="View/Edit Student Info" onClick={() => setActiveModal({ type: 'studentInfo' })}>
      View / Edit Student Info
    </button>
    
{activeModal?.type === 'studentInfo' && (
  <div className="staffDash-modalOverlay">
    <div className="staffDash-modalContent">
      <div className="staffDash-modalHeader ">
        <h2>{selectedStudent?.student_name}'s Information</h2>
        <button 

          className="staffDash-modalHeaderCloseBtn "
          tabIndex="0"
          onClick={() => { setActiveModal(null); setIsEditing(false)}}
        >
          ✕
        </button>
      </div>

      {/* Show "refreshing" spinner if needed */}
      {refreshingStudent && (
        <div className="staffDash-overlay-spinner">
          <div className="staffDash-loading-spinner"></div>
          <p>Refreshing student data...</p>
        </div>
      )}

      {/* Info / Edit UI EXACTLY like your old "student-info-box" */}
      {isEditing ? (
        <>
          {infoMessage && <div className="staffDash-form-warning ">{infoMessage}</div>}
          {successMessage && <div className="staffDash-form-success">{successMessage}</div>}

          <div className="staffDash-edit-student-form">
            <div className="staffDash-form-group">
              <label htmlFor="name">Full Name:</label>
              <input
                id="name"
                type="text"
                name="student_name"
                value={editedStudent?.student_name || ""}
                onChange={handleEditChange}
              />
            </div>
            <div className="staffDash-form-group">
              <label htmlFor="uin">UIN:</label>
              <input
                id="uin"
                type="text"
                name="UIN"
                value={editedStudent?.UIN || ""}
                onChange={handleEditChange}
              />
            </div>
            <div className="staffDash-form-group">
              <label htmlFor="dob">Date of Birth:</label>
              <input
                id="dob"
                type="date"
                name="dob"
                value={editedStudent?.dob ? editedStudent.dob.split("T")[0] : ""}
                onChange={handleEditChange}
              />
            </div>
            <div className="staffDash-form-group">
              <label htmlFor="email">Email:</label>
              <input
                id="email"
                type="email"
                name="email"
                value={editedStudent?.email || ""}
                onChange={handleEditChange}
              />
            </div>
            <div className="staffDash-form-group">
              <label htmlFor="phone_number">Phone Number:</label>
              <input
                id="phone_number"
                type="text"
                name="phone_number"
                value={editedStudent?.phone_number || ""}
                onChange={handleEditChange}
              />
            </div>

            <button onClick={handleSaveChanges} aria-label="Save Changes to Student Profile" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
              {loading && <div className="staffDash-loading-spinner"></div>}
            </button>

            <button
              className="staffDash-backtoprofile-btn "
              onClick={() => {
                setIsEditing(false);
                refreshStudentData(editedStudent?.userId);
              }}

            >
              Cancel Edit
            </button>
          </div>
        </>
      ) : (
        <>
          <p><strong>Name:</strong> {selectedStudent?.student_name || "N/A"}</p>
          <p><strong>UIN:</strong> {selectedStudent?.UIN || "N/A"}</p>
          <p><strong>DOB:</strong> {selectedStudent?.dob
            ? new Date(selectedStudent.dob).toLocaleDateString()
            : "N/A"}</p>
          <p><strong>Email:</strong> {selectedStudent?.email || "N/A"}</p>
          <p><strong>Phone Number:</strong> {selectedStudent?.phone_number || "N/A"}</p>

          <button 
            className="staffDash-edit-profile-button"
            onClick={() => setIsEditing(true)}
          >
            ✏️ Edit Profile
          </button>
        </>
      )}
    </div>
  </div>
)}


<button
      className="staffDash-cancel-btn"
      onClick={() => {
        resetToStudentSearch();
        setIsEditing(false);
      }}
    >
      Back to Search
    </button>
  </div>


{/* RIGHT COLUMN – Dropdowns */}
<div className="staffDash-student-modal-buttons ">
  <button
    onClick={async () => {
      setIsRefreshing(true); // show spinner
      await fetchForms(selectedStudent.userId); // make sure you're using correct key
      setIsRefreshing(false);
      setActiveModal({ type: 'forms' });
    }}
    aria-label="View submitted forms"
  >
    📄 View Submitted Forms
  </button>
  <button
    onClick={async () => {
      setIsRefreshing(true);
      // No fetch needed if data is already in selectedStudent.accommodations
      await new Promise(resolve => setTimeout(resolve, 500)); // brief delay for UX
      setIsRefreshing(false);
      setActiveModal({ type: 'accommodations' });
    }}
    aria-label="View student accommodations"
  >
    📝 View Accommodations
  </button>
  <button
    onClick={async () => {
      setIsRefreshing(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsRefreshing(false);
      setActiveModal({ type: 'tech' });
    }}
    aria-label="View assistive technology"
  >
    💻 View Assistive Tech
  </button>

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
        <div className="staffDash-loading-spinner" aria-label="Loading alerts..." />
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
  <div className="staffDash-modalOverlay">
    <div className="staffDash-modalContent">
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
        <option value="APPROVED">Approve</option>
        <option value="REJECTED">Reject</option>
        <option value="OVERDUE">Overdue</option>
        <option value="PENDING">Pending</option>
      </select>
      {isUpdatingFormStatus && (
      <div className="staffDash-overlay-spinner">
        <div className="staffDash-loading-spinner"></div>
        <p>Updating Form Status...</p>
      </div>
    )}

      <div className="viewToggle" style={{ marginTop: '1rem' }}>
        <button ref={lastFocusedRef} aria_label="Save" onClick={() => handleFormStatusChange(activeModal.form.id, formEdits[activeModal.form.id] || activeModal.form.status)}>
          ✅ Save
        </button>
        <button onClick={() => setActiveModal(null)}>Cancel</button>
      </div>
    </div>
    
  </div>
)}
{activeModal?.type === 'forms' && (
  <div className="staffDash-modalOverlay">
    <div className="staffDash-modalContent">
    <div className="staffDash-modalHeader ">
      <h2 tabIndex={0}>Submitted Forms</h2>
      <button tabIndex={0} className="staffDash-modalHeaderCloseBtn" aria-label="close forms menu" onClick={() => {setActiveModal(null); setIsEditing(false)}}>✕</button>
      </div>
        {submittedForms.length > 0 ? (
          submittedForms.map(form => (
            <section
          key={form.id}
          className="staffDash-form-entry"
          role="region"
      aria-labelledby={`form-heading-${form.id}`}
        >
          <h3 tabIndex={0} id={`form-heading-${form.id}`}>
            {formatFormType(form.type)}
          </h3>

          <p tabIndex={0}><strong>Status:</strong> {form.status}</p>
          <p tabIndex={0}>
            <strong>Submitted:</strong>{' '}
            {form.submittedDate
              ? new Date(form.submittedDate).toLocaleDateString()
              : 'N/A'}
          </p>
          <p tabIndex={0}><strong>Due:</strong> {form.dueDate ? new Date(form.dueDate).toLocaleDateString() : 'N/A'}</p>

          {form.formUrl && (
            <p>
              <a
                href={form.formUrl}
                rel="noopener noreferrer"
                aria-label={`View submitted form for ${formatFormType(form.type)}`}
              >
                🔗 View Form
              </a>
            </p>
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
            aria-label={`Change status for ${formatFormType(form.type)} form. current status: ${form.status}`}
          >
            <option value="APPROVED">Approve</option>
            <option value="REJECTED">Deny</option>
            <option value="OVERDUE">Overdue</option>
            <option value="PENDING">Pending</option>
          </select>

          <button
          
            onClick={() => handleFormStatusChange(form.id, formEdits[form.id] || form.status)}
            aria-label={`Save status change for ${formatFormType(form.type)} form`}
          >
            💾 Save
          </button>
        </section>

        ))
      ) : (
        <p>No forms submitted.</p>
      )}
    </div>
  </div>
)}

{activeModal?.type === 'accommodations' && (
  <div className="staffDash-modalOverlay">
    <div className="staffDash-modalContent">
    <div className="staffDash-modalHeader ">
      <h2>Accomodations</h2>
      <button className="staffDash-modalHeaderCloseBtn"aria-label="close accomodations menu" onClick={() => setActiveModal(null)}>✕</button>
    </div>
      {selectedStudent.accommodations?.length > 0 ? (
        selectedStudent.accommodations.map(acc => (
          <div key={acc.id} className="staffDash-accommodation-entry">
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
  <div className="staffDash-modalOverlay">
    <div className="staffDash-modalContent">
        <div className="staffDash-modalHeader ">
        <h2>Assistive Technologies</h2>
        <button className="staffDash-modalHeaderCloseBtn" aria-label="close assistive technologies menu" onClick={() => setActiveModal(null)}>✕</button>
      </div>
      {selectedStudent.assistive_technologies?.length > 0 ? (
        selectedStudent.assistive_technologies.map(tech => (
          <div key={tech.id} className="staffDash-assistive-tech-entry">
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

{isRefreshing && (
  <div className="fullscreen-message-overlay">
    <div className="fullscreen-message-content">
      <div className="staffDash-loading-spinner"></div>
      <p>Loading</p>
    </div>
  </div>
)}


{fullscreenMessage && (
  <div 
    className="fullscreen-message-overlay" 
    tabIndex="-1" 
    ref={modalRef}
    onKeyDown={(e) => {
      if (e.key === "Escape") setFullscreenMessage(null);
    }}
  >
    <div className="fullscreen-message-content">
      <button
        className="fullscreen-message-close-btn"
        onClick={() => setFullscreenMessage(null)}
        aria_label="close confirmation menu"              
        tabIndex="0"
        onKeyDown={(e) => {
          if (e.key === "Enter") setFullscreenMessage(null);
        }}
      >
        x
      </button>

      <h2>{fullscreenMessage.title}</h2>
      <p>{fullscreenMessage.message}</p>

      {fullscreenMessage.confirm ? (
        <>
          <button
            className="fullscreen-message-button"
            tabIndex="0"
            onClick={() => {
              fullscreenMessage.confirm();
              setFullscreenMessage(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                fullscreenMessage.confirm();
                setFullscreenMessage(null);
              }
            }}
          >
            Confirm
          </button>
          <button
            className="fullscreen-message-button"
            tabIndex="0"
            onClick={() => setFullscreenMessage(null)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setFullscreenMessage(null);
            }}
          >
            Cancel
          </button>
        </>
      ) : (
        <button
          className="fullscreen-message-button"
          tabIndex="0"
          onClick={() => setFullscreenMessage(null)}
          onKeyDown={(e) => {
            if (e.key === "Enter") setFullscreenMessage(null);
          }}
        >
          Close
        </button>
      )}
    </div>
  </div>
)}


    </div>
  );
}

export default StaffDashboard;
