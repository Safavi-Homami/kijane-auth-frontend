import React, { useState } from "react";
import { sendActivationCode, confirmActivation } from "@/api";

const ConfirmActivation = () => {
  const [code, setCode] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const username = sessionStorage.getItem("username");

  const handleSendCode = async () => {
    setError("");
    setMessage("");
    try {
      await sendActivationCode(username);
      setMessage("📨 Aktivierungscode wurde gesendet.");
    } catch {
      setError("❌ Fehler beim Senden des Codes.");
    }
  };

  const handleConfirm = async () => {
    setError("");
    setMessage("");
    try {
      const response = await confirmActivation({
        username: username,
        code: code,
      });
      if (response.data.success) {
        setSuccess(true);
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("username");
      } else {
        setError("❌ Ungültiger Code.");
        setCode("");
      }
    } catch {
      setError("❌ Fehler bei der Bestätigung.");
    }
  };

  return (
    <div className="activation-container">
      <h2>Schritt 2: Konto aktivieren</h2>

      {!success && (
        <>
          <button onClick={handleSendCode}>📨 Code senden</button>
          <input
            type="text"
            placeholder="Aktivierungscode eingeben"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button onClick={handleConfirm}>✅ Bestätigen</button>
        </>
      )}

      {message && <p className="info">{message}</p>}
      {error && <p className="error">{error}</p>}
      {success && (
        <p className="success">
          ✅ Konto erfolgreich aktiviert! Du kannst dich jetzt einloggen.
        </p>
      )}
    </div>
  );
};

export default ConfirmActivation;
