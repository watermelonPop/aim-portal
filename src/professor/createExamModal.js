import React, { useEffect, useRef, useState } from 'react';

function CreateExamModal({ course, students, isOpen, onClose, returnFocusRef, addExamToStudent }) {
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examLocation, setExamLocation] = useState('');
  const [examFile, setExamFile] = useState(null);
  const [selectedAccommodations, setSelectedAccommodations] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [accommodationDropdownOpen, setAccommodationDropdownOpen] = useState(false);

  const modalRef = useRef(null);
  const headingRef = useRef(null);

  const accommodationsList = [
    "Extended Time",
    "Alternative Format Materials",
    "Accessible Seating",
    "Reduced Distraction Testing Environment",
    "Use of Assistive Technology",
    "Interpreter Services",
    "Audio/Visual Aids"
  ];

  const handleFileChange = (e) => {
    setExamFile(e.target.files[0]);
  };

  const handleStudentSelection = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => Number(option.value));
    setSelectedStudents(selectedOptions);
  };

  const handleDropdownToggle = () => {
    setDropdownOpen(prev => !prev);
  };

  const handleAccommodationDropdownToggle = () => {
    setAccommodationDropdownOpen(prev => !prev);
  };

  const handleAccommodationSelection = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
    setSelectedAccommodations(selectedOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", examName);
    formData.append("date", examDate);
    formData.append("location", examLocation);
    formData.append("file", examFile);
    formData.append("accommodations", JSON.stringify(selectedAccommodations));
    formData.append("studentIds", selectedStudents);
    formData.append("courseId", course.id);

    try {
      const response = await fetch("/api/createExam", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const newExams = await response.json();

        newExams.forEach((exam) => {
          addExamToStudent(course.id, exam);
        });

        onClose();
      } else {
        console.error("Failed to create exam");
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        headingRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const modalEl = modalRef.current;
    const focusableEls = modalEl.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstEl = focusableEls[0];
    const lastEl = focusableEls[focusableEls.length - 1];

    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };

    modalEl.addEventListener('keydown', handleKeyDown);
    return () => modalEl.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen && returnFocusRef?.current) {
      try {
        returnFocusRef.current.focus();
      } catch (e) {
        console.warn("returnFocusRef not available:", e);
      }
    }
  }, [isOpen, returnFocusRef]);

  if (!isOpen) return null;

  return (
    <div className="examModalBackdrop" role="presentation" onClick={onClose}>
      <div
        className="examModalContent"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-heading"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modal-heading" tabIndex={-1} ref={headingRef}>
          Create New Exam for {course.name}
        </h2>
        <form onSubmit={handleSubmit} aria-describedby="form-instructions">
          <p id="form-instructions" className="sr-only">Complete all required fields to create a new exam</p>

          <div>
            <label htmlFor="examName">Exam Name:</label>
            <input id="examName" type="text" value={examName} onChange={(e) => setExamName(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="examDate">Exam Date:</label>
            <input id="examDate" type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="examLocation">Location:</label>
            <input id="examLocation" type="text" value={examLocation} onChange={(e) => setExamLocation(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="examFile">Upload Exam File:</label>
            <input id="examFile" type="file" onChange={handleFileChange} required />
          </div>

          <div>
            <label htmlFor="accommodationSelect">Select Accommodations:</label>
            <div className="student-dropdown">
              <button
                type="button"
                className="examDropdownButton"
                onClick={handleAccommodationDropdownToggle}
                aria-expanded={accommodationDropdownOpen}
                aria-controls="accommodationSelect"
              >
                {selectedAccommodations.length > 0
                  ? `Selected ${selectedAccommodations.length} accommodation(s)`
                  : 'Select Accommodations'}
              </button>
              {accommodationDropdownOpen && (
                <select
                  id="accommodationSelect"
                  multiple
                  value={selectedAccommodations}
                  onChange={handleAccommodationSelection}
                  className="student-dropdown-list"
                >
                  {accommodationsList.map((acc, i) => (
                    <option key={i} value={acc}>{acc}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="studentSelect">Select Students:</label>
            <div className="student-dropdown">
              <button
                type="button"
                className="examDropdownButton"
                onClick={handleDropdownToggle}
                aria-expanded={dropdownOpen}
                aria-controls="studentSelect"
              >
                {selectedStudents.length > 0
                  ? `Selected ${selectedStudents.length} student(s)`
                  : 'Select Students'}
              </button>
              {dropdownOpen && (
                <select
                  id="studentSelect"
                  multiple
                  value={selectedStudents}
                  onChange={handleStudentSelection}
                  className="student-dropdown-list"
                >
                  {students.map((student) => (
                    <option key={student.userId} value={student.userId}>
                      {student.account.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="modalButtons">
            <button className="examModalButton" type="submit">Create Exam</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateExamModal;
