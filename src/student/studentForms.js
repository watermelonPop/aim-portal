import { useEffect, useState } from 'react';

function StudentForms({ userInfo }) {
  const [view, setView] = useState(null);
  const [selectedDisability, setSelectedDisability] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [submittedForms, setSubmittedForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formType, setFormType] = useState('');
  const [formName, setFormName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [formFile, setFormFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');






  const disabilityOptions = ["ADHD", "Blind/Low Vision", "Hearing Impairment", "Physical Disability", "Emotional or Psychological Disability", "Temporary Disability"];

  const disabilityForms = {
    "ADHD": ["Priority Registration Request", "Reduced Course Load Request", "Application for Disability Services"],
    "Blind/Low Vision": ["Interpreter or Captioning Request", "Assistive Technology Request", "Transportation Assistance Form"],
    "Hearing Impairment": ["Interpreter or Captioning Request", "Assistive Technology Request", "Alternative Testing Request Form"],
    "Physical Disability": ["Housing Accommodation Request", "Medical or Psychological Documentation Form", "Assistive Technology Request"],
    "Emotional or Psychological Disability": ["Medical or Psychological Documentation Form", "Emotional Support Animal (ESA) Request"],
    "Temporary Disability": ["Temporary Accommodations Request", "Medical or Psychological Documentation Form"]
  };

  function handleDisabilityChange(event) {
    setSelectedDisability(event.target.value);
    setUploadedFiles({});
  }

  function handleFileUpload(event, formName) {
    const file = event.target.files[0];
    setUploadedFiles(prev => ({ ...prev, [formName]: file.name }));
  }

  async function handleSubmitForm(e) {
    e.preventDefault();
    setUploading(true);
    setUploadSuccess(false);
    setUploadError('');
  
    console.log("📝 Form Submission Triggered");
    console.log("Form Type:", formType);
    console.log("Form Name:", formName);
    console.log("Due Date:", dueDate);
    console.log("File:", formFile);
    console.log("User ID:", userInfo?.id);
  
    // Basic validation check
    if (!formFile || !formType || !formName || !userInfo?.id) {
      console.error("❌ Missing required field(s):", {
        formType,
        formName,
        formFile,
        userId: userInfo?.id
      });
      setUploadError("Missing required fields.");
      setUploading(false);
      return;
    }
  
    const formData = new FormData();
    formData.append("file", formFile);
    formData.append("type", formType);
    formData.append("userId", userInfo.id);
    formData.append("dueDate", dueDate || "");
  
    try {
      const res = await fetch('/api/uploadForm', {
        method: 'POST',
        body: formData,
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        console.error("❌ Upload failed:", data.error || data);
        throw new Error(data.error || 'Failed to upload');
      }
  
      console.log("✅ Upload succeeded:", data.form);
  
      setUploadSuccess(true);
      setFormType('');
      setFormName('');
      setDueDate('');
      setFormFile(null);
    } catch (error) {
      console.error("❌ Caught error during upload:", error.message);
      setUploadError(error.message);
    } finally {
      setUploading(false);
    }
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
  function formatFormType(type) {
    if (!type) return 'N/A';
    return type
      .toLowerCase()
      .split('_')
      .map(word => word[0].toUpperCase() + word.slice(1))
      .join(' ');
  }

  function hasUnsavedChanges() {
    return (
      formType !== '' ||
      formName !== '' ||
      dueDate !== '' ||
      formFile !== null
    );
  }
  

  useEffect(() => {
    async function fetchForms() {
      if (!userInfo?.id) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/getStudentForms?userId=${userInfo.id}`);
        const data = await res.json();
        setSubmittedForms(data.forms || []);
      } catch (err) {
        console.error("Error fetching forms:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchForms();
  }, [userInfo]);


  return (
    <div className="content-container">
      {view === null && (
        <div className="selection-container">
          <h2>Select an option below to proceed:</h2>
          <div className="selection-buttons">
            <button onClick={() => { setView('upload'); setSelectedDisability(''); }}>Upload Forms</button>
            <button onClick={() => setView('manage')}>Manage Forms</button>
          </div>
        </div>
      )}

{view === 'upload' && (
  <div className="form-wrapper">
  <button
    className="back-btn"
    onClick={() => {
      if (hasUnsavedChanges()) {
        const confirmLeave = window.confirm(
          "⚠️ Are you sure you want to leave? Unsaved changes will be lost."
        );
        if (!confirmLeave) return;
      }

      // Clear all fields
      setFormType('');
      setFormName('');
      setDueDate('');
      setFormFile(null);
      setUploadError('');
      setUploadSuccess(false);
      setView(null);
    }}
  >
    ← Back
  </button>

<h2>📤 Upload New Form</h2>

    <form onSubmit={handleSubmitForm} className="upload-form">

      <label>
        Form Type:
        <select value={formType} onChange={(e) => setFormType(e.target.value)} required>
          <option value="">-- Select Type --</option>
          <option value="priority_registration_request">Priority Registration Request</option>
          <option value="medical_documentation">Medical Documentation</option>
          <option value="reduced_course_load">Reduced Course Load</option>
          <option value="assistive_tech_request">Assistive Technology Request</option>
          <option value="testing_request">Alternative Testing Request</option>
          <option value="other">Other</option>
        </select>
      </label>

      <label>
        Form Name:
        <input
          type="text"
          placeholder="Enter form name..."
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          required
        />
      </label>

      <label>
        Due Date (optional):
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </label>

      <label>
        Upload File:
        <input
          type="file"
          onChange={(e) => setFormFile(e.target.files[0])}
          required
        />
      </label>
      {formFile && formFile.type === "application/pdf" && (
      <div className="pdf-preview">
        <p>📄 Preview:</p>
        <embed
          src={URL.createObjectURL(formFile)}
          type="application/pdf"
          width="100%"
          height="400px"
        />
      </div>
    )}


      <button type="submit" className="submit-btn" disabled={uploading}>
        {uploading ? (
          <span><span className="student-forms-spinner"></span> Uploading...</span>
        ) : "Submit Form"}
      </button>

      {uploadSuccess && <p className="success-msg">✅ Form submitted successfully!</p>}
      {uploadError && <p className="error-msg">❌ {uploadError}</p>}

    </form>
  </div>
)}

    {view === 'manage' && (
      <div className="form-wrapper">
        <button className="back-btn" onClick={() => setView(null)}>← Back</button>
        <h2>📄 Your Submitted Forms</h2>

        {loading ? (
          <p>Loading...</p>
        ) : submittedForms.length === 0 ? (
          <p>No forms submitted yet.</p>
        ) : (
          <div className="manage-forms-list">
            {submittedForms.map((form, index) => (
              <div key={index} className="manage-form-item">
                <h3>{formatFormType(form.type)}</h3>
                <p><strong>Status:</strong> <span className={`status-${form.status.toLowerCase()}`}>{form.status}</span></p>
                <p><strong>Submitted:</strong> {form.submittedDate ? new Date(form.submittedDate).toLocaleDateString() : "N/A"}</p>
                <p><strong>Due:</strong> {form.dueDate ? new Date(form.dueDate).toLocaleDateString() : "N/A"}</p>
                {form.formUrl ? (
                  <p><a href={form.formUrl} target="_blank" rel="noopener noreferrer">📎 View Form</a></p>
                ) : (
                  <p>⚠️ No file uploaded.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )}

    </div>
  );
}

export default StudentForms;
