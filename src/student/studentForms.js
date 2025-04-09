import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faEnvelope} from '@fortawesome/free-solid-svg-icons';
function StudentForms({ userInfo, settingsTabOpen, displayHeaderRef }) {
        
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
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState("");





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

  const handleContactAdvisor = async () => {
    try {
      const res = await fetch(`/api/getAdvisorEmail?userId=${userInfo.id}`);
      const data = await res.json();
  
      if (res.ok) {
        window.location.href = `mailto:${data.advisorEmail}?subject=Assistance%20Needed&body=Hi%20Advisor,`;
      } else {
        alert("Could not find your advisor's email.");
      }
    } catch (err) {
      alert("Something went wrong fetching your advisor.");
      console.error(err);
    }
  };
  
  
  

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
    if (!userInfo || !userInfo.id) {
      setUploadError("User information is missing. Please log in again.");
      console.error("userInfo is undefined or missing 'id':", userInfo);
      return;
    }
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

  const handleDeleteForm = async (formId) => {
    const confirmed = window.confirm("Are you sure you want to delete this form?");
    if (!confirmed) return;
  
    try {
      const res = await fetch("/api/studentDeleteForm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ formId }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        setSubmittedForms(prev => prev.filter(f => f.id !== formId));
        setDeleteSuccessMsg("✅ Form deleted successfully!");
        setTimeout(() => setDeleteSuccessMsg(""), 4000);
      } else {
        console.error("Failed to delete:", data.error);
        alert("Error deleting form: " + data.error);
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error while deleting form.");
    }
  };
  
  

  
  
  

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
    <div className="studentForms-container">
      {view === null && (
        <div
          className="studentForms-selection-container"
          aria-label="Form selection interface"
        >
          <div className="studentForms-selection-header">
            <h2
              aria-label="Select an option to proceed, upload forms or manage forms."
            >
              What would you like to do?
            </h2>
            <button
              className="studentForms-contact-advisor-btn-small"
              onClick={handleContactAdvisor}
              aria-label="Contact your advisor through email"
              ref={displayHeaderRef}
            >
              <FontAwesomeIcon icon={faEnvelope}aria-hidden="true" /> Contact Advisor (Outlook)
            </button>
          </div>
          <div className="studentForms-selection-buttons">
            <button
              onClick={() => {
                setView("upload");
                setSelectedDisability("");
              }}
              aria-label="Go to upload forms section"
            >
              Upload Forms
            </button>
            <button
              onClick={() => setView("manage")}
              aria-label="Go to manage submitted forms section"
            >
              Manage Forms
            </button>
          </div>
        </div>
      )}
  
      {view === "upload" && (
        <div
          className="studentForms-form-wrapper"
          aria-label="Upload form documentation section"
        >
          <button
            className="studentForms-back-btn"
            onClick={handleExitUploadView}
            aria-label="Return to previous menu"
          >
            ← Back
          </button>
          <h2 tabIndex={0}>📤 Upload Documentation</h2>
  
          <form
            onSubmit={handleSubmitFileOnly}
            className="studentForms-upload-form"
            aria-label="Upload PDF form"
          >
            <label htmlFor="upload-pdf">Upload PDF:</label>
            <div className="studentForms-custom-file-input">
            <input
              type="file"
              id="fileUpload"
              accept="application/pdf"
              onChange={(e) => setFormFile(e.target.files[0])}
              required
            />
            <span>
              {formFile ? formFile.name : "Choose a PDF file..."}
            </span>
          </div>
  
            {formFile && formFile.type === "application/pdf" && (
              <div
                className="studentForms-pdf-preview"
                aria-label="Preview of uploaded PDF"
                tabIndex={-1}
              >
                <p>📄 Preview:</p>
                <embed
                  src={URL.createObjectURL(formFile)}
                  type="application/pdf"
                  width="100%"
                  height="400px"
                  aria-hidden="true"
                />
              </div>
            )}
  
            <button
              type="submit"
              className="studentForms-submit-btn"
              disabled={uploading}
              aria-label={uploading ? "Uploading your file" : "Submit documentation"}
            >
              {uploading ? (
                <span>
                  <span
                    className="studentForms-spinner"
                    aria-hidden="true"
                  ></span>{" "}
                  Uploading...
                </span>
              ) : (
                "Submit Documentation"
              )}
            </button>
  
            {uploadSuccess && (
              <p
                className="studentForms-success-msg"
                tabIndex={0}
                aria-live="polite"
              >
                ✅ Upload successful!
              </p>
            )}
            {uploadError && (
              <p
                className="studentForms-error-msg"
                tabIndex={0}
                aria-live="assertive"
              >
                ❌ {uploadError}
              </p>
            )}
          </form>
        </div>
      )}
  
      {view === "manage" && (
        <div
          className="studentForms-form-wrapper"
          aria-label="Submitted forms list section"
        >
          <button
            className="studentForms-back-btn"
            onClick={handleExitUploadView}
            aria-label="Return to previous menu"
          >
            ← Back
          </button>
          <h2 tabIndex={0}>📁 Submitted Forms</h2>

          {deleteSuccessMsg && (
              <p
                className="studentForms-success-msg"
                role="status"
                aria-live="polite"
                tabIndex={0}
              >
                {deleteSuccessMsg}
              </p>
            )}
  
          {loadingForms ? (
            <p tabIndex={0}>Loading your forms...</p>
          ) : submittedForms.length === 0 ? (
            <p tabIndex={0}>No forms submitted yet.</p>
          ) : (
            <table
              className="studentForms-submitted-table"
              aria-label="Submitted forms table"
            >
              <thead>
                <tr>
                  <th scope="col">File Name</th>
                  <th scope="col">Submitted</th>
                  <th scope="col">Status</th>
                  <th scope="col">View/Download</th>
                  <th scope="col">Delete</th>
                </tr>
              </thead>
              <tbody>
                {submittedForms.map((form) => (
                  <tr key={form.id}>
                    <td tabIndex={0} aria-label={`Form name: ${form.name}`}>
                      {form.name}
                    </td>
                    <td
                      tabIndex={0}
                      aria-label={`Submitted on ${new Date(form.submittedDate).toLocaleDateString()}`}
                    >
                      {new Date(form.submittedDate).toLocaleDateString()}
                    </td>
                    <td tabIndex={0} aria-label={`Status: ${form.status}`}>
                      {form.status}
                    </td>
                    <td>
                      <a
                        className='student-form-viewbtn'
                        href={form.formUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View form ${form.name}`}
                      >
                        View
                      </a>
                    </td>
                    <td>
                      <button
                        className="studentForms-delete-btn"
                        onClick={() => handleDeleteForm(form.id)}
                        aria-label={`Delete form ${form.name}`}
                      >
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
