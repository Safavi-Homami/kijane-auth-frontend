import React, { useState } from "react";
import { sendActivationCode } from "@/api";
import api from "@/api";
import "../../styles/FormStyles.css";

const Step4Activation = ({ formData, onSubmit }) => {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [mailSent, setMailSent] = useState(false);

  const handleSendCode = async () => {
    try {
      setError("");
      setMessage("");
      const email = formData.email?.trim().toLowerCase();
      if (!email) {
        setError("E-Mail-Adresse fehlt.");
        return;
      }

      
      await sendActivationCode(email);
      setMailSent(true);
      setMessage("Aktivierungscode wurde gesendet.");
    } catch (err) {
      console.error("❌ Fehler beim Mailversand:", err);
      setError("Fehler beim Versenden des Aktivierungscodes.");
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    try {
      const email = formData.email?.trim().toLowerCase();
      const trimmedCode = code.trim();

      if (!email || !trimmedCode) {
        setError("Bitte gib einen gültigen Aktivierungscode ein.");
        return;
      }

      const response = await api.post("/auth/confirm", {
        email: email,
        activationCode: trimmedCode,
      });

      if (response?.data) {
        setMessage("✅ Aktivierung erfolgreich!");
        setError("");
        onSubmit(); // z.B. Weiterleitung zur Login-Seite
      } else {
        setError("❌ Keine Antwort vom Server.");
        setMessage("");
      }
    } catch (err) {
      console.error("❌ Fehler bei der Bestätigung:", err);
      const backendMessage =
        err.response?.data?.message || "Fehler bei der Aktivierung.";
      setError(backendMessage);
      setMessage("");
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Aktiviere deinen Account</h2>

      {!mailSent ? (
        <button className="btn-primary" onClick={handleSendCode}>
          📩 Aktivierungscode senden
        </button>
      ) : (
        <form onSubmit={handleConfirm}>
          <label className="form-label">Aktivierungscode:</label>
          <input
            className="form-input"
            type="text"
            name="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Code eingeben"
            required
          />

          <button className="btn-primary" type="submit">
            ✅ Bestätigen
          </button>
        </form>
      )}

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Step4Activation;
