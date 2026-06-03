// src/pages/VerifyEmail.jsx
import React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "@/api";

const VerifyEmailRegist = () => {
  const [message, setMessage] = useState("Verifiziere deine E-Mail...");
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setMessage("⚠️ Kein Code in der URL gefunden.");
      setError(true);
      return;
    }

    API.get(`/auth/verify-email?code=${code}`)
      .then((response) => {
        const msg = response.data;

        if (msg.includes("bereits bestätigt")) {
          setMessage("ℹ️ Diese E-Mail-Adresse wurde bereits verifiziert.");
        } else {
          setMessage("✅ E-Mail erfolgreich verifiziert! Du wirst weitergeleitet...");
          setTimeout(() => navigate("/login"), 3000);
        }

        setError(false);
      })
      .catch((err) => {
        console.error("Verifizierungsfehler!");

        if (err.response?.status === 400) {
          setMessage("❌ Ungültiger oder abgelaufener Aktivierungscode.");
        } else if (err.response?.status === 401) {
          setMessage("❌ Nicht autorisiert. Bitte versuche es erneut.");
        } else {
          setMessage("❌ Es ist ein Fehler bei der Verifizierung aufgetreten.");
        }

        setError(true);
      });
  }, [searchParams, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>E-Mail Verifizierung</h2>
      <p style={{ color: error ? "red" : "green", fontWeight: "bold" }}>{message}</p>
    </div>
  );
};

export default VerifyEmailRegist;

