// src/pages/SuccessPage.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./SuccessPage.css";

export default function SuccessPage() {
  return (
    <div className="success-container">
      <h2>✅ Deine E-Mail wurde erfolgreich bestätigt!</h2>
      <p>Du kannst dich jetzt einloggen:</p>
      <Link to="/login" className="success-button">🔐 Login</Link>
    </div>
  );
}
