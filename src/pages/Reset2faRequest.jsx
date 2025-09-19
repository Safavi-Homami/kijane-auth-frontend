import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api"; // dein zentraler axios-Client

const Reset2faRequest = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Bitte gib deine E-Mail-Adresse ein.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/request-2fa-reset", 
        { email: email.trim().toLowerCase() },
        );

      navigate("/reset-2fa/verify", { state: { email: email.trim().toLowerCase() } });

    } catch (err) {
      setError(
        err.response?.data?.message || "Fehler beim Senden des Codes. Bitte versuche es erneut."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>2FA zurücksetzen</h2>
      <p>Gib deine E-Mail-Adresse ein. Du erhältst einen Bestätigungscode per Mail.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="E-Mail-Adresse"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Sende Code..." : "Bestätigen"}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default Reset2faRequest;
