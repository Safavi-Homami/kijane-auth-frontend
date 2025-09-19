import React, { useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";

const ConfirmTwoFaReset = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await api.post("/auth/confirm-2fa-reset", {
        email,
        code,
      });
      setMessage(response.data.message || "2FA wurde erfolgreich zurückgesetzt.");

      // Optional: Automatisch weiter zur Login-Seite
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      console.error("Fehler bei der Bestätigung:", err);
      setError("Code ungültig oder abgelaufen.");
    }
  };

  return (
    <div className="form-container">
      <h2>2FA-Reset bestätigen</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">E-Mail-Adresse:</label>
        <input
          type="email"
          id="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="code">Bestätigungscode:</label>
        <input
          type="text"
          id="code"
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <button type="submit">Code bestätigen</button>
          <p style={{ marginTop: "1rem" }}>
            Code nicht erhalten? <Link to="/request-2fa-reset">Hier neuen Code anfordern</Link>
          </p>


      </form>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default ConfirmTwoFaReset;
