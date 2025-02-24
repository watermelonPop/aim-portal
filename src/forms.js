import './App.css';
import { useEffect, useState } from 'react';

function Forms({ userType }) {
  const [view, setView] = useState(null); // 'upload' or 'manage'
  const [selectedDisability, setSelectedDisability] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [submittedForms, setSubmittedForms] = useState([
    {
      name: "Priority Registration Request",
      fileName: "priority_request.pdf",
      uploadDate: "2024-02-10",
      status: "Pending"
    },
    {
      name: "Medical Documentation",
      fileName: "medical_doc.pdf",
      uploadDate: "2024-02-05",
      status: "Approved"
    }
  ]);

  // List of disabilities
  const disabilityOptions = [
    "ADHD",
    "Blind/Low Vision",
    "Hearing Impairment",
    "Physical Disability",
    "Emotional or Psychological Disability",
    "Temporary Disability"
  ];

  // Required forms based on disability type
  const disabilityForms = {
    "ADHD": ["Priority Registration Request", "Reduced Course Load Request", "Application for Disability Services"],
    "Blind/Low Vision": ["Interpreter or Captioning Request", "Assistive Technology Request", "Transportation Assistance Form"],
    "Hearing Impairment": ["Interpreter or Captioning Request", "Assistive Technology Request", "Alternative Testing Request Form"],
    "Physical Disability": ["Housing Accommodation Request", "Medical or Psychological Documentation Form", "Assistive Technology Request"],
    "Emotional or Psychological Disability": ["Medical or Psychological Documentation Form", "Emotional Support Animal (ESA) Request"],
    "Temporary Disability": ["Temporary Accommodations Request", "Medical or Psychological Documentation Form"]
  };

  // Handle selection of disability
  function handleDisabilityChange(event) {
    setSelectedDisability(event.target.value);
    setUploadedFiles({}); // Reset uploaded files when disability changes
  }

  // Handle file uploads
  function handleFileUpload(event, formName) {
    const file = event.target.files[0];
    setUploadedFiles(prev => ({
      ...prev,
      [formName]: file.name // Store file name temporarily
    }));
  }

  // Handle file removal
  function handleRemoveFile(formName) {
    setUploadedFiles(prev => {
      const updatedFiles = { ...prev };
      delete updatedFiles[formName]; // Remove file entry
      return updatedFiles;
    });
  }

  // Placeholder submit function
  function handleSubmit(event) {
    event.preventDefault();
    alert("Form submission will be implemented later.");
  }

  return (
    <main className="dashboardOuter">
      

      {/* Content Wrapper */}
      <div className="content-container">
        {/* Selection Menu */}
        {view === null && (
          <div className="selection-container">
            <h2>Select an option below to proceed:</h2>
            <div className="selection-buttons">
              <button onClick={() => setView('upload')}>Upload Forms</button>
              <button onClick={() => setView('manage')}>Manage Forms</button>
            </div>
          </div>
        )}

        {/* Upload Forms Section */}
        {view === 'upload' && (
          <div className="form-wrapper">
            <div className="forms-container">
              <button className="back-btn" onClick={() => setView(null)}>← Back</button>

              <div className="disability-selection">
                <label>
                  Select a Disability:
                  <select value={selectedDisability} onChange={handleDisabilityChange}>
                    <option value="">-- Select an Option --</option>
                    {disabilityOptions.map((disability, index) => (
                      <option key={index} value={disability}>{disability}</option>
                    ))}
                  </select>
                </label>
              </div>

             {/* Forms Listed in a Row at the Bottom */}
{/* Forms Listed in a Row at the Bottom */}
{selectedDisability && (
  <>
    <div className="forms-list">
      {disabilityForms[selectedDisability]?.map((formName, index) => (
        <div key={index} className="form-item">
          <div className="form-header">
            <span>{formName}</span>
            {/* Download Button Inline */}
            <button 
              className="download-btn" 
              onClick={() => window.open(`/placeholder/${formName}.pdf`, "_blank")}
            >
              Download Form
            </button>
          </div>
          {/* File Upload Below */}
          <input type="file" onChange={(e) => handleFileUpload(e, formName)} />
          {uploadedFiles[formName] && (
            <>
              <span>✔️ {uploadedFiles[formName]}</span>
              <button className="remove-btn" onClick={() => handleRemoveFile(formName)}>Remove</button>
            </>
          )}
        </div>
      ))}
    </div>
    <button type="submit" className="submit-btn" onClick={handleSubmit}>Submit Forms</button>
  </>
)}


            </div>
          </div>
        )}

        {/* Manage Forms Section */}
        {view === 'manage' && (
          <div className="form-wrapper">
            <div className="forms-container">
              <button className="back-btn" onClick={() => setView(null)}>← Back</button>

              <div className="manage-forms-list">
                {submittedForms.map((form, index) => (
                  <div key={index} className="manage-form-item">
                    <h3>{form.name}</h3>
                    <p><strong>File Name:</strong> {form.fileName}</p>
                    <p><strong>Uploaded:</strong> {form.uploadDate}</p>
                    <p><strong>Status:</strong> 
                      <span className={`status-${form.status.toLowerCase()}`}> {form.status}</span>
                    </p>
                    <button className="settings-btn">⚙ Manage</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

    </main>
  );
}

export default Forms;
