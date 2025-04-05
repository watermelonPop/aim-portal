import { useState, useEffect, useRef } from 'react';

function GlobalSettings({ displayHeaderRef, settingsTabOpen, lastIntendedFocusRef }) {
  const [advisorList, setAdvisorList] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const localRef = useRef(null);

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

  useEffect(() => {
    async function fetchAdv() {
      fetch(`/api/getAdvisors`)
        .then(response => response.json())
        .then(data => {
          setAdvisorList(data.advisors || []);
          setCurrentPage(0);
          setTotalPages(Math.ceil((data.advisors || []).length / 9));
          setLoaded(true);
        })
        .catch(error => console.error('error fetching advisors', error));
    }
    fetchAdv();
  }, []);

  useEffect(() => {
    if (loaded) {
      console.log("advisorList:", advisorList);
    }
  }, [loaded]);

  useEffect(() => {
    if (loaded) {
      const updatedSearchResults = advisorList.filter((advisor) =>
        advisor.account.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(updatedSearchResults);
      setCurrentPage(0);
      setTotalPages(Math.ceil(updatedSearchResults.length / 9));
    }
  }, [searchQuery, advisorList, loaded]);

  function CardView({ advisors, skip, take }) {
    const gridContainerStyle = {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 28vw)',
      gridAutoRows: '20vh',
      gap: '16px',
      padding: '16px',
      justifyContent: 'center'
    };

    const cardStyle = {
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      overflow: 'hidden'
    };

    const nameStyle = {
      margin: '0 0 8px',
      fontSize: '1.2em'
    };

    const emailStyle = {
      margin: 0,
      fontSize: '0.9em',
      color: '#555'
    };

    const roleStyle = {
      margin: 0,
      fontSize: '0.7em',
      color: '#555'
    };

    if (!loaded) {
      return <div style={{ padding: '16px', textAlign: 'center' }}>Loading advisors...</div>;
    }

    const handleCardClick = (advisor) => {
      setSelectedAdvisor(advisor);
    };

    let displayedAdvisors = searchQuery === "" ? advisorList.slice(skip, take) : advisors.slice(skip, take);

    return (
      <div style={gridContainerStyle}>
        {displayedAdvisors.map(advisor => (
          <div
            key={advisor.id}
            style={cardStyle}
            onClick={() => handleCardClick(advisor)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCardClick(advisor);
            }}
            aria-label={`Advisor card for ${advisor.account.name}, email: ${advisor.account.email}, role: ${advisor.role}`}
          >
            <h3 style={nameStyle}>{advisor.account.name}</h3>
            <p style={emailStyle}>{advisor.account.email}</p>
            <p style={roleStyle}>{advisor.role}</p>
          </div>
        ))}
      </div>
    );
  }

  function PaginationButtons() {
    const onPageChange = (page_update) => {
      if (page_update < 0) {
        if (currentPage !== 0) {
          setCurrentPage(currentPage - 1);
        }
      } else {
        if (currentPage !== totalPages - 1) {
          setCurrentPage(currentPage + 1);
        }
      }
    };

    return (
      <div className="pagination-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '16px' }}>
        <button
          onClick={() => onPageChange(-1)}
          disabled={currentPage === 0}
          aria-label="Previous page"
        >
          Prev
        </button>
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === totalPages - 1}
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    );
  }

  function AdvisorCard({ advisor, onClose }) {
    const temp_advisor_perms = [
      advisor.global_settings,
      advisor.accessible_testing_modules,
      advisor.accomodation_modules,
      advisor.assistive_technology_modules,
      advisor.note_taking_modules,
      advisor.student_case_information
    ];
    const [permissions, setPermissions] = useState([...temp_advisor_perms] || []);

    const availablePermissions = [
      'Global Settings',
      'Accessible Testing',
      'Accommodation Modules',
      'Assistive Technologies',
      'Note Taking Modules',
      'Student Case Information'
    ];

    const handleCheckboxChange = (perm_no) => {
      let new_perms = [...permissions];
      new_perms[perm_no] = !new_perms[perm_no];
      setPermissions(new_perms);
    };

    const handleSave = () => {
      setIsSaving(true);
      setSelectedAdvisor(prev => ({
        ...prev,
        global_settings: permissions[0],
        accessible_testing_modules: permissions[1],
        accomodation_modules: permissions[2],
        assistive_technology_modules: permissions[3],
        note_taking_modules: permissions[4],
        student_case_information: permissions[5],
      }));
      fetch(`/api/updateAdvisors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ advisorId: advisor.userId, permissions })
      })
        .then(response => response.json())
        .then(data => {
          setIsSaving(false);
          setAdvisorList(prevList => {
            const updatedList = [...prevList];
            const index = updatedList.findIndex(item => item.userId === advisor.userId);
            if (index !== -1) {
              updatedList[index] = {
                ...updatedList[index],
                global_settings: permissions[0],
                accessible_testing_modules: permissions[1],
                accomodation_modules: permissions[2],
                assistive_technology_modules: permissions[3],
                note_taking_modules: permissions[4],
                student_case_information: permissions[5],
              };
            }
            return updatedList;
          });
          setSaveSuccess('Settings saved successfully!');
          setTimeout(() => {
            setSaveSuccess('');
          }, 3000);
        })
        .catch(error => {
          console.error('Error updating permissions:', error);
          setIsSaving(false);
        });
    };

    const detailCardStyle = {
      border: '2px solid #333',
      borderRadius: '8px',
      padding: '30px',
      margin: '20px',
      textAlign: 'center'
    };

    return (
      <div style={detailCardStyle}>
        <h2 tabIndex={0} aria-label={`Details for advisor ${advisor.account.name}`}>
          {advisor.account.name}
        </h2>
        <p aria-label={`Advisor ID: ${advisor.userId}`}>ID: {advisor.userId}</p>
        <p aria-label={`Advisor email: ${advisor.account.email}`}>Email: {advisor.account.email}</p>
        <p aria-label={`Advisor role: ${advisor.role}`}>Role: {advisor.role}</p>
        <h3>Permissions</h3>
        <div style={{ textAlign: 'left', display: 'inline-block' }}>
          {availablePermissions.map((perm, index) => (
            <label
              key={perm}
              style={{
                display: 'block',
                margin: '8px 0',
                fontSize: '1.1em'
              }}
            >
              <input
                type="checkbox"
                style={{
                  transform: 'scale(1.8)',
                  marginRight: '8px'
                }}
                checked={permissions[index]}
                onChange={() => handleCheckboxChange(index)}
                aria-label={`Permission ${perm}`}
              />
              {perm}
            </label>
          ))}
        </div>
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
            <button onClick={handleSave} disabled={isSaving} style={{ marginRight: '16px' }} aria-label="Save permissions">
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={onClose} aria-label="Go back to advisor search results">
              Back to Results
            </button>
          </div>
          {saveSuccess && (
            <p style={{ color: 'green', margin: 0 }} aria-live="polite">
              {saveSuccess}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="global-settings">
      <div>
        <h2 ref={headingRef} tabIndex={0} aria-label="Advisor Lookup and Access Control">
          Advisor Lookup and Access Control
        </h2>
      </div>
      <div>
        <input 
          type="text"
          placeholder="Enter Advisor Name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search for an advisor by name"
        />
      </div>
      <div>
        {selectedAdvisor ? (
          <h2 tabIndex={0} aria-label="Edit Advisor Permissions">Edit Advisor Permissions:</h2>
        ) : (
          <h2 tabIndex={0} aria-label="Advisor Search Results">Search Results:</h2>
        )}
      </div>
      <div>
        {selectedAdvisor ? (
          <AdvisorCard 
            advisor={selectedAdvisor} 
            onClose={() => setSelectedAdvisor(null)} 
          />
        ) : (
          <CardView 
            advisors={searchResults}
            skip={currentPage * 9}
            take={(currentPage + 1) * 9}
          />
        )}
      </div>
      <div>
        {selectedAdvisor ? null : (
          <PaginationButtons/>
        )}
      </div>
    </div>
  );
}

export default GlobalSettings;
