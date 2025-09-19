import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api";
import "../../style.css";


const PasswordResetConfirm = () => {
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get("code") || "";

  const [code, setCode] = useState(initialCode);
  const [newPassword, setNewPassword] = useState("");
  const [validCode, setValidCode] = useState(null); // null = noch prüfen, true/false
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Code-Gültigkeit prüfen beim initialen Laden
  useEffect(() => {
    const checkCode = async () => {
      if (!initialCode) return;
      try {
        const res = await api.get(`/password/reset/check`, {
          params: { code: initialCode },
        });
        if (res.status === 200) {
          setValidCode(true);
        }
      } catch (err) {
        setValidCode(false);
        setError("Reset-Code ist ungültig oder abgelaufen.");
      }
    };
    checkCode();
  }, [initialCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await api.post("/password/reset/confirm", {
        code,
        newPassword,
      });
      setMessage("Passwort wurde erfolgreich geändert.");
    } catch (err) {
      setError("Fehler beim Zurücksetzen des Passworts.");
    } finally {
      setLoading(false);
    }
  };

  if (validCode === false) {
    return <p className="error">❌ Ungültiger oder abgelaufener Code</p>;
  }

  return (
    <div className="form-container">
      <h2>Passwort ändern</h2>
      {validCode === null && <p>Lade Codeprüfung...</p>}
      {validCode && (
        <form onSubmit={handleSubmit}>
          <label htmlFor="code">Reset-Code:</label>
          <input
            type="text"
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />

          <label htmlFor="newPassword">Neues Passwort:</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Sende..." : "Passwort ändern"}
          </button>
        </form>
      )}

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default PasswordResetConfirm;
