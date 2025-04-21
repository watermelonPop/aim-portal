export async function confirmAndSaveRequestStatus({
    requestId,
    editedRequests,
    setEditedRequests,
    setRequestsData,
  }) {
    const newStatus = editedRequests[requestId];
    if (!newStatus) return;
  
    const confirmed = window.confirm("Are you sure you want to save this status change?");
    if (!confirmed) return;
  
    try {
      const res = await fetch('/api/updateRequestStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status: newStatus }),
      });
  
      if (res.ok) {
        alert('✅ Request status updated!');
        const updated = await fetch('/api/getRequests');
        const data = await updated.json();
        setRequestsData(data.requests || []);
        setEditedRequests((prev) => {
          const copy = { ...prev };
          delete copy[requestId];
          return copy;
        });
      } else {
        alert('❌ Failed to update request status.');
      }
    } catch (err) {
      console.error("❌ Error updating request status:", err);
      alert("❌ Error while saving request status.");
    }
  }
  
export async function refreshStudentData(userId, {
    setRefreshingStudent,
    setStudentsData,
    setSelectedStudent,
    setEditedStudent,
  }) {
    setRefreshingStudent(true);
    try {
      const res = await fetch('/api/getStudents');
      const data = await res.json();
      const updatedStudent = data.students.find(s => s.userId === userId);
      if (updatedStudent) {
        setStudentsData(prev =>
          prev.map(s => (s.userId === userId ? updatedStudent : s))
        );
        setSelectedStudent(updatedStudent);
        setEditedStudent(updatedStudent);
      }
    } catch (err) {
      console.error("❌ Error refreshing student data:", err);
    } finally {
      setRefreshingStudent(false);
    }
  }
  
export async function fetchForms(userId, setSubmittedForms) {
    try {
      const res = await fetch(`/api/getForms?userId=${userId}`);
      const data = await res.json();
      setSubmittedForms(data.forms || []);
    } catch (err) {
      console.error("Error fetching forms:", err);
      setSubmittedForms([]);
    }
  }
  
export function handleFormStatusChange(formId, newStatus, {
    setFullscreenMessage,
    setIsRefreshing,
    selectedStudent,
    fetchForms
  }) {
    setFullscreenMessage({
      title: "Confirm Status Update",
      message: "Are you sure you want to save this change?",
      confirm: async () => {
        setIsRefreshing(true);
        try {
          const response = await fetch("/api/updateFormStatus", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ formId, status: newStatus }),
          });
  
          if (!response.ok) {
            throw new Error(`Failed to update form status: ${response.status}`);
          }
  
          await fetchForms(selectedStudent.userId);
          setFullscreenMessage({
            title: "✅ Success!",
            message: "Form status updated successfully!",
          });
  
        } catch (err) {
          console.error("Form status update error:", err);
          setFullscreenMessage({
            title: "❌ Error",
            message: "An error occurred while updating the status.",
          });
        } finally {
          setIsRefreshing(false);
        }
      },
    });
  }
  
export async function handleSaveChanges({
    editedStudent,
    selectedStudent,
    setSuccessMessage,
    setInfoMessage,
    setLoading,
    setFullscreenMessage,
    refreshStudentData,
    hasChanges,
    setStudentNeedsRefresh
  }) {
    setInfoMessage('');
    setSuccessMessage('');
  
    if (!hasChanges()) {
      setInfoMessage('⚠️ No changes to save.');
      setTimeout(() => setInfoMessage(''), 4000);
      return;
    }
  
    const errors = [];
    const nameRegex = /^[A-Za-z\s.,'-]+$/;
    if (!editedStudent.student_name || !nameRegex.test(editedStudent.student_name)) {
      errors.push("• Name must only contain letters and spaces.");
    }
  
    if (!/^\d{9}$/.test(editedStudent.UIN)) {
      errors.push("• UIN must be exactly 9 digits.");
    }
  
    if (!editedStudent.dob || isNaN(new Date(editedStudent.dob).getTime())) {
      errors.push("• Date of Birth is not valid.");
    }
  
    const phoneRegex = /^[()\d.\-\s]+(?: x\d+)?$/;
    if (!phoneRegex.test(editedStudent.phone_number)) {
      errors.push("• Phone number format is invalid.");
    }
  
    if (errors.length > 0) {
      setInfoMessage(`❌ Please fix the following:\n${errors.join("\n")}`);
      setSuccessMessage('');
      setLoading(false);
      return;
    }
  
    setLoading(true);
    const studentUpdatePayload = {
      userId: editedStudent.userId,
      student_name: editedStudent.student_name.trim(),
      UIN: parseInt(editedStudent.UIN, 10),
      dob: editedStudent.dob,
      email: editedStudent.email.trim(),
      phone_number: editedStudent.phone_number.trim(),
    };
  
    try {
      const response = await fetch('/api/updateStudent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentUpdatePayload),
      });
  
      const result = await response.json();
  
      if (!response.ok) throw new Error(result.error || 'Failed to update student.');
  
      setFullscreenMessage({
        title: "✅ Success!",
        message: "Changes saved successfully!"
      });
  
      setTimeout(() => setSuccessMessage(''), 2500);
  
    } catch (err) {
      console.error("❌ Update error:", err);
      setInfoMessage('❌ Failed to update student.');
    } finally {
      setLoading(false);
      refreshStudentData(editedStudent?.userId);
    }
  }

export function formatFormType(type) {
  if (!type) return 'N/A';
  return type
    .toLowerCase()
    .split('_')
    .map(word => word[0].toUpperCase() + word.slice(1))
    .join(' ');
  }

export async function confirmAndSaveStatus(accId, {
  editedAccommodations,
  setFullscreenMessage
}) {
  const newStatus = editedAccommodations[accId];
  if (!newStatus) return;

  setFullscreenMessage({
    title: "Confirm Action",
    message: "Are you sure you want to perform this action?",
    confirm: () => {
      confirmAndSaveStatus(accId, { editedAccommodations, setFullscreenMessage });
    }
  });

  try {
    const res = await fetch('/api/updateAccommodationStatus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accommodationId: accId, status: newStatus })
    });

    if (res.ok) {
      alert('✅ Status updated successfully!');
    } else {
      setFullscreenMessage({
        title: "❌ Error",
        message: "Failed to update status."
      });
    }
  } catch (error) {
    console.error('Error updating status:', error);
    alert('❌ Error while updating status.');
  }
  }

export async function resetToStudentSearch({
  isEditing,
  hasChanges,
  setView,
  setShowAccommodations,
  setShowAssistiveTech,
  setIsEditing,
  setShowStudentInfo,
  setSelectedStudent,
  setEditedStudent
}) {
  if (isEditing && hasChanges()) {
    const confirmLeave = window.confirm(
      "⚠️ Are you sure you want to leave? Unsaved changes will be discarded."
    );
    if (!confirmLeave) return;
  }

  setView('students');
  setShowAccommodations(false);
  setShowAssistiveTech(false);
  setIsEditing(false);
  setShowStudentInfo(false);
  setSelectedStudent(null);
  setEditedStudent(null);
  }
