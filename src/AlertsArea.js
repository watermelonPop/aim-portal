// AlertsArea.jsx
import React, { useEffect, useState } from 'react';
import './App.css';

export default function AlertsArea() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch('/api/getImportantDates');
        if (!res.ok) throw new Error('Failed to fetch important dates');
        const data = await res.json();
        setAlerts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  // Show the first 5 upcoming dates
  const upcomingFive = alerts.slice(0, 5);

  return (
    <div className="alertsArea">
      <h3>Alerts</h3>
      {loading ? (
        <p>Loading alerts...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : alerts.length === 0 ? (
        <p>No alerts available.</p>
      ) : (
        <div>
          <ul className="alertsList">
            {upcomingFive.map((alert) => (
              <li key={alert.id} className="alertItem">
                <span className="alertName">{alert.name}</span>
                <span className="alertDate">
                  {new Date(alert.date).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
          {alerts.length > 5 && (
            <button className="viewAllBtn" onClick={() => setIsModalOpen(true)}>
              View All
            </button>
          )}
        </div>
      )}
      {isModalOpen && (
        <div className="modalOverlay" onClick={() => setIsModalOpen(false)}>
          <div className="modalContent alertsModal" onClick={(e) => e.stopPropagation()}>
            <h2>All Alerts</h2>
            {/* Added a scrollable container */}
            <div className="alertsListContainer">
              <ul className="alertsList">
                {alerts.map((alert) => (
                  <li key={alert.id} className="alertItem">
                    <span className="alertName">{alert.name}</span>
                    <span className="alertDate">
                      {new Date(alert.date).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <button className="modalCloseBtn" onClick={() => setIsModalOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
