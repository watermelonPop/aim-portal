// globalSettings.js
import './App.css';
import { useState, useEffect } from 'react';

function GlobalSettings() {
  const [advisors, setAdvisors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  // Debounce the search input to reduce API calls.
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery !== "") {
        setLoading(true);
        fetch(`/api/findAdvisor?query=${encodeURIComponent(searchQuery)}`)
          .then(res => res.json())
          .then(data => {
            setAdvisors(data.advisors || []);
            setCurrentPage(0); // Reset to the first page on a new search.
            setLoading(false);
          })
          .catch(error => {
            console.error("Error fetching advisors:", error);
            setAdvisors([]);
            setLoading(false);
          });
      } else {
        setAdvisors([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Handler to update a checkbox field both locally and in the database.
  const handleCheckboxChange = (advisorId, fieldName, newValue) => {
    // Update local state optimistically.
    const updatedAdvisors = advisors.map(advisor => {
      if (advisor.user_id === advisorId) {
        return { ...advisor, [fieldName]: newValue };
      }
      return advisor;
    });
    setAdvisors(updatedAdvisors);

    // Update the database via an API call.
    fetch('/api/updateAdvisors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        advisor_id: advisorId,
        field: fieldName,
        value: newValue
      })
    })
      .then(res => res.json())
      .then(data => {
        console.log('Update successful:', data);
      })
      .catch(error => {
        console.error('Error updating advisor:', error);
      });
  };

  // Render an interactive checkbox.
  const renderCheckbox = (value, advisorId, fieldName) => (
    <input
      type="checkbox"
      checked={value}
      onChange={(e) => handleCheckboxChange(advisorId, fieldName, e.target.checked)}
      style={{ display: 'block', margin: '0 auto' }}
    />
  );

  // Pagination calculations.
  const startIndex = currentPage * itemsPerPage;
  const currentAdvisors = advisors.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(advisors.length / itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="global-settings">
      <h2 style={{ textAlign: 'center' }}>Advisor Search</h2>
      <div className="search-container" style={{ marginBottom: '1rem', textAlign: 'center' }}>
        <input
          type="text"
          placeholder="Search advisors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '0.5em', width: '80%', maxWidth: '30em' }}
        />
      </div>
      <div className="results-container" style={{ minHeight: '300px' }}>
        {searchQuery === "" ? (
          <p>Please enter a search query to find advisors.</p>
        ) : loading ? (
          <p>Loading...</p>
        ) : advisors.length === 0 ? (
          <p>No matching advisors found.</p>
        ) : (
          <>
            <table
              className="global-settings-table"
              style={{
                width: '90%',
                margin: '0 auto',
                borderCollapse: 'collapse',
                tableLayout: 'fixed'
              }}
            >
              <colgroup>
                <col style={{ width: '15%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '8.33%' }} />
                <col style={{ width: '8.33%' }} />
                <col style={{ width: '8.33%' }} />
                <col style={{ width: '8.33%' }} />
                <col style={{ width: '8.33%' }} />
                <col style={{ width: '8.33%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={{ borderBottom: '1px solid #ddd', padding: '0.5em' }}>Name</th>
                  <th style={{ borderBottom: '1px solid #ddd', padding: '0.5em' }}>Email</th>
                  <th style={{ borderBottom: '1px solid #ddd', padding: '0.5em' }}>Role</th>
                  <th style={{ borderBottom: '1px solid #ddd', padding: '0.5em' }}>Global Settings</th>
                  <th style={{ borderBottom: '1px solid #ddd', padding: '0.5em' }}>Accommodation Modules</th>
                  <th style={{ borderBottom: '1px solid #ddd', padding: '0.5em' }}>Note Taking Modules</th>
                  <th style={{ borderBottom: '1px solid #ddd', padding: '0.5em' }}>Assistive Tech Modules</th>
                  <th style={{ borderBottom: '1px solid #ddd', padding: '0.5em' }}>Accessible Testing Modules</th>
                  <th style={{ borderBottom: '1px solid #ddd', padding: '0.5em' }}>Student Case Info</th>
                </tr>
              </thead>
              <tbody>
                {currentAdvisors.map((advisor, index) => (
                  <tr
                    key={advisor.user_id}
                    style={{
                      backgroundColor: (startIndex + index) % 2 === 0 ? '#f2f2f2' : '#ffffff',
                    }}
                  >
                    <td style={{ border: '1px solid #ddd', padding: '0.5em', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {advisor.name}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '0.5em', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {advisor.email}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '0.5em', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {advisor.role}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '0.5em', textAlign: 'center' }}>
                      {renderCheckbox(advisor.global_settings, advisor.user_id, "global_settings")}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '0.5em', textAlign: 'center' }}>
                      {renderCheckbox(advisor.accommodation_modules, advisor.user_id, "accommodation_modules")}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '0.5em', textAlign: 'center' }}>
                      {renderCheckbox(advisor.note_taking_modules, advisor.user_id, "note_taking_modules")}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '0.5em', textAlign: 'center' }}>
                      {renderCheckbox(advisor.assistive_tech_modules, advisor.user_id, "assistive_tech_modules")}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '0.5em', textAlign: 'center' }}>
                      {renderCheckbox(advisor.accessible_testing_modules, advisor.user_id, "accessible_testing_modules")}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '0.5em', textAlign: 'center' }}>
                      {renderCheckbox(advisor.student_case_information, advisor.user_id, "student_case_information")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
              <button onClick={handlePrevPage} disabled={currentPage === 0} style={{ marginRight: '1em' }}>
                Previous 10
              </button>
              <span>
                Page {currentPage + 1} of {totalPages}
              </span>
              <button onClick={handleNextPage} disabled={currentPage >= totalPages - 1} style={{ marginLeft: '1em' }}>
                Next 10
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default GlobalSettings;
