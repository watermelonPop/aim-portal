import React, { useEffect, useState, useRef } from 'react';

export default function AlertsArea({displayHeaderRef}) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef(null);
  const alertRef = useRef(null);

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

  const upcomingFive = alerts.slice(0, 5);

  // When the alerts modal opens, move focus into it.
  useEffect(() => {
    if (isModalOpen && alertRef.current) {
      alertRef.current.focus();
    }
  }, [isModalOpen]);

  const handleModalKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsModalOpen(false);
      displayHeaderRef.current.focus();
    } 
  };

  return (
    <div className="alertsArea" data-testid="alerts-area">
      {/* Make the heading focusable so that users hear "Alerts" before the list */}
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
            <button
              className="viewAllBtn"
              onClick={() => setIsModalOpen(true)}
              aria-haspopup="dialog"
            >
              View All
            </button>
          )}
        </div>
      )}
      {isModalOpen && (
        <div
          className="modalOverlay"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="modalContent alertsModal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="alerts-modal-heading"
            ref={modalRef}
            onKeyDown={handleModalKeyDown}
          >
            <h2 id="alerts-modal-heading">All Alerts</h2>
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
            <button ref={alertRef} className="modalCloseBtn" onClick={() => {
              setIsModalOpen(false);
              displayHeaderRef.current.focus();
            }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
