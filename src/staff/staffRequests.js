import React, { useEffect, useState } from 'react';


function StaffRequests({
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
    }) {


return (
    <>
          {loadingRequests ? (
            <div className="loading-container">
              <div className="staffDash-loading-spinner"></div>
              <p>Loading Requests...</p>
            </div>
          ) : selectedRequest ? (
            <div className="request-details-card">
        <h2 className="card-title">📌 {selectedRequest.student_name}'s Request Details</h2>
      
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
          aria-expanded="true/false" aria-controls="section-id"
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
                className="staffDash-search-bar"
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
      </>
);
}

export default StaffRequests;
