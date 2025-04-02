import React from "react";
import "./App.css";

export default function PopupModal({ title, onClose, children }) {
  return (
    <div className="modalOverlay">
      <div className="modalContent">
        <h2>{title}</h2>
        <div className="modalBody">{children}</div>
        <button className="modalCloseBtn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
