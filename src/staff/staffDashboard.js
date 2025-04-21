import { useState, useEffect, useCallback, useRef } from 'react';
import StaffRequests from './staffRequests';
import StaffStudentProfile from './staffStudentProfile';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faMagnifyingGlass, faListCheck, faBell} from '@fortawesome/free-solid-svg-icons';
import { confirmAndSaveRequestStatus, refreshStudentData,
  fetchForms,
  handleFormStatusChange,
  handleSaveChanges,formatFormType,
  confirmAndSaveStatus,
resetToStudentSearch } from './staffActions';



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

// function formatFormType(type) {
//   if (!type) return 'N/A';
//   return type
//     .toLowerCase()
//     .split('_')
//     .map(word => word[0].toUpperCase() + word.slice(1))
//     .join(' ');
// }


export function capitalizeWords(text) {
  return text.replace(/\b\w/g, char => char.toUpperCase());
}




// ============================== MAIN STAFF DASH FUNCTION ==============================================//

function StaffDashboard({ userPermissions, userInfo, displayHeaderRef }) {

  // CONSTANTS UNTIL LINE 513 -------------------------------------------------------------------------------------------------------------------------------

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
  const totalPages = Math.ceil((filteredRequests?.length || 0) / 10);
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const modalTopRef = useRef(null);
  const lastIntendedFocusRef = useRef(null);


  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  // const refreshStudentData = async (userId) => {
  //   setRefreshingStudent(true);
  //   try {
  //     const res = await fetch('/api/getStudents');
  //     const data = await res.json();
  
  //     const updatedStudent = data.students.find(s => s.userId === userId);
  //     if (updatedStudent) {
  //       // ✅ Replace the updated student in the list
  //       setStudentsData(prev =>
  //         prev.map(s => (s.userId === userId ? updatedStudent : s))
  //       );
  
  //       // ✅ Update selected + edited student
  //       setSelectedStudent(updatedStudent);
  //       setEditedStudent(updatedStudent);
  //     }
  //   } catch (err) {
  //     console.error("❌ Error refreshing student data:", err);
  //   } finally {
  //     setRefreshingStudent(false);
  //   }
  // };

  const lastFocusedRef = useRef(null);

  // const handleFormStatusChange = (formId, newStatus) => {
  //   setFullscreenMessage({
  //     title: "Confirm Status Update",
  //     message: "Are you sure you want to save this change?",
  //     confirm: async () => {
  //       setIsRefreshing(true); // start spinner
  
  //       try {
  //         const response = await fetch("/api/updateFormStatus", {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify({ formId, status: newStatus }),
  //         });
  
  //         if (!response.ok) {
  //           throw new Error(`Failed to update form status: ${response.status}`);
  //         }
  
  //         await fetchForms(selectedStudent.userId); // reload forms
  
  //         setFullscreenMessage({
  //           title: "✅ Success!",
  //           message: "Form status updated successfully!",
  //         });
  
  //       } catch (err) {
  //         console.error("Form status update error:", err);
  //         setFullscreenMessage({
  //           title: "❌ Error",
  //           message: "An error occurred while updating the status.",
  //         });
  //       } finally {
  //         setIsRefreshing(false); // hide spinner
  //       }
  //     },
  //   });
  // };
  
  // const fetchForms = async (userId) => {
  //   try {
  //     const res = await fetch(`/api/getForms?userId=${userId}`);
  //     const data = await res.json();
  //     setSubmittedForms(data.forms || []);
  //   } catch (err) {
  //     console.error("Error fetching forms:", err);
  //     setSubmittedForms([]);
  //   }
  // };

  // const handleStatusChange = (accId, newStatus) => {
  //   setEditedAccommodations(prev => ({
  //     ...prev,
  //     [accId]: newStatus
  //   }));
  
  //   // Optimistically update the UI
  //   setSelectedStudent(prev => ({
  //     ...prev,
  //     accommodations: prev.accommodations.map(acc =>
  //       acc.id === accId ? { ...acc, status: newStatus } : acc
  //     )
  //   }));
  // };


  
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

  const [showStudentHelp, setShowStudentHelp] = useState(false);
  const [showRequestsHelp, setShowRequestsHelp] = useState(false);

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditedStudent((prev) => ({ ...prev, [name]: value }));
  };

  const hasChanges = () => {
    return JSON.stringify(editedStudent) !== JSON.stringify(selectedStudent);
  };

  // const handleSaveChanges = async () => {
    
  //   setInfoMessage('');
  //   setSuccessMessage('');
  
  //   if (!hasChanges()) {
  //     setInfoMessage('⚠️ No changes to save.');
  //     setTimeout(() => setInfoMessage(''), 4000);
  //     return;
  //   }
  //   const errors = [];
  
  //   const nameRegex = /^[A-Za-z\s.,'-]+$/;
  //   if (!editedStudent.student_name || !nameRegex.test(editedStudent.student_name)) {
  //     errors.push("• Name must only contain letters and spaces.");
  //   }
  
  //   if (!/^\d{9}$/.test(editedStudent.UIN)) {
  //     errors.push("• UIN must be exactly 9 digits.");
  //   }
  
  //   if (!editedStudent.dob || isNaN(new Date(editedStudent.dob).getTime())) {
  //     errors.push("• Date of Birth is not valid.");
  //   }
  
  //   // const tamuEmailRegex = /^[^\s@]+@tamu\.edu$/i;
  //   // if (!tamuEmailRegex.test(editedStudent.email)) {
  //   //   errors.push("• Email must end with @tamu.edu.");
  //   // }
  
  //   const phoneRegex = /^[()\d.\-\s]+(?: x\d+)?$/;
  //   if (!phoneRegex.test(editedStudent.phone_number)) {
  //     errors.push("• Phone number format is invalid.");
  //   }
  
  //   if (errors.length > 0) {
  //     setInfoMessage(`❌ Please fix the following:\n${errors.join("\n")}`);
  //     setSuccessMessage('');
  //     setLoading(false);
  //     return;
  //   }
  
  //   setLoading(true);
  //   setInfoMessage('');
  //   setSuccessMessage('');
  
  //   const studentUpdatePayload = {
  //     userId: editedStudent.userId,
  //     student_name: editedStudent.student_name.trim(),
  //     UIN: parseInt(editedStudent.UIN, 10),
  //     dob: editedStudent.dob,
  //     email: editedStudent.email.trim(),
  //     phone_number: editedStudent.phone_number.trim(),
  //   };
  
  //   try {
  //     const response = await fetch('/api/updateStudent', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(studentUpdatePayload),
  //     });
  
  //     const result = await response.json();
  
  //     if (!response.ok) throw new Error(result.error || 'Failed to update student.');
  
  //     setFullscreenMessage({
  //       title: "✅ Success!",
  //       message: "Changes saved successfully!"
  //     });
  //   setStudentNeedsRefresh(true); // mark that changes were made

  //     setTimeout(() => setSuccessMessage(''), 2500);
  
  //   } catch (err) {
  //     console.error("❌ Update error:", err);
  //     setInfoMessage('❌ Failed to update student.');
  //   } finally {
  //     setLoading(false);
  //   }
  //   refreshStudentData(editedStudent?.userId);

  // };

  // const confirmAndSaveStatus = async (accId) => {
  //   const newStatus = editedAccommodations[accId];
  //   if (!newStatus) return;

  //   setFullscreenMessage({
  //     title: "Confirm Action",
  //     message: "Are you sure you want to perform this action?",
  //     confirm: () => {
  //       // put your action that was previously after the "confirmed" check here
  //       confirmAndSaveStatus(accId);  // example function
  //     }
  //   });    

  //   try {
  //     const res = await fetch('/api/updateAccommodationStatus', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ accommodationId: accId, status: newStatus })
  //     });

  //     if (res.ok) {
  //       alert('✅ Status updated successfully!');
  //     } else {
  //       setFullscreenMessage({
  //         title: "❌ Error",
  //         message: "Failed to update status."
  //       });
  //     }
  //   } catch (error) {
  //     console.error('Error updating status:', error);
  //     alert('❌ Error while updating status.');
  //   }

    
  // };

  const [activeTooltip, setActiveTooltip] = useState(null);
  const tooltipRefs = {
    students: useRef(null),
    requests: useRef(null),
  };

  const toggleTooltip = (type) => {
    setActiveTooltip(prev => (prev === type ? null : type));
    setTimeout(() => {
      tooltipRefs[type]?.current?.focus();
    }, 100); // Ensure tooltip receives focus for screen readers
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

// function openModal() {
//   const scrollY = window.scrollY;

//   // Keep track of where we were scrolled to
//   setSavedScrollY(scrollY);

//   // Lock the body
//   document.body.style.position = 'fixed';
//   document.body.style.top = `-${scrollY}px`;
//   document.body.style.left = '0';
//   document.body.style.right = '0';
//   document.body.style.overflow = 'hidden';
//   document.body.style.width = '100%';

//   // Now show the modal:
//   setActiveModal(true);
// }

  // const resetToStudentSearch = async () => {
  //   if (isEditing && hasChanges()) {
  //     const confirmLeave = window.confirm(
  //       "⚠️ Are you sure you want to leave? Unsaved changes will be discarded."
  //     );
  //     if (!confirmLeave) return;
  //   }

  //   setView('students');
  //   setShowAccommodations(false);
  //   setShowAssistiveTech(false);
  //   setIsEditing(false);
  //   setShowStudentInfo(false);
  //   setSelectedStudent(null);
  //   setEditedStudent(null);
  // };

  // const confirmAndSaveRequestStatus = async (requestId) => {
  //   const newStatus = editedRequests[requestId];
  //   if (!newStatus) return;
  
  //   const confirmed = window.confirm("Are you sure you want to save this status change?");
  //   if (!confirmed) return;
  
  //   try {
  //     const res = await fetch('/api/updateRequestStatus', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ requestId, status: newStatus }),
  //     });
  
  //     if (res.ok) {
  //       alert('✅ Request status updated!');
        
  //       // Refresh requests list
  //       const updated = await fetch('/api/getRequests');
  //       const data = await updated.json();
  //       setRequestsData(data.requests || []);
  //       setEditedRequests((prev) => {
  //         const copy = { ...prev };
  //         delete copy[requestId];
  //         return copy;
  //       });
  //     } else {
  //       alert('❌ Failed to update request status.');
  //     }
  //   } catch (err) {
  //     console.error("❌ Error updating request status:", err);
  //     alert("❌ Error while saving request status.");
  //   }
  // };
  const modalRef = useRef(null);


  
  
    
  // =========================================== USE EFFECTS UNTIL LINE 662 ====================================================== //

  useEffect(() => {
    if (fullscreenMessage && modalRef.current) {
      modalRef.current.focus();
    }
  }, [fullscreenMessage]);

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
        (request.UIN && request.UIN.toString().includes(query)) ||
        (request.student_name && request.student_name.toLowerCase().includes(query)) ||
        (request.notes && request.notes.toLowerCase().includes(query))
      );
    });
    

    setFilteredRequests(filtered);
    setCurrentPage(1); // Reset to first page when search updates
}, [searchTerm, requestsData]);

  StaffDashboard.debounce = debounce;
  StaffDashboard.refreshStudentData = refreshStudentData;
  StaffDashboard.setImportantDates = setImportantDates;

  return (
    <div className="staff-dashboard-container" role="main" aria-label="Staff Dashboard">
    <div className="staff-main-content">
      {(isLoadingData || isRefreshing) && (
        <div className="fullscreen-message-overlay" data-testid="loadingDiv">
          <div className="fullscreen-message-content">
            <div className="staffDash-loading-spinner"></div>
          </div>
        </div>
      )}

      <div className="staff-header">
        {view !== null && (
          <button
            className="back-btn"
            aria-label="Back to Dashboard"
            onClick={resetToMainMenu}
          >
            ← Back to Dashboard
          </button>
        )}
      </div>



      {/* DEFAULT DASHBOARD VIEW ------------------------------------------------------------------------------------- */}

      { view === null && (
      <div className="staff-menu">
        <h2>Select an action:</h2>
        <div className="staff-menu-buttons">
          
          {/* STUDENT SEARCH */}
          <div className="staff-button-wrapper">
            <button
              aria-label="Search for students"
              onClick={() => setView("students")}
              className="staff-action-btn"
              ref={displayHeaderRef}
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} /> Student Search
            </button>
            <button
              className="question-icon-btn"
              aria-label="What does Student Search do?"
              aria-haspopup="true"
              aria-expanded={activeTooltip === "students"}
              onClick={() => toggleTooltip("students")}
            >
              ?
            </button>
            {activeTooltip === "students" && (
              <div
                className="tooltip-box"
                role="tooltip"
                aria-live="polite"
                ref={tooltipRefs.students}
                tabIndex={-1}
              >
                Search for students by name or UIN. From there, you can view/edit their profile information, submitted forms, accommodations, and assistive technology.
              </div>
            )}
          </div>

          {/* MANAGE REQUESTS */}
          <div className="staff-button-wrapper">
            <button
              onClick={() => {
                setLoadingRequests(true);
                setView("requests");
              }}
              aria-label="Manage accommodation requests"
              className="staff-action-btn"
            >
              <FontAwesomeIcon icon={faListCheck} /> Manage Requests
            </button>
            <button
              className="question-icon-btn"
              aria-label="What does Manage Requests do?"
              aria-haspopup="true"
              aria-expanded={activeTooltip === "requests"}
              onClick={() => toggleTooltip("requests")}
            >
              ?
            </button>
            {activeTooltip === "requests" && (
              <div
                className="tooltip-box"
                role="tooltip"
                aria-live="polite"
                ref={tooltipRefs.requests}
                tabIndex={-1}
              >
                View and update accommodation requests submitted by students.
              </div>
            )}
          </div>

        </div>
      </div>
    )}


      {/* EXPORTS TO OTHER FILES ---------------------------------------------------------------- */}

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
          totalPages={totalPages}

        />
      )}

      {view === 'studentDetails' && (
        <StaffStudentProfile
        setStudentsData={setStudentsData}
        setView={setView}
        setShowAccommodations={setShowAccommodations}
        setShowAssistiveTech={setShowAssistiveTech}
          userInfo={userInfo}
          userPermissions={userPermissions}
          lastIntendedFocusRef={lastIntendedFocusRef}
          view={view}
          handleEditChange={handleEditChange}
          setIsRefreshing={setIsRefreshing}
          handleSaveChanges={handleSaveChanges}
          resetToStudentSearch={resetToStudentSearch}
          refreshStudentData={refreshStudentData}
          fetchForms={fetchForms}
          selectedStudent={selectedStudent}
          setSelectedStudent={setSelectedStudent}
          showStudentInfo={showStudentInfo}
          setShowStudentInfo={setShowStudentInfo}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          editedStudent={editedStudent}
          setEditedStudent={setEditedStudent}
          loading={loading}
          setLoading={setLoading}
          successMessage={successMessage}
          setSuccessMessage={setSuccessMessage}
          infoMessage={infoMessage}
          setInfoMessage={setInfoMessage}
          refreshingStudent={refreshingStudent}
          setRefreshingStudent={setRefreshingStudent}
          studentNeedsRefresh={studentNeedsRefresh}
          setStudentNeedsRefresh={setStudentNeedsRefresh}
          showForms={showForms}
          setShowForms={setShowForms}
          submittedForms={submittedForms}
          setSubmittedForms={setSubmittedForms}
          activeModal={activeModal}
          setActiveModal={setActiveModal}
          formEdits={formEdits}
          setFormEdits={setFormEdits}
          isUpdatingFormStatus={isUpdatingFormStatus}
          setIsUpdatingFormStatus={setIsUpdatingFormStatus}
          fullscreenMessage={fullscreenMessage}
          setFullscreenMessage={setFullscreenMessage}
          editedAccommodations={editedAccommodations}
          setEditedAccommodations={setEditedAccommodations}
          importantDates={importantDates}
          loadingDates={loadingDates}
          lastFocusedRef={lastFocusedRef}
          handleFormStatusChange={handleFormStatusChange}
          modalTopRef={modalTopRef}
          formatFormType={formatFormType}
          isRefreshing={isRefreshing}
          hasChanges={hasChanges}
        />
      )}


      {/* STUDENT SEARCH ------------------------------------------------------------------------------------- */}

      {view === 'students' && (
        <div className="staff-dashboard-section">
          <h3>Search for Students</h3>
          <input
            type="text"
            placeholder="Enter student name or UIN..."
            aria-label="Search students by name or UIN"
            tabIndex={0}
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
    </div>

    {/* ALERTS TAB ------------------------------------------------------------------------------------- */}

    {view === null && (
      <aside className="staff-alerts">
        <h3><FontAwesomeIcon icon={faBell} /> Alerts</h3>
        <div className="alert-box">
          {loadingDates ? (
            <div className="spinnerClassItem" role="status" aria-label="Loading, please wait">
            <div className="spinner-iconClassItem" aria-hidden="true"></div>
            <h3 className="spinner-textClassItem">Loading...</h3>
            </div>
          ) : (
            (importantDates || []).map(date => (
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
            aria-label="close confirmation menu"              
            tabIndex={0}
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
                data-testid="confirmBtn"
                tabIndex={0}
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
                tabIndex={0}
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
