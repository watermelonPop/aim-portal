import { useEffect, useState, useRef } from 'react';
import CustomFileInput from './CustomFileInput';
import '../student/StudentAccommodations.css';

function StudentAccommodations({ 
  userInfo, 
  setAlertMessage, 
  setShowAlert, 
  displayHeaderRef, 
  settingsTabOpen, 
  lastIntendedFocusRef 
}) {
  const [loading, setLoading] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [error, setError] = useState('');
  const localRef = useRef(null);
  const headingRef = displayHeaderRef || localRef;
  
  // For general accommodations modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccommodation, setSelectedAccommodation] = useState('');
  // Store course IDs (numbers)
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  
  // For assistive technology modal state
  const [isAssistiveModalOpen, setIsAssistiveModalOpen] = useState(false);
  const [selectedAssistiveTech, setSelectedAssistiveTech] = useState('');
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const safeLastIntendedFocusRef = lastIntendedFocusRef || { current: null };

  // Helper function to refresh student data
  const refreshStudentData = async () => {
    try {
      const res = await fetch(`/api/getStudentData?userId=${userInfo.id}`);
      const data = await res.json();
      setStudentData(data);
    } catch (error) {
      console.error("Failed to refresh student data", error);
    }
  };

  // Header focus management
  useEffect(() => {
    if (!headingRef.current || settingsTabOpen === true) return;
    if (safeLastIntendedFocusRef.current !== headingRef.current) {
      safeLastIntendedFocusRef.current = headingRef.current;
    }
  }, [settingsTabOpen, headingRef, safeLastIntendedFocusRef]);

  useEffect(() => {
    if (!headingRef.current || settingsTabOpen === true) return;
    const frame = requestAnimationFrame(() => {
      const isAlertOpen = document.querySelector('[data-testid="alert"]') !== null;
      if (
        headingRef.current &&
        !isAlertOpen &&
        document.activeElement !== headingRef.current &&
        safeLastIntendedFocusRef.current === headingRef.current
      ) {
        headingRef.current.focus();
        safeLastIntendedFocusRef.current = null;
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [settingsTabOpen, headingRef, safeLastIntendedFocusRef]);

  // Fetch student data (including accommodations, assistive technologies, and courses)
  useEffect(() => {
    if (userInfo?.role === 'STUDENT' && userInfo?.id) {
      setLoading(true);
      fetch(`/api/getStudentData?userId=${userInfo.id}`)
        .then(res => res.json())
        .then(data => setStudentData(data))
        .catch(err => {
          console.error('Failed to fetch student data', err);
          setError('Failed to fetch student data');
        })
        .finally(() => setLoading(false));
    }
  }, [userInfo]);

  // --- Focus the General Accommodation Modal when open ---
  const applyModalRef = useRef(null);
  useEffect(() => {
    if (isModalOpen && applyModalRef.current) {
      applyModalRef.current.focus();
    }
  }, [isModalOpen]);

  // --- Focus the Assistive Technology Modal when open ---
  const assistiveModalRef = useRef(null);
  useEffect(() => {
    if (isAssistiveModalOpen && assistiveModalRef.current) {
      assistiveModalRef.current.focus();
    }
  }, [isAssistiveModalOpen]);

  // --- General Accommodations Modal Handlers ---
  const openApplyModal = () => {
    setSelectedAccommodation('');
    setSelectedClasses([]);
    setUploadedFile(null);
    setIsModalOpen(true);
  };

  const handleClassToggle = (courseId) => {
    setSelectedClasses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId) 
        : [...prev, courseId]
    );
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAccommodation) {
      alert("Please select an accommodation option.");
      return;
    }
    if (selectedClasses.length === 0) {
      alert("Please select at least one class for this accommodation.");
      return;
    }
    const payload = {
      studentId: userInfo.id,
      accommodationType: selectedAccommodation,
      classes: selectedClasses, // array of course IDs
      note: `Requesting ${selectedAccommodation}`,
      status: 'PENDING'
    };

    try {
      const res = await fetch('/api/applyForAccommodation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        alert("Failed to submit accommodation request.");
        return;
      }
      if (uploadedFile) {
        const formData = new FormData();
        formData.append("file", uploadedFile);
        formData.append("type", "GENERAL_ACCOMMODATION");
        formData.append("formName", `Supporting Document for ${selectedAccommodation}`);
        formData.append("userId", userInfo.id);
        const res2 = await fetch('/api/uploadForm', {
          method: 'POST',
          body: formData
        });
        if (!res2.ok) {
          alert("Accommodation request submitted but file upload failed.");
        }
      }
      setIsModalOpen(false);
      setShowSuccessModal(true);
      refreshStudentData();
    } catch (error) {
      console.error("Error submitting accommodation request:", error);
      alert("Error submitting accommodation request.");
    }
  };

  // --- Delete Accommodation Handler ---
  const handleDeleteAccommodation = async (accId) => {
    if (!window.confirm("Are you sure you want to delete this accommodation request?")) return;
    try {
      const res = await fetch(`/api/deleteAccommodation?accId=${accId}`, { method: 'DELETE' });
      if (!res.ok) {
        alert("Failed to delete accommodation request.");
        return;
      }
      setStudentData(prev => ({
        ...prev,
        accommodations: prev.accommodations.filter(acc => acc.id !== accId)
      }));
    } catch (error) {
      console.error("Error deleting accommodation:", error);
      alert("Error deleting accommodation request.");
    }
  };

  // --- Assistive Technology Modal Handlers ---
  const openAssistiveModal = () => {
    setSelectedAssistiveTech('');
    setIsAssistiveModalOpen(true);
  };

  const handleAssistiveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAssistiveTech) {
      alert("Please select an assistive technology option.");
      return;
    }
    try {
      const res = await fetch('/api/applyForAssistiveTech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: userInfo.id,
          assistiveTechType: selectedAssistiveTech
        })
      });
      if (!res.ok) {
        alert("Failed to submit assistive technology request.");
        return;
      }
      setIsAssistiveModalOpen(false);
      setShowSuccessModal(true);
      refreshStudentData();
    } catch (error) {
      console.error("Error submitting assistive technology request:", error);
      alert("Error submitting assistive technology request.");
    }
  };

  // --- Utility: Focus Trap for Modals ---
  const trapFocus = (e, modalRef) => {
    if (e.key !== 'Tab') return;

    const focusableElements = modalRef.current.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    }
  };

  // Create ref for success modal to trap focus if needed.
  const successModalRef = useRef(null);

  // --- Modal Render Functions ---
  const renderApplyModal = () => (
    <div className="saModalOverlay" role="presentation" onClick={() => setIsModalOpen(false)}>
      <div
        ref={applyModalRef}
        className="saModalContent"
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-modal-heading"
        tabIndex={0}
        onClick={e => e.stopPropagation()}
        onKeyDown={e => trapFocus(e, applyModalRef)}
      >
        <h2 id="apply-modal-heading">Apply for Accommodation</h2>
        <form onSubmit={handleModalSubmit}>
          <label htmlFor="accommodationSelect">Select Accommodation:</label>
          <select
            id="accommodationSelect"
            value={selectedAccommodation}
            onChange={e => setSelectedAccommodation(e.target.value)}
            required
          >
            <option value="" disabled>-- Select an option --</option>
            <option value="Audio/Visual Aids">Audio/Visual Aids</option>
            <option value="Flexibility with Attendance">Flexibility with Attendance</option>
            <option value="Interpreter Services">Interpreter Services</option>
            <option value="Modified Assignments">Modified Assignments</option>
            <option value="Use of Assistive Technology">Use of Assistive Technology</option>
          </select>
          
          <fieldset>
            <legend>Select Classes:</legend>
            {studentData?.courses && studentData.courses.length > 0 ? (
              studentData.courses.map(course => (
                <div key={course.id}>
                  <input
                    type="checkbox"
                    id={`course-${course.id}`}
                    value={course.id}
                    checked={selectedClasses.includes(course.id)}
                    onChange={() => handleClassToggle(course.id)}
                  />
                  <label htmlFor={`course-${course.id}`}>{course.name}</label>
                </div>
              ))
            ) : (
              <p>You are not enrolled in any courses.</p>
            )}
          </fieldset>
          
          <CustomFileInput
            onFileChange={setUploadedFile}
            fileLabel="Upload Supporting Form (optional)"
          />
          
          <div className="saModalButtons">
            <button type="submit">Submit Request</button>
            <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderAssistiveModal = () => (
    <div className="saModalOverlay" role="presentation" onClick={() => setIsAssistiveModalOpen(false)}>
      <div
        ref={assistiveModalRef}
        className="saModalContent"
        role="dialog"
        aria-modal="true"
        aria-labelledby="assistive-modal-heading"
        tabIndex={0}
        onClick={e => e.stopPropagation()}
        onKeyDown={e => trapFocus(e, assistiveModalRef)}
      >
        <h2 id="assistive-modal-heading">Apply for Assistive Technology</h2>
        <form onSubmit={handleAssistiveSubmit}>
          <label htmlFor="assistiveSelect">Select Assistive Technology:</label>
          <select
            id="assistiveSelect"
            value={selectedAssistiveTech}
            onChange={e => setSelectedAssistiveTech(e.target.value)}
            required
          >
            <option value="" disabled>-- Select an option --</option>
            <option value="Smart Wheelchairs">Smart Wheelchairs</option>
            <option value="Speech-to-Text/Text-to-Speech">Speech-to-Text/Text-to-Speech</option>
            <option value="Screen Reader">Screen Reader</option>
            <option value="Specialty Mouse and Keyboard">Specialty Mouse and Keyboard</option>
            <option value="Smart Pens">Smart Pens</option>
            <option value="Braille Writer">Braille Writer</option>
          </select>
          <div className="saModalButtons">
            <button type="submit">Submit Request</button>
            <button type="button" onClick={() => setIsAssistiveModalOpen(false)}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderSuccessModal = () => (
    <div className="saModalOverlay" role="presentation" onClick={() => setShowSuccessModal(false)}>
      <div
        ref={successModalRef}
        className="saModalContent"
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-modal-heading"
        tabIndex={0}
        onClick={e => e.stopPropagation()}
        onKeyDown={e => trapFocus(e, successModalRef)}
      >
        <h2 id="success-modal-heading">Request Submitted</h2>
        <p>Your request has been submitted successfully.</p>
        <p>Check your accommodations tab to view your request statuses.</p>
        <div className="saModalButtons">
          <button type="button" onClick={() => setShowSuccessModal(false)}>Close</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="studentAccommodationsWrapper">
      <h2 ref={headingRef} tabIndex={0} className="dashboardTitle">Accommodations</h2>
      
      <button 
        onClick={openApplyModal}
        className="applyAccommodationButton"
        aria-label="Apply for new accommodation"
      >
        Apply for Accommodation
      </button>

      <button 
        onClick={openAssistiveModal}
        className="applyAssistiveButton"
        aria-label="Apply for assistive technology"
      >
        Apply for Assistive Technology
      </button>
      
      {loading ? (
        <p>Loading accommodations...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : studentData?.accommodations?.length > 0 ? (
        <div className="accommodationsContainer">
          {studentData.accommodations.map((acc) => (
            <div 
              key={acc.id} 
              className="accommodationCard" 
              tabIndex={0} 
              aria-label={`Accommodation ${acc.type} with status ${acc.status}. You requested for this accommodation on ${new Date(acc.date_requested).toLocaleDateString()}. Advisor Name ${acc.advisor.account.name}. Notes ${acc.notes}`}
            >
              <div><strong>Type:</strong> {acc.type || 'N/A'}</div>
              <div><strong>Status:</strong> {acc.status}</div>
              <div><strong>Date Requested:</strong> {new Date(acc.date_requested).toLocaleDateString()}</div>
              <div><strong>Advisor:</strong> {acc.advisor?.account?.name || 'N/A'}</div>
              <div role="region" aria-label={`Notes: ${acc.notes}`}>
                <strong>Notes:</strong> {acc.notes}
              </div>
              {acc.status.toLowerCase() === 'pending' && (
                <button 
                  onClick={() => handleDeleteAccommodation(acc.id)}
                  aria-label={`Delete accommodation request for ${acc.type}`}
                >
                  Delete Request
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No accommodations found.</p>
      )}
      
      <h3>Assistive Technology</h3>
      {studentData?.assistive_technologies?.length > 0 ? (
        <div className="accommodationsContainer">
          {studentData.assistive_technologies.map((tech, index) => (
            <div 
              key={index} 
              className="accommodationCard" 
              tabIndex={0} 
              aria-label={`Assistive technology ${tech.type} is ${tech.available ? 'available' : 'not available'}. Advisor Name ${tech.advisor.account.name}`}
            >
              <div><strong>Type:</strong> {tech.type}</div>
              <div><strong>Available:</strong> {tech.available ? 'Yes' : 'No'}</div>
              <div><strong>Advisor:</strong> {tech.advisor?.account?.name || 'N/A'}</div>
            </div>
          ))}
        </div>
      ) : (
        <p>No assistive technologies found.</p>
      )}
      
      {isModalOpen && renderApplyModal()}
      {isAssistiveModalOpen && renderAssistiveModal()}
      {showSuccessModal && renderSuccessModal()}
    </div>
  );
}

export default StudentAccommodations;
