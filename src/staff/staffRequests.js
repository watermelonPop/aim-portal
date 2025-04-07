import React, { useEffect, useState, useRef  } from 'react';



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
    <main className="staff-requests-wrapper" aria-label="Staff Requests View" tabIndex="0">
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
          <div className="fullscreen-message-content" tabIndex="0">
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
        <section className="loading-container" aria-label="Loading" aria-busy="true" aria-live="polite" tabIndex="0">
          <div className="staffDash-loading-spinner" role="status" aria-label="Loading spinner" />
          <p>Loading Requests...</p>
        </section>
      ) : selectedRequest ? (
        <section className="request-details-card" aria-labelledby="request-details-heading">
          <h2
            id="request-details-heading"
            className="card-title"
            ref={headingRef}
            tabIndex={0}
          >
            📌 {selectedRequest.student_name}'s Request Details
          </h2>
          <details className="request-meta-dropdown">
            <summary className="meta-toggle">Toggle Request Metadata</summary>
            <div className="request-meta-grid">
              <div tabIndex="0"><strong>Request ID:</strong> {selectedRequest.id}</div>
              <div tabIndex="0"><strong>User ID:</strong> {selectedRequest.userId}</div>
              <div tabIndex="0"><strong>Advisor ID:</strong> {selectedRequest.advisorId}</div>
              <div tabIndex="0"><strong>Advisor Role:</strong> {selectedRequest.advisorRole || "N/A"}</div>
            </div>
          </details>

          <div className="status-control-centered">
            <label htmlFor="status-select"><strong>Status:</strong></label>
            <select
              id="status-select"
              value={editedRequests[selectedRequest.id] || selectedRequest.status || "PENDING"}
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
              💾
            </button>
          </div>

          <div className="request-notes" aria-label="Request Notes" tabIndex="0">
            <strong>Notes:</strong>
            <p tabIndex={0} aria-label={`${selectedRequest.notes}`}>{selectedRequest.notes || "N/A"}</p>
          </div>

          <div className="request-docs" aria-label={`Documentation provided? ${selectedRequest.documentation ? "Yes" : "No"}`} tabIndex="0">
            <strong>Documentation:</strong>
            <span
              className={`doc-badge ${selectedRequest.documentation ? "yes" : "no"}`}
              role="status"
            >
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
            aria-expanded={expandedRequest === selectedRequest.id}
            aria-controls="student-info-section"
          >
            {expandedRequest === selectedRequest.id ? "Hide Student Info" : "Show Student Info"}
          </button>

          {expandedRequest === selectedRequest.id && (
            <div id="student-info-section" className="student-info-box" aria-label="Student Information" tabIndex="0">
              <h3>🎓 Student Info</h3>
              <p tabIndex="0"><strong>Name:</strong> {selectedRequest.student_name || "N/A"}</p>
              <p aria-label="Date of Birth"tabIndex="0"><strong>DOB:</strong> {selectedRequest.dob ? new Date(selectedRequest.dob).toLocaleDateString() : "N/A"}</p>
              <p tabIndex="0"><strong>UIN:</strong> {selectedRequest.UIN || "N/A"}</p>
              <p tabIndex="0"><strong>Phone Number:</strong> {selectedRequest.phone_number || "N/A"}</p>
            </div>
          )}
          <button
            className="back-to-top-button"
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
            ⬆ Back to Top
          </button>
        </section>
        
      ) : (
        <section aria-label="Request Search Results" tabIndex="0">
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
                  tabIndex="0"
                  role="listitem"
                  aria-label={`Request from ${request.student_name || "unknown student"}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedRequest(request);
                    }
                  }}
                >
                  <p className="student-name" tabIndex="0">{request.student_name || "N/A"}</p>
                  <p className="student-uin" tabIndex="0">UIN: {request.UIN || "N/A"}</p>
                </div>
              ))}
          </div>

          <nav className="pagination-controls" role="navigation" aria-label="Request Pagination" tabIndex="0">
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
