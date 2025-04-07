import React, { useState } from 'react';

function CreateExamModal({ course, students, isOpen, onClose }) {
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examLocation, setExamLocation] = useState('');
  const [examFile, setExamFile] = useState(null);
  const [selectedAccommodations, setSelectedAccommodations] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [accommodationDropdownOpen, setAccommodationDropdownOpen] = useState(false);

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
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
    setSelectedStudents(selectedOptions);
  };

  const handleDropdownToggle = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleAccommodationDropdownToggle = () => {
    setAccommodationDropdownOpen((prev) => !prev);
  };

  const handleAccommodationSelection = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
    setSelectedAccommodations(selectedOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Submitted form");

    const formData = new FormData();
    formData.append("name", examName);
    formData.append("date", examDate);
    formData.append("location", examLocation);
    formData.append("file", examFile);
    formData.append("accommodations", JSON.stringify(selectedAccommodations));
    console.log("Selected Students: ", selectedStudents);
    formData.append("studentIds", selectedStudents);
    formData.append("courseId", course.id);

    try {
      const response = await fetch("/api/createExam", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        console.log("Exam created successfully");
        onClose();
      } else {
        console.error("Failed to create exam");
      }
      console.log(response);
    } catch (error) {
      console.error("Error submitting exam:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="examModalBackdrop">
      <div className="examModalContent">
        <h2>Create New Exam for {course.name}</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Exam Name:</label>
            <input type="text" value={examName} onChange={(e) => setExamName(e.target.value)} required />
          </div>
          <div>
            <label>Exam Date:</label>
            <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} required />
          </div>
          <div>
            <label>Location:</label>
            <input type="text" value={examLocation} onChange={(e) => setExamLocation(e.target.value)} required />
          </div>
          <div>
            <label>Upload Exam File:</label>
            <input type="file" onChange={handleFileChange} required />
          </div>

          <div>
            <label>Select Accommodations:</label>
            <div className="student-dropdown">
              <button type="button" className="examDropdownButton" onClick={handleAccommodationDropdownToggle}>
                {selectedAccommodations.length > 0 ? `Selected ${selectedAccommodations.length} accommodation(s)` : 'Select Accommodations'}
              </button>
              {accommodationDropdownOpen && (
                <select multiple value={selectedAccommodations} onChange={handleAccommodationSelection} className="student-dropdown-list">
                  {accommodationsList.map((accommodation, index) => (
                    <option key={index} value={accommodation}>
                      {accommodation}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Students Dropdown */}
          <div>
            <label>Select Students:</label>
            <div className="student-dropdown">
              <button type="button" className="examDropdownButton" onClick={handleDropdownToggle}>
                {selectedStudents.length > 0 ? `Selected ${selectedStudents.length} student(s)` : 'Select Students'}
              </button>
              {dropdownOpen && (
                <select multiple value={selectedStudents} onChange={handleStudentSelection} className="student-dropdown-list">
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
            <button className="examModalButton" type="submit" onClick={handleSubmit}>Create Exam</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateExamModal;
