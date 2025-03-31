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
  const [loadingForms, setLoadingForms] = useState(false);




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

    formData.append("file", formFile);
    formData.append("type", formType);
    formData.append("formName", formName);
    formData.append("userId", userInfo.id);
    formData.append("dueDate", dueDate || "");

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
    if (formType || formName || dueDate || formFile) {
      const confirmLeave = window.confirm("⚠️ Are you sure you want to leave? Unsaved changes will be lost.");
      if (!confirmLeave) return;
    }
  
    // Reset all upload-related state
    setFormType('');
    setFormName('');
    setDueDate('');
    setFormFile(null);
    setUploadError('');
    setUploadSuccess(false);
    setUploading(false); 
    setView(null);
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

  async function handleSubmitFileOnly(e) {
    e.preventDefault();
    const confirmed = window.confirm("Are you sure you want to submit this form?");
    if (!confirmed) {
      return;
    }
    setUploading(true);
    setUploadSuccess(false);
    setUploadError('');
  
    if (!formFile) {
      setUploadError("Please select a file to upload.");
      setUploading(false);
      return;
    }
  
    const formData = new FormData();
    formData.append("file", formFile);
    formData.append("type", formType);
    formData.append("formName", formName);
    formData.append("userId", userInfo.id);
    formData.append("dueDate", dueDate || "");
  
    try {
      const res = await fetch("/api/uploadForm", {
        method: "POST",
        body: formData,
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        throw new Error(data.error || "Upload failed.");
      }
  
      console.log("✅ File uploaded to:", data.url);
      setUploadSuccess(true);
      setFormFile(null);
    } catch (error) {
      console.error("❌ Upload error:", error);
      setUploadError(error.message);
    } finally {
      setUploading(false);
    }

    formData.append("file", formFile);
    
  }

  async function handleDeleteForm(formId) {
    const confirmed = window.confirm("Are you sure you want to delete this form?");
    if (!confirmed) return;
  
    try {
      const res = await fetch("/api/deleteForm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ formId }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        setSubmittedForms(prev => prev.filter(f => f.id !== formId));
      } else {
        console.error("Failed to delete:", data.error);
        alert("Error deleting form: " + data.error);
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error while deleting form.");
    }
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

  useEffect(() => {
    if (view === 'manage' && userInfo?.id) {
      setLoadingForms(true);
      fetch(`/api/getStudentForms?userId=${userInfo.id}`)
        .then(res => res.json())
        .then(data => setSubmittedForms(data.forms || []))
        .catch(err => console.error("Error loading forms:", err))
        .finally(() => setLoadingForms(false));
    }
  }, [view, userInfo]);
  


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
    <button className="back-btn" onClick={handleExitUploadView}>← Back</button>
    <h2>📤 Upload Documentation</h2>

    <form onSubmit={handleSubmitFileOnly} className="upload-form upload-file-only">
      <label>
        Upload PDF:
        <input
          type="file"
          accept="application/pdf"
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
          <span><span className="spinner"></span> Uploading...</span>
        ) : "Submit Documentation"}
      </button>

      {uploadSuccess && <p className="success-msg">✅ Upload successful!</p>}
      {uploadError && <p className="error-msg">❌ {uploadError}</p>}
    </form>
  </div>
)}


{view === 'manage' && (
  <div className="form-wrapper">
    <button className="back-btn" onClick={handleExitUploadView}>← Back</button>
    <h2>📁 Submitted Forms</h2>

    {loadingForms ? (
      <p>Loading your forms...</p>
    ) : submittedForms.length === 0 ? (
      <p>No forms submitted yet.</p>
    ) : (
      <table className="submitted-forms-table">
        <thead>
          <tr>
            <th>File Name</th>
            <th>Submitted</th>
            <th>Status</th>
            <th>View</th>
            <td>
</td>

          </tr>
        </thead>
        <tbody>
        {submittedForms.map((form) => (
          <tr key={form.id}>
            <td>{form.name}</td>
            <td>{new Date(form.submittedDate).toLocaleDateString()}</td>
            <td>{form.status}</td>
            <td>
              <a href={form.formUrl} target="_blank" rel="noopener noreferrer">View</a>
            </td>
            <td>
              <button className="delete-btn" onClick={() => handleDeleteForm(form.id)}>
                🗑️ Delete
              </button>
            </td>
          </tr>
        ))}

        </tbody>
      </table>
    )}
  </div>
)}
    </div>
  );
}

export default StudentForms;
