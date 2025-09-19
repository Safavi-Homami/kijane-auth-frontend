import React, { useState } from "react";
import api from "../../api"; // falls api.js im src-Ordner liegt
import "../../style.css";

const PasswordResetRequest = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await api.post("/password/reset/request", { email });
      setMessage("Reset-Code wurde an deine E-Mail gesendet.");
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError("Benutzer nicht gefunden.");
      } else {
        setError("Fehler beim Senden der Anfrage.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Passwort zurücksetzen</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">E-Mail-Adresse:</label>
        <input
          type="email"
          id="email"
          placeholder="Deine E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Sende..." : "Reset-Code anfordern"}
        </button>
      </form>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default PasswordResetRequest;
