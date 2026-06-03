import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api"; // ggf. Pfad anpassen
import { FaEye, FaEyeSlash } from "react-icons/fa";


const ChangePassword = () => {
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);


  const handlePasswordChange = async () => {
    // 1️⃣ Passwortvergleich vor API-Aufruf
    if (newPassword !== confirmPassword) {
      setErrorMessage("❌ Neue Passwörter stimmen nicht überein!");
      setSuccessMessage("");
      return;
    }

    try {
      await api.post("/auth/change-password", {
        oldPassword,
        newPassword,
      });

      // 2️⃣ Erfolgsmeldung
      setSuccessMessage("✅ Passwort wurde erfolgreich geändert. Du wirst abgemeldet...");
      setErrorMessage("");

      // 3️⃣ Token & User-Daten entfernen
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("username");
      sessionStorage.removeItem("user");

      // 4️⃣ Weiterleitung mit kurzer Verzögerung
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error("Fehler beim Passwortwechsel");
      const msg = error.response?.data?.message || "Unbekannter Fehler";
      setErrorMessage(`❌ Fehler: ${msg}`);
      setSuccessMessage("");
    }
  };

 return (
  <div className="auth-page-bg auth-form-page change-password-auth-page">
    <div className="auth-page-zoom">
      <div className="page-wrapper">
        <div className="form-container">

          <h2>🔐 Passwort ändern</h2>

      {successMessage && (
        <p style={{ color: "green" }}>{successMessage}</p>
      )}
      {errorMessage && (
        <p style={{ color: "red" }}>{errorMessage}</p>
      )}

    <label>Altes Passwort:</label>
      <div style={{ position: "relative" }}>
        <input
          type={showOld ? "text" : "password"}
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <span
          onClick={() => setShowOld(!showOld)}
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "pointer",
            fontSize: "1.2rem",
            userSelect: "none"
          }}
        >
          {showOld ? <FaEyeSlash /> : <FaEye />}
        </span>
      </div>

     <label>Neues Passwort:</label>
      <div style={{ position: "relative" }}>
        <input
          type={showNew ? "text" : "password"}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <span
          onClick={() => setShowNew(!showNew)}
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "pointer",
            fontSize: "1.2rem",
            userSelect: "none"
          }}
        >
          {showNew ? <FaEyeSlash /> : <FaEye />}
        </span>
      </div>
      <p className="password-hint">
        🔒 Mindestens 8 Zeichen, ein Großbuchstabe, ein Sonderzeichen.
      </p>
     <label>Neues Passwort bestätigen:</label>
      <div style={{ position: "relative" }}>
        <input
          type={showConfirm ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <span
          onClick={() => setShowConfirm(!showConfirm)}
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "pointer",
            fontSize: "1.2rem",
            userSelect: "none"
          }}
        >
          {showConfirm ? <FaEyeSlash /> : <FaEye />}
        </span>
      </div>

            <button onClick={handlePasswordChange}>
        Passwort ändern
      </button>

        </div>
      </div>
    </div>
  </div>
  );
};

export default ChangePassword;
