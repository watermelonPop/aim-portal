import React, { useEffect, useState, useRef } from 'react';
import './StudentTesting.css';

// Predefined accommodation options
const ACCOMMODATION_OPTIONS = [
  "Extended Time",
  "Alternative Format Materials",
  "Accessible Seating",
  "Reduced Distraction Testing Environment",
  "Use of Assistive Technology"
];

function StudentTesting({ userInfo, displayHeaderRef, settingsTabOpen, lastIntendedFocusRef }) {
  const localRef = useRef(null);
  // Use provided header ref or fallback to local
  const headingRef = displayHeaderRef || localRef;

  // Header focus management
  useEffect(() => {
    if (!headingRef.current || settingsTabOpen === true) return;
    if (lastIntendedFocusRef?.current !== headingRef.current) {
      lastIntendedFocusRef.current = headingRef.current;
    }
  }, [settingsTabOpen, headingRef, lastIntendedFocusRef]);

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
  }, [settingsTabOpen, headingRef, lastIntendedFocusRef]);

  // States for exam data
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [submittedExams, setSubmittedExams] = useState([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(false);
  const [loadingSubmitted, setLoadingSubmitted] = useState(false);
  const [errorUpcoming, setErrorUpcoming] = useState('');
  const [errorSubmitted, setErrorSubmitted] = useState('');

  // Modal and accommodation state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedAccommodation, setSelectedAccommodation] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const modalRef = useRef(null);

  // Fetch upcoming exams via /api/getStudentUpcomingExams
  useEffect(() => {
    if (!userInfo?.id) return;
    setLoadingUpcoming(true);
    fetch(`/api/getStudentUpcomingExams?userId=${userInfo.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch upcoming exams');
        return res.json();
      })
      .then(data => {
        setUpcomingExams(data);
      })
      .catch(err => {
        console.error(err);
        setErrorUpcoming(err.message);
      })
      .finally(() => setLoadingUpcoming(false));
  }, [userInfo]);

  // Fetch submitted exams via /api/getStudentSubmittedExams
  useEffect(() => {
    if (!userInfo?.id) return;
    setLoadingSubmitted(true);
    fetch(`/api/getStudentSubmittedExams?userId=${userInfo.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch submitted exams');
        return res.json();
      })
      .then(data => {
        setSubmittedExams(data);
      })
      .catch(err => {
        console.error(err);
        setErrorSubmitted(err.message);
      })
      .finally(() => setLoadingSubmitted(false));
  }, [userInfo]);

  // Move focus to modal when it opens
  useEffect(() => {
    if (isModalOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isModalOpen]);

  // Modal keyboard navigation (including exam details, select, and buttons)
  const handleModalKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsModalOpen(false);
      setSelectedExam(null);
    } else if (e.key === 'Tab') {
      const focusableElements = modalRef.current.querySelectorAll('p, select, button');
      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }
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
    }
  };

  // Open the accommodation modal for a selected exam
  const openAccommodationModal = (exam) => {
    setSelectedExam(exam);
    setSelectedAccommodation('');
    setUploadedFile(null);
    setIsModalOpen(true);
  };

  // Handle submission of accommodation request and file upload
  const handleAccommodationSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAccommodation) {
      alert("Please select an accommodation option.");
      return;
    }
    // Create the accommodation request payload
    const accommodationPayload = {
      examId: selectedExam.id,
      accommodationType: selectedAccommodation,
      note: `Requesting ${selectedAccommodation} for exam "${selectedExam.name}" in course "${selectedExam.courseName}"`,
      studentId: userInfo.id,
    };

    try {
      // Create accommodation request
      const res1 = await fetch('/api/applyForExamAccommodations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accommodationPayload),
      });
      if (!res1.ok) {
        alert("Failed to submit accommodation request.");
        return;
      }

      // If a file is uploaded, submit it as a form (using the same logic as studentForms)
      if (uploadedFile) {
        const formData = new FormData();
        formData.append("file", uploadedFile);
        formData.append("type", "TESTING_ACCOMMODATION");
        formData.append("formName", `Supporting Document for ${selectedExam.name}`);
        formData.append("userId", userInfo.id);
        // Optionally, append dueDate or other fields if needed

        const res2 = await fetch('/api/uploadForm', {
          method: 'POST',
          body: formData,
        });
        if (!res2.ok) {
          alert("Accommodation request submitted but file upload failed.");
          // You could choose to return here or continue.
        }
      }

      alert("Accommodation request submitted successfully.");
      // Update upcoming exams to mark this exam as pending
      setUpcomingExams(prev =>
        prev.map((exam) =>
          exam.id === selectedExam.id
            ? { ...exam, accommodations: [selectedAccommodation] }
            : exam
        )
      );
      setIsModalOpen(false);
      setSelectedExam(null);
      setUploadedFile(null);
    } catch (error) {
      console.error("Error submitting accommodation request:", error);
      alert("Error submitting accommodation request.");
    }
  };

  return (
    <div className="studentTesting" role="main">
      <h2 ref={headingRef} tabIndex={0} className="dashboardTitle">STUDENT TESTING</h2>
      
      {/* Upcoming Exams Section */}
      <section className="upcomingExams">
        <h3>Upcoming Exams</h3>
        {loadingUpcoming ? (
          <p>Loading upcoming exams...</p>
        ) : errorUpcoming ? (
          <p style={{ color: 'red' }}>{errorUpcoming}</p>
        ) : upcomingExams.length === 0 ? (
          <p>No upcoming exams available.</p>
        ) : (
          <ul>
            {upcomingExams.map((exam) => (
              <li key={exam.id} className="examItem">
                {/* Focusable exam details container */}
                <div
                  className="examDetails"
                  tabIndex={0}
                  aria-label={`${exam.name}, scheduled on ${new Date(exam.date).toLocaleDateString()} at ${exam.location} for course ${exam.courseName}`}
                >
                  <strong>{exam.name}</strong> - {new Date(exam.date).toLocaleDateString()} at {exam.location} (Course: {exam.courseName})
                </div>
                {exam.accommodations && exam.accommodations.length > 0 ? (
                  <span className="pendingStatus" aria-live="polite">Request Pending</span>
                ) : (
                  <button
                    onClick={() => openAccommodationModal(exam)}
                    aria-label={`Apply for accommodation for ${exam.name}`}
                  >
                    Apply for Accommodation
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Submitted Exams Section */}
      <section className="submittedExams">
        <h3>Submitted Exams</h3>
        {loadingSubmitted ? (
          <p>Loading submitted exams...</p>
        ) : errorSubmitted ? (
          <p style={{ color: 'red' }}>{errorSubmitted}</p>
        ) : submittedExams.length === 0 ? (
          <p>No submitted exams found.</p>
        ) : (
          <ul>
            {submittedExams.map((exam) => (
              <li key={exam.id} className="examItem">
                <div
                  className="examDetails"
                  tabIndex={0}
                  aria-label={`Submitted exam ${exam.name}, scheduled on ${new Date(exam.date).toLocaleDateString()} for course ${exam.courseName}`}
                >
                  <strong>{exam.name}</strong> - {new Date(exam.date).toLocaleDateString()} (Course: {exam.courseName})
                </div>
                <button
                  onClick={() => window.open(exam.completedExamURL, '_blank', 'noopener,noreferrer')}
                  aria-label={`View submitted exam ${exam.name}`}
                >
                  View Submitted Exam
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Accommodation Application Modal */}
      {isModalOpen && (
        <div
          className="modalOverlay"
          onClick={() => { setIsModalOpen(false); setSelectedExam(null); }}
          role="presentation"
        >
          <div
            className="modalContent"
            role="dialog"
            aria-modal="true"
            aria-labelledby="accommodation-modal-heading"
            tabIndex={0}
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleModalKeyDown}
          >
            <h2 id="accommodation-modal-heading">Apply for Accommodation</h2>
            {selectedExam && (
              <p tabIndex={0} className="modalExamDetails">
                {selectedExam.name} - {new Date(selectedExam.date).toLocaleDateString()}
              </p>
            )}
            <form onSubmit={handleAccommodationSubmit}>
              <label htmlFor="accommodationSelect">Select Accommodation:</label>
              <select
                id="accommodationSelect"
                value={selectedAccommodation}
                onChange={(e) => setSelectedAccommodation(e.target.value)}
                required
              >
                <option value="" disabled>-- Select an option --</option>
                {ACCOMMODATION_OPTIONS.map((option, index) => (
                  <option key={index} value={option}>{option}</option>
                ))}
              </select>

              {/* New section for uploading a supporting form */}
              <label htmlFor="supportingFormUpload">Upload Supporting Form (optional):</label>
              <input
                type="file"
                id="supportingFormUpload"
                accept="application/pdf"
                onChange={(e) => setUploadedFile(e.target.files[0])}
              />
              {uploadedFile && (
                <p tabIndex={0} aria-label={`File selected: ${uploadedFile.name}`}>Selected File: {uploadedFile.name}</p>
              )}

              <div className="modalButtons">
                <button type="submit">Submit Request</button>
                <button type="button" onClick={() => { setIsModalOpen(false); setSelectedExam(null); }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentTesting;
