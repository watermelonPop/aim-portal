import { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faPenToSquare, faFloppyDisk, faClockRotateLeft} from '@fortawesome/free-solid-svg-icons';

function StaffStudentProfile({
    view,
    displayHeaderRef, 
    handleEditChange,
    setIsRefreshing,
    handleSaveChanges,
    resetToStudentSearch,
    refreshStudentData,
    fetchForms,
    settingsTabOpen, 
    lastIntendedFocusRef,
    selectedStudent,
    setSelectedStudent,
    showStudentInfo,
    setShowStudentInfo,
    isEditing,
    setIsEditing,
    editedStudent,
    setEditedStudent,
    loading,
    setLoading,
    successMessage,
    setSuccessMessage,
    infoMessage,
    setInfoMessage,
    refreshingStudent,
    setRefreshingStudent,
    studentNeedsRefresh,
    setStudentNeedsRefresh,
    showForms,
    setShowForms,
    submittedForms,
    setSubmittedForms,
    activeModal,
    setActiveModal,
    formEdits,
    setFormEdits,
    isUpdatingFormStatus,
    setIsUpdatingFormStatus,
    fullscreenMessage,
    setFullscreenMessage,
    editedAccommodations,
    setEditedAccommodations,
    importantDates,
    loadingDates,
    lastFocusedRef,
    handleFormStatusChange,
    modalTopRef,
    formatFormType,
    isRefreshing,
    userInfo,

}) {

  const localRef = useRef(null);
  const headingRef = displayHeaderRef || localRef;
  const [userPermissions, setUserPermissions] = useState(null);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  const confirmAndSaveAccommodation = async (accId) => {
    const acc = selectedStudent.accommodations.find(a => a.id === accId);
    const edits = editedAccommodations[accId] || {};
  
    const payload = {
      id: accId,
      type: edits.type?.trim() || acc.type?.trim() || "",
      status: edits.status?.trim() || acc.status?.trim() || "",
      date_requested: edits.date_requested || acc.date_requested || "",
      notes: edits.notes ?? acc.notes ?? "", // notes can be empty string
    };
  
    // Basic frontend validation
    if (!payload.type || !payload.status || !payload.date_requested) {
      setFullscreenMessage({
        title: "❌ Invalid Input",
        message: "Please fill out all required fields (Type, Status, and Date).",
      });
      return;
    }
  
    try {
      const res = await fetch("/api/updateAccommodationDetails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update");
      }
  
      setFullscreenMessage({
        title: "✅ Success",
        message: "Accommodation updated successfully!",
      });
  
      refreshStudentData(selectedStudent.userId);
    } catch (err) {
      console.error("Failed to update accommodation:", err);
      setFullscreenMessage({
        title: "❌ Update Failed",
        message: err.message || "Something went wrong while saving.",
      });
    }
  };
  
  
  
  const [expandedAccNotes, setExpandedAccNotes] = useState(null);

  const [assistiveTechEdits, setAssistiveTechEdits] = useState({});

  const confirmAndSaveTech = async (id) => {
    // Get the original values
    const tech = selectedStudent.assistive_technologies.find(t => t.id === id);
    if (!tech) return alert("Tech entry not found.");
  
    // Get edited values (if any)
    const edits = assistiveTechEdits[id] || {};
  
    // Use either the edited values or fallback to existing ones
    const type = edits.type !== undefined ? edits.type : tech.type;
    const available = edits.available !== undefined ? edits.available : tech.available;
  
    // Validate
    if (!type || typeof available !== "boolean") {
      alert("❌ Type and availability are required.");
      return;
    }
  
    try {
      const res = await fetch("/api/updateAssistiveTech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type, available }),
      });
  
      if (!res.ok) throw new Error("Failed to update");
  
      alert("✅ Assistive Technology updated successfully!");
  
      // Optionally clear the edit cache
      setAssistiveTechEdits(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
  
    } catch (err) {
      console.error("Error:", err);
      alert("❌ There was a problem saving changes.");
    }
  };
  



  const refreshPermissions = async () => {
    try {
      setLoadingPermissions(true);
      const res = await fetch('/api/getMyPermissions', {
        headers: {
          'x-user-id': userInfo?.id,
        }
      });
  
      const data = await res.json();
  
      if (res.ok) {
        setUserPermissions(data.permissions);
      } else {
        console.error("Failed to fetch permissions:", data.error);
      }
    } catch (err) {
      console.error("Error refreshing permissions:", err);
    } finally {
      setLoadingPermissions(false);
    }
  };
  
  

  useEffect(() => {
    if (selectedStudent) {
      refreshPermissions();
    }
  }, [selectedStudent]);
  
  

  useEffect(() => {
    if (!headingRef.current || settingsTabOpen === true) return;
    if (lastIntendedFocusRef?.current !== headingRef.current) {
      lastIntendedFocusRef.current = headingRef.current;
    }
  }, [settingsTabOpen, headingRef]);

  useEffect(() => {
    if (!headingRef.current || settingsTabOpen === true) return;

    const frame = requestAnimationFrame(() => {
      const isAlertOpen = document.querySelector('[data-testid="alert"]') !== null;
      if (
        headingRef.current &&
        !isAlertOpen &&
        document.activeElement !== headingRef.current &&
        lastIntendedFocusRef.current === headingRef.current
      ) {
        headingRef.current.focus();
        lastIntendedFocusRef.current = null;
      }
    });

        return () => cancelAnimationFrame(frame);
    }, [settingsTabOpen, headingRef]);

  return (
    <main className="student-profile-wrapper" aria-label="Student Profile View">

      {loadingPermissions && (
        <div className="staffStudentProfile-spinner-overlay" role="status" aria-live="polite">
          <div className="staffStudentProfile-spinner" />   Refreshing permissions
        </div>
      )}

      {view === 'studentDetails' && selectedStudent && (
        <div className="staff-student-details-container">
        <div className="student-profile-card">
          <h2 ref={headingRef} className="student-profile-heading">{selectedStudent.student_name}'s Profile</h2>
          
          {userPermissions?.student_case_information && (

          <button className="staffDash-cancel-btn" aria-label="View/Edit Student Info" onClick={() => setActiveModal({ type: 'studentInfo' })}>
            View / Edit Student Info
          </button>
          )}
          
      {activeModal?.type === 'studentInfo' && (
        <div className="staffDash-modalOverlay">
          <div  className="staffDash-modalContent">
            <div className="staffDash-modalHeader ">
              <h2>{selectedStudent?.student_name}'s Information</h2>
              <button 
                aria-label="close student profile menu"
                className="staffDash-modalHeaderCloseBtn "
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
                    aria_label="Cancel edit / go back to students profile and update information"
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
                  aria-label="edit profile"
                  role="button"
                  data-testid="editProfileBtn"
                >
                  <FontAwesomeIcon icon={faPenToSquare} aria-hidden="true" /> Edit Profile
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
            View Submitted Forms
          </button>
        
        {userPermissions?.accomodation_modules && (
          <button
            onClick={async () => {
              setIsRefreshing(true);
              await new Promise(resolve => setTimeout(resolve, 500));
              setIsRefreshing(false);
              setActiveModal({ type: 'accommodations' });
            }}
            aria-label="View student accommodations"
          >
            View Accommodations
          </button>
        )}

        {userPermissions?.assistive_technology_modules && (
          <button
            onClick={async () => {
              setIsRefreshing(true);
              await new Promise(resolve => setTimeout(resolve, 500));
              setIsRefreshing(false);
              setActiveModal({ type: 'tech' });
            }}
            aria-label="View assistive technology"
          >
            View Assistive Tech
          </button>
        )}
      
      </div>
      </div>
      
      
      
      )}

        {activeModal?.type === 'formStatus' && (
        <div
            className="staffDash-modalOverlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-info-title"
            >
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
                <button data-testid="updateFormStatusBtn" ref={lastFocusedRef} aria_label="Save" onClick={() => handleFormStatusChange(activeModal.form.id, formEdits[activeModal.form.id] || activeModal.form.status)}>
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
            <h2 ref={modalTopRef} tabIndex={-1}>Submitted Forms</h2>
            <button className="staffDash-modalHeaderCloseBtn" aria-label="close forms menu" onClick={() => {setActiveModal(null); setIsEditing(false)}}>✕</button>
            </div>
                {submittedForms.length > 0 ? (
                submittedForms.map(form => (
                    <section
                key={form.id}
                className="staffDash-form-entry"
                role="region"
            aria-labelledby={`form-heading-${form.id}`}
                >
                <h3 id={`form-heading-${form.id}`}>
                    {formatFormType(form.type)}
                </h3>

                <p ><strong>Status:</strong> {form.status}</p>
                <p >
                    <strong>Submitted:</strong>{' '}
                    {form.submittedDate
                    ? new Date(form.submittedDate).toLocaleDateString()
                    : 'N/A'}
                </p>
                <p><strong>Due:</strong> {form.dueDate ? new Date(form.dueDate).toLocaleDateString() : 'N/A'}</p>

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
                    aria-label={`Change status for ${formatFormType(form.type)} form, current status: ${form.status}`}
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
                    <FontAwesomeIcon icon={faFloppyDisk} aria-hidden="true" /> Save
                </button>
                
                </section>

                ))
            ) : (
                <p>No forms submitted.</p>
            )}
            <button
                className="backToTop"
                onClick={() => {
                modalTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                setTimeout(() => {
                    modalTopRef.current?.focus();
                }, 400);
                }}
                aria-label="Back to top of modal"
            >
                Back to Top
            </button>
            </div>
        </div>
        )}

        {activeModal?.type === 'accommodations' && (
          <div className="staffDash-modalOverlay">
            <div className="staffDash-modalContent">
              <div className="staffDash-modalHeader">
                <h2 ref={modalTopRef} tabIndex={-1}>Accommodations</h2>
                <button
                  className="staffDash-modalHeaderCloseBtn"
                  aria-label="close accommodations menu"
                  data-testid="closeStaffDashModal"
                  onClick={() => setActiveModal(null)}
                >✕</button>
              </div>

              {selectedStudent.accommodations?.length > 0 ? (
                selectedStudent.accommodations.map((acc, index) => {
                  const notesOpen = expandedAccNotes === acc.id;

                  return (
                    <section key={acc.id} className="staffDash-accommodation-entry">
                      <label htmlFor={`type-${acc.id}`}><strong>Type:</strong></label>
                      <input
                        id={`type-${acc.id}`}
                        type="text"
                        value={editedAccommodations[acc.id]?.type ?? acc.type}
                        onChange={(e) =>
                          setEditedAccommodations((prev) => ({
                            ...prev,
                            [acc.id]: { ...(prev[acc.id] || {}), type: e.target.value },
                          }))
                        }
                      />

                      <label htmlFor={`status-${acc.id}`}><strong>Status:</strong></label>
                      <select
                        id={`status-${acc.id}`}
                        value={editedAccommodations[acc.id]?.status ?? acc.status}
                        onChange={(e) =>
                          setEditedAccommodations((prev) => ({
                            ...prev,
                            [acc.id]: { ...(prev[acc.id] || {}), status: e.target.value },
                          }))
                        }
                      >
                        <option value="APPROVED">Approved</option>
                        <option value="DENIED">Denied</option>
                        <option value="PENDING">Pending</option>
                        <option value="OVERDUE">Overdue</option>
                      </select>

                      <label htmlFor={`date-${acc.id}`}><strong>Requested On:</strong></label>
                      <input
                        id={`date-${acc.id}`}
                        type="date"
                        value={
                          editedAccommodations[acc.id]?.date_requested ??
                          acc.date_requested?.split("T")[0]
                        }
                        onChange={(e) =>
                          setEditedAccommodations((prev) => ({
                            ...prev,
                            [acc.id]: {
                              ...(prev[acc.id] || {}),
                              date_requested: e.target.value,
                            },
                          }))
                        }
                      />

                      {/* Notes dropdown toggle */}
                      <button
                        type="button"
                        className="staffDash-notes-toggle"
                        onClick={() =>
                          setExpandedAccNotes(prev => (prev === acc.id ? null : acc.id))
                        }
                        aria-expanded={notesOpen}
                        aria-controls={`acc-notes-${acc.id}`}
                      >
                        {notesOpen ? "Hide Notes ▲" : "Show Notes ▼"}
                      </button>

                      {notesOpen && (
                        <div
                          id={`acc-notes-${acc.id}`}
                          className="staffDash-notes-box"
                          role="region"
                          aria-labelledby={`acc-notes-heading-${acc.id}`}
                          tabIndex={-1}
                        >
                          {/* Region Heading for screen readers */}
                          <h4 id={`acc-notes-heading-${acc.id}`} className="sr-only">
                            Notes section for {acc.type} accommodation
                          </h4>

                          {/* PREVIOUS NOTES (read-only) */}
                          <div>
                            <p className="staffDash-notes-label" id={`prev-notes-label-${acc.id}`}>
                              <strong><FontAwesomeIcon icon={faClockRotateLeft} aria-hidden="true" /> Previous Notes:</strong>
                            </p>
                            <p
                              className="staffDash-previous-notes"
                              role="document"
                              aria-labelledby={`prev-notes-label-${acc.id}`}
                            >
                              {acc.notes ? acc.notes : <em>No notes provided.</em>}
                            </p>
                          </div>

                          {/* EDITABLE NOTES FIELD */}
                          <div>
                            <label
                              htmlFor={`notes-${acc.id}`}
                              className="staffDash-notes-input-label"
                            >
                              <FontAwesomeIcon icon={faPenToSquare} aria-hidden="true" /> Edit Notes
                            </label>
                            <textarea
                              id={`notes-${acc.id}`}
                              value={editedAccommodations[acc.id]?.notes ?? acc.notes ?? ""}
                              onChange={(e) =>
                                setEditedAccommodations((prev) => ({
                                  ...prev,
                                  [acc.id]: {
                                    ...(prev[acc.id] || {}),
                                    notes: e.target.value,
                                  },
                                }))
                              }
                              className="staffDash-notes-textarea"
                              rows={4}
                              aria-describedby={`notes-desc-${acc.id}`}
                              aria-label={`Edit notes for ${acc.type} accommodation`}
                              placeholder="Enter updated notes here..."
                            />
                            <p id={`notes-desc-${acc.id}`} className="sr-only">
                              Text area to edit the notes for this accommodation.
                            </p>
                          </div>
                        </div>
                      )}
                      <button
                        className="staffDash-save-btn"
                        onClick={() => confirmAndSaveAccommodation(acc.id)}
                        aria-label={`Save changes to ${acc.type} accommodation`}
                        >
                          <FontAwesomeIcon icon={faFloppyDisk} aria-hidden="true" /> Save
                        </button>
                        <button
                className="backToTop"
                onClick={() => {
                  modalTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  setTimeout(() => {
                    modalTopRef.current?.focus();
                  }, 400);
                }}
                aria-label="Back to top of modal"
              >
                Back to Top
              </button> 
                    </section>
                  );
                })
              ) : (
                <p>No accommodations available.</p>
              )}
            </div>
          </div>
        )}

        {activeModal?.type === 'tech' && (
          <div className="staffDash-modalOverlay">
            <div className="staffDash-modalContent">
              <div className="staffDash-modalHeader">
                <h2 ref={modalTopRef} tabIndex={-1}>Assistive Technologies</h2>
                <button
                  className="staffDash-modalHeaderCloseBtn"
                  aria-label="close assistive technologies menu"
                  onClick={() => setActiveModal(null)}
                >
                  ✕
                </button>
              </div>

              {selectedStudent.assistive_technologies?.length > 0 ? (
                selectedStudent.assistive_technologies.map(tech => (
                  <section
                    key={tech.id}
                    className="staffDash-assistive-tech-entry"
                    role="region"
                    aria-labelledby={`assistive-tech-heading-${tech.id}`}
                  >
                    <h3 id={`assistive-tech-heading-${tech.id}`}>
                      {tech.type}
                    </h3>

                    <label htmlFor={`type-${tech.id}`}>Edit Type:</label>
                    <input
                      id={`type-${tech.id}`}
                      type="text"
                      defaultValue={tech.type}
                      onChange={(e) =>
                        setAssistiveTechEdits((prev) => ({
                          ...prev,
                          [tech.id]: {
                            ...prev[tech.id],
                            type: e.target.value
                          }
                        }))
                      }
                      aria-label={`Edit type for assistive technology ${tech.type}`}
                    />

                    <label htmlFor={`available-${tech.id}`}>Available:</label>
                    <select
                      id={`available-${tech.id}`}
                      defaultValue={tech.available ? "true" : "false"}
                      onChange={(e) =>
                        setAssistiveTechEdits((prev) => ({
                          ...prev,
                          [tech.id]: {
                            ...prev[tech.id],
                            available: e.target.value === "true"
                          }
                        }))
                      }
                      aria-label={`Change availability for ${tech.type}`}
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>

                    <button
                      onClick={() => confirmAndSaveTech(tech.id)}
                      className="staffDash-save-btn"
                      data-testid="staffDash-save-btn"
                      aria-label={`Save changes to assistive tech: ${tech.type}`}
                    >
                      <FontAwesomeIcon icon={faFloppyDisk} aria-hidden="true" /> Save
                    </button>
                  </section>
                ))
              ) : (
                <p>No assistive technology assigned.</p>
              )}

              <button
                className="backToTop"
                onClick={() => {
                  modalTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  setTimeout(() => {
                    modalTopRef.current?.focus();
                  }, 400);
                }}
                aria-label="Back to top of modal"
              >
                Back to Top
              </button>
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

    </main>
  );
}

export default StaffStudentProfile;
