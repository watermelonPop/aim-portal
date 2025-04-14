import React, { useEffect, useState, useRef  } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faFloppyDisk, faCheck, faX, faGraduationCap} from '@fortawesome/free-solid-svg-icons';


function StaffRequests(
  {
  selectedRequest,
  setSelectedRequest,
  currentPage,
  setCurrentPage,
  filteredRequests,
  setFilteredRequests,
  editedRequests,
  setEditedRequests,
  loadingRequests,
  searchTerm,
  setSearchTerm,
  expandedRequest,
  setExpandedRequest,
  confirmAndSaveRequestStatus,
  totalPages,
  fullscreenMessage,
  setFullscreenMessage,

}) {
  const headingRef = useRef(null);
  const [updatingRequestId, setUpdatingRequestId] = useState(null);

  

  return (
    <main className="staff-requests-wrapper" aria-label="Staff Requests View">
      {updatingRequestId && (
        <div
          className="fullscreen-loading-overlay"
          role="alert"
          aria-live="assertive"
          aria-label="Updating request status, please wait"
        >
          <div className="loading-spinner" aria-hidden="true" />
          <p className="visually-hidden">Updating request status, please wait</p>
        </div>
      )}
      {fullscreenMessage && (
        <div 
          className="fullscreen-message-overlay" 
          tabIndex="-1"
          role="alertdialog"
          aria-labelledby="fullscreen-message-title"
          aria-describedby="fullscreen-message-desc"
        >
          <div className="fullscreen-message-content">
            <button
              className="fullscreen-message-close-btn"
              onClick={() => setFullscreenMessage(null)}
              aria-label="Close message"
            >
              &times;
            </button>

            <h2 id="fullscreen-message-title">{fullscreenMessage.title}</h2>
            <p id="fullscreen-message-desc">{fullscreenMessage.message}</p>

            {fullscreenMessage.confirm ? (
              <>
                <button
                  className="fullscreen-message-button"
                  onClick={() => {
                    fullscreenMessage.confirm();
                    setFullscreenMessage(null);
                  }}
                >
                  Confirm
                </button>
                <button
                  className="fullscreen-message-button"
                  onClick={() => setFullscreenMessage(null)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                className="fullscreen-message-button"
                onClick={() => setFullscreenMessage(null)}
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}

      {loadingRequests ? (
        <div className="spinnerClassItem" role="status" aria-label="Loading, please wait">
        <div className="spinner-iconClassItem" aria-hidden="true"></div>
        <h3 className="spinner-textClassItem">Loading...</h3>
        </div>
      ) : selectedRequest ? (
        <section className="request-details-card" aria-labelledby="request-details-heading">
          <h2
            id="request-details-heading"
            className="card-title"
            ref={headingRef}
          >
            {selectedRequest.student_name}'s Request Details
          </h2>
          <details className="request-meta-dropdown">
            <summary className="meta-toggle">Toggle Request Metadata</summary>
            <div className="request-meta-grid">
              <div><strong>Request ID:</strong> {selectedRequest.id}</div>
              <div><strong>User ID:</strong> {selectedRequest.userId}</div>
              <div><strong>Advisor ID:</strong> {selectedRequest.advisorId}</div>
              <div><strong>Advisor Role:</strong> {selectedRequest.advisorRole || "N/A"}</div>
            </div>
          </details>

          <div className="status-control-centered">
            <label htmlFor="status-select"><strong>Status:</strong></label>
            <select
              id="status-select"
              value={selectedRequest.status}
              onChange={(e) =>
                setEditedRequests((prev) => ({
                  ...prev,
                  [selectedRequest.id]: e.target.value,
                }))
              }
              aria-label={`Update status for request, current status is`}
            >
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="DENIED">Denied</option>
            </select>

            <button
              className="save-icon-button"
              onClick={() => confirmAndSaveRequestStatus(selectedRequest.id)}
              title="Save status change"
              aria-label="Save status change"
            >
              <FontAwesomeIcon icon={faFloppyDisk} aria-hidden="true" />
            </button>
          </div>

          <div className="request-notes" aria-label="Request Notes">
            <strong>Notes:</strong>
            <p aria-label={`${selectedRequest.notes}`}>{selectedRequest.notes || "N/A"}</p>
          </div>

          <div className="request-docs" aria-label={`Documentation provided? ${selectedRequest.documentation ? "Yes" : "No"}`} >
            <strong>Documentation:</strong>
            <p
              className={`doc-badge ${selectedRequest.documentation ? "yes" : "no"}`}
              role="status"
            >
              {selectedRequest.documentation ? (
      <>
        <FontAwesomeIcon icon={faCheck} aria-hidden="true" /> Yes
      </>
    ) : (
      <>
        <FontAwesomeIcon icon={faX} aria-hidden="true" /> No
      </>
    )}
            </p>
          </div>



          <button
            className="expand-button"
            onClick={() =>
              setExpandedRequest(
                expandedRequest === selectedRequest.id ? null : selectedRequest.id
              )
            }
            aria-expanded={expandedRequest === selectedRequest.id}
            aria-controls="student-info-section"
          >
            {expandedRequest === selectedRequest.id ? "Hide Student Info" : "Show Student Info"}
          </button>

          {expandedRequest === selectedRequest.id && (
            <div id="student-info-section" className="student-info-box" aria-label="Student Information">
              <h3><FontAwesomeIcon icon={faGraduationCap} aria-hidden="true" /> Student Info</h3>
              <p><strong>Name:</strong> {selectedRequest.student_name || "N/A"}</p>
              <p aria-label="Date of Birth"><strong>DOB:</strong> {selectedRequest.dob ? new Date(selectedRequest.dob).toLocaleDateString() : "N/A"}</p>
              <p><strong>UIN:</strong> {selectedRequest.UIN || "N/A"}</p>
              <p><strong>Phone Number:</strong> {selectedRequest.phone_number || "N/A"}</p>
            </div>
          )}
          <button
            className="backToTop"
            onClick={() => {
              // Smooth scroll to the top of the page
              window.scrollTo({ top: 0, behavior: "smooth" });

              // After a short delay, focus the heading to help screen reader users
              setTimeout(() => {
                headingRef.current?.focus();
              }, 400); // Adjust this if needed
            }}
            aria-label="Back to top of request details"
          >
            Back to Top
          </button>
        </section>
        
      ) : (
        <section aria-label="Request Search Results">
          <label htmlFor="request-search" className="sr-only">Search by UIN</label>
          <input
            id="request-search"
            type="text"
            placeholder="Search by name or UIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="staffDash-search-bar"
            aria-label="Search requests by UIN"
          />

          <div className="requests-container" role="list" aria-label="Request List">
            {filteredRequests
              .slice((currentPage - 1) * 10, currentPage * 10)
              .map((request) => (
                <div
                  className="request-tile"
                  key={request.id}
                  onClick={() => setSelectedRequest(request)}
                  role="listitem"
                  aria-label={`Request from ${request.student_name || "unknown student"}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedRequest(request);
                    }
                  }}
                  tabIndex={0}
                >
                  <p className="student-name">{request.student_name || "N/A"}</p>
                  <p className="student-uin">UIN: {request.UIN || "N/A"}</p>
                </div>
              ))}
          </div>

          <nav className="pagination-controls" role="navigation" aria-label="Request Pagination" >
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="pagination-btn"
              aria-label="Previous page"
            >
              ← Previous
            </button>
            <span aria-live="polite">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="pagination-btn"
              aria-label="Next page"
            >
              Next →
            </button>
          </nav>
        </section>
      )}
    </main>
  );
}

export default StaffRequests;
