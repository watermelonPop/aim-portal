import './App.css';
import { useEffect, useState } from 'react';

// List of all possible responsibilities
const responsibilitiesList = [
    "Global settings",
    "Accommodation modules",
    "Note Taking modules",
    "Assistive tech modules",
    "Accessible testing modules",
    "Student case information"
  ];
  
  function GlobalSettings() {
    // Sample advisors – in a real app you might fetch these from an API.
    const [advisors, setAdvisors] = useState([
      { id: 1, name: "Alice Johnson", role: "Coordinator", responsibilities: ["Accommodation modules", "Note Taking modules"] },
      { id: 2, name: "Bob Smith", role: "Technology Advisor", responsibilities: ["Assistive tech modules"] },
      { id: 3, name: "Charlie Davis", role: "Testing Proctor", responsibilities: ["Accessible testing modules", "Student case information"] }
    ]);
  
    // Handler to update an advisor’s role.
    const updateAdvisorRole = (id, newRole) => {
      const updatedAdvisors = advisors.map(advisor => 
        advisor.id === id ? { ...advisor, role: newRole } : advisor
      );
      setAdvisors(updatedAdvisors);
      // TODO: Optionally, make an API call to persist this change.
    };
  
    // Handler to toggle a specific responsibility for an advisor.
    const updateAdvisorResponsibilities = (id, responsibility) => {
      const updatedAdvisors = advisors.map(advisor => {
        if (advisor.id === id) {
          const hasResp = advisor.responsibilities.includes(responsibility);
          return {
            ...advisor,
            responsibilities: hasResp 
              ? advisor.responsibilities.filter(r => r !== responsibility)
              : [...advisor.responsibilities, responsibility]
          };
        }
        return advisor;
      });
      setAdvisors(updatedAdvisors);
      // TODO: Optionally, send updated data to your backend.
    };
  
    return (
      <div className="global-settings">
        <h2>Global Settings – Manage Advisor Responsibilities</h2>
        <table className="global-settings-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Responsibilities</th>
            </tr>
          </thead>
          <tbody>
            {advisors.map(advisor => (
              <tr key={advisor.id}>
                <td>{advisor.name}</td>
                <td>
                  <select
                    value={advisor.role}
                    onChange={(e) => updateAdvisorRole(advisor.id, e.target.value)}
                  >
                    <option value="Coordinator">Coordinator</option>
                    <option value="Technology Advisor">Technology Advisor</option>
                    <option value="Testing Proctor">Testing Proctor</option>
                    <option value="Admin">Admin</option>
                  </select>
                </td>
                <td>
                  {responsibilitiesList.map((resp, idx) => (
                    <label key={idx} style={{ display: 'block' }}>
                      <input
                        type="checkbox"
                        checked={advisor.responsibilities.includes(resp)}
                        onChange={() => updateAdvisorResponsibilities(advisor.id, resp)}
                      />
                      {resp}
                    </label>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  
  export default GlobalSettings;