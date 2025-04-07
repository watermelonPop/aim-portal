import { useEffect, useState, useRef } from 'react';

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
}) {
  const localRef = useRef(null);
  const headingRef = displayHeaderRef || localRef;

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
    <main className="student-profile-wrapper" aria-label="Student Profile View" tabIndex={0}>
      <h2 className="dashboardTitle" ref={headingRef} tabIndex={0}>
        {selectedStudent?.student_name || 'Selected Student'}
      </h2>

      {view === 'studentDetails' && selectedStudent && (
        <div className="staff-student-details-container">
        <div className="student-profile-card">
          <h2 className="student-profile-heading">{selectedStudent.student_name}'s Profile</h2>
          
          <button className="staffDash-cancel-btn" tabIndex={0} aria-label="View/Edit Student Info" onClick={() => setActiveModal({ type: 'studentInfo' })}>
            View / Edit Student Info
          </button>
          
      {activeModal?.type === 'studentInfo' && (
        <div className="staffDash-modalOverlay">
          <div  tabIndex={0} className="staffDash-modalContent">
            <div className="staffDash-modalHeader ">
              <h2>{selectedStudent?.student_name}'s Information</h2>
              <button 
                aria-label="close student profile menu"
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
            <div  tabIndex={0} className="staffDash-modalContent">
            <div className="staffDash-modalHeader ">
            <h2 ref={modalTopRef} tabIndex={-1}>Submitted Forms</h2>
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
                    💾 Save
                </button>
                
                </section>

                ))
            ) : (
                <p>No forms submitted.</p>
            )}
            <button
                className="back-to-top-button"
                onClick={() => {
                modalTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                setTimeout(() => {
                    modalTopRef.current?.focus();
                }, 400);
                }}
                aria-label="Back to top of modal"
            >
                ⬆ Back to Top
            </button>
            </div>
        </div>
        )}

        {activeModal?.type === 'accommodations' && (
        <div className="staffDash-modalOverlay">
            <div tabIndex={0} className="staffDash-modalContent">
            <div className="staffDash-modalHeader ">
            <h2 ref={modalTopRef} tabIndex={-1}>Accomodations</h2>
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
            <button
                className="back-to-top-button"
                onClick={() => {
                modalTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                setTimeout(() => {
                    modalTopRef.current?.focus();
                }, 400);
                }}
                aria-label="Back to top of modal"
            >
                ⬆ Back to Top
            </button>
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
            <button
                className="back-to-top-button"
                onClick={() => {
                modalTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                setTimeout(() => {
                    modalTopRef.current?.focus();
                }, 400);
                }}
                aria-label="Back to top of modal"
            >
                ⬆ Back to Top
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
