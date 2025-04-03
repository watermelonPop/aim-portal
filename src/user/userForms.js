import { useState, useRef, useEffect } from 'react';

function UserForms({displayHeaderRef, settingsTabOpen, lastIntendedFocusRef}) {
  const [view, setView] = useState(null);
  const [selectedDisability, setSelectedDisability] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [submittedForms, setSubmittedForms] = useState([
    { name: "Priority Registration Request", fileName: "priority_request.pdf", uploadDate: "2024-02-10", status: "Pending" },
    { name: "Medical Documentation", fileName: "medical_doc.pdf", uploadDate: "2024-02-05", status: "Approved" }
  ]);

  const disabilityOptions = ["ADHD", "Blind/Low Vision", "Hearing Impairment", "Physical Disability", "Emotional or Psychological Disability", "Temporary Disability"];

  const disabilityForms = {
    "ADHD": ["Priority Registration Request", "Reduced Course Load Request", "Application for Disability Services"],
    "Blind/Low Vision": ["Interpreter or Captioning Request", "Assistive Technology Request", "Transportation Assistance Form"],
    "Hearing Impairment": ["Interpreter or Captioning Request", "Assistive Technology Request", "Alternative Testing Request Form"],
    "Physical Disability": ["Housing Accommodation Request", "Medical or Psychological Documentation Form", "Assistive Technology Request"],
    "Emotional or Psychological Disability": ["Medical or Psychological Documentation Form", "Emotional Support Animal (ESA) Request"],
    "Temporary Disability": ["Temporary Accommodations Request", "Medical or Psychological Documentation Form"]
  };

  const localRef = useRef(null);
  
      // If ref is passed in (from parent), use that. Otherwise use internal.
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
              console.log("FOCUSING DASH");
              console.log("Intent:", lastIntendedFocusRef.current, "Target:", headingRef.current);
              headingRef.current.focus();
              lastIntendedFocusRef.current = null;
            }
          });
        
          return () => cancelAnimationFrame(frame);
        }, [settingsTabOpen, headingRef]);

  function handleDisabilityChange(event) {
    setSelectedDisability(event.target.value);
    setUploadedFiles({});
  }

  function handleFileUpload(event, formName) {
    const file = event.target.files[0];
    setUploadedFiles(prev => ({ ...prev, [formName]: file.name }));
  }

  function handleRemoveFile(formName) {
    setUploadedFiles(prev => {
      const updatedFiles = { ...prev };
      delete updatedFiles[formName];
      return updatedFiles;
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    alert("Form submission will be implemented later.");
  }

  function handleExitUploadView() {
    setView(null);
    setSelectedDisability(''); // Reset disability selection when exiting Upload Forms
  }

  return (
    <div className="content-container">
      {view === null && (
        <div className="selection-container">
          <h2 ref={headingRef}
                    tabIndex={0}>Select an option below to proceed:</h2>
          <div className="selection-buttons">
            <button onClick={() => { setView('upload'); setSelectedDisability(''); }}>Upload Forms</button>
            <button onClick={() => setView('manage')}>Manage Forms</button>
          </div>
        </div>
      )}

      {view === 'upload' && (
        <div className="form-wrapper">
          <button className="back-btn" onClick={handleExitUploadView}>← Back</button>
          <div className="disability-selection">
            <label>
              <h3>Select a Disability:</h3>
              <select value={selectedDisability} onChange={handleDisabilityChange}>
                <option value="">-- Select an Option --</option>
                {disabilityOptions.map((disability, index) => (
                  <option key={index} value={disability}>{disability}</option>
                ))}
              </select>
            </label>
          </div>

          {selectedDisability && (
            <>
              <div className="forms-list">
                {disabilityForms[selectedDisability]?.map((formName, index) => (
                  <div key={index} className="form-item">
                    <div className="form-header">
                      <span>{formName}</span>
                      <button className="download-btn" onClick={() => window.open(`/placeholder/${formName}.pdf`, "_blank")}>Download Form</button>
                    </div>
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
      )}

      {view === 'manage' && (
        <div className="form-wrapper">
          <button className="back-btn" onClick={() => setView(null)}>← Back</button>
          <div className="manage-forms-list">
            {submittedForms.map((form, index) => (
              <div key={index} className="manage-form-item">
                <h3>{form.name}</h3>
                <p><strong>File Name:</strong> {form.fileName}</p>
                <p><strong>Uploaded:</strong> {form.uploadDate}</p>
                <p><strong>Status:</strong> <span className={`status-${form.status.toLowerCase()}`}>{form.status}</span></p>
                <button className="settings-btn">⚙ Manage</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserForms;
