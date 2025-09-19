// src/pages/Reset2faVerifyCode.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api";

export default function Reset2faVerifyCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email ?? "");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!code.trim()) {
      setError("Bitte gib den Bestätigungscode ein.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/confirm-2fa-reset", {
        email: email?.trim().toLowerCase() || undefined,
        code: code.trim(),
      });

      setSuccess(true);

      // kleine Pause und mit Flash-Text zum Login
      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: { info: "2FA wurde deaktiviert. Du kannst dich jetzt einloggen." },
        });
      }, 1500);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        "Ungültiger Code oder Fehler beim Bestätigen.";
      setError(typeof msg === "string" ? msg : "Unbekannter Fehler.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>2FA zurücksetzen – Code eingeben</h2>
      <p>Den Bestätigungscode hast du per E‑Mail erhalten.</p>
      <form onSubmit={handleSubmit}>
        {/* Email ist optional – nur nötig, wenn dein Backend sie verlangt */}
        <label>
          E‑Mail-Adresse (optional):
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="z. B. fred@example.com"
          />
        </label>

        <label>
          Bestätigungscode:
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Bestätige…" : "Bestätigen"}
        </button>
      </form>

      {success && <p className="success-msg">✅ 2FA wurde deaktiviert.</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}

