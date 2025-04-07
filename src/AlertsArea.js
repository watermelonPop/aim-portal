import React, { useEffect, useState, useRef } from 'react';

export default function AlertsArea() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef(null);

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
    if (isModalOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isModalOpen]);

  const handleModalKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsModalOpen(false);
    } else if (e.key === 'Tab') {
      const focusableElements = modalRef.current.querySelectorAll(
        'a, button, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    }
  };

  return (
    <div className="alertsArea" data-testid="alerts-area">
      {/* Make the heading focusable so that users hear "Alerts" before the list */}
      <h3 tabIndex={0}>Alerts</h3>
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
              <li key={alert.id} className="alertItem" tabIndex={0}>
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
            tabIndex={0}
            ref={modalRef}
            onKeyDown={handleModalKeyDown}
          >
            <h2 id="alerts-modal-heading" tabIndex={0}>All Alerts</h2>
            <div className="alertsListContainer" tabIndex={0}>
              <ul className="alertsList">
                {alerts.map((alert) => (
                  <li key={alert.id} className="alertItem" tabIndex={0}>
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
