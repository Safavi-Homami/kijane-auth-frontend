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
        console.error("Verifizierungsfehler:", err);

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


/*

// src/pages/VerifyEmail.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "@/api";

const VerifyEmail = () => {
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
          setMessage("✅ E-Mail erfolgreich verifiziert! Weiterleitung...");
          setTimeout(() => navigate("/login"), 3000);
        }

        setError(false);
      })
      .catch((err) => {
        console.error("Verifizierungsfehler:", err);
        if (err.response?.status === 400) {
          setMessage("❌ Ungültiger oder abgelaufener Aktivierungscode.");
        } else if (err.response?.status === 401) {
          setMessage("❌ Nicht autorisiert.");
        } else {
          setMessage("❌ Fehler bei der E-Mail-Verifizierung.");
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

export default VerifyEmail;
*/

/*
// src/pages/VerifyEmail.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "@/api";

const VerifyEmail = () => {
  const [message, setMessage] = useState("Verifiziere deine E-Mail...");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      API.get(`/auth/verify-email?code=${code}`)
        .then(() => {
          setMessage("✅ E-Mail erfolgreich verifiziert! Weiterleitung...");
          setTimeout(() => navigate("/login"), 3000);
        })
        .catch((error) => {
          console.error("Verifizierungsfehler:", error);
          setMessage("❌ Fehler bei der E-Mail-Verifizierung.");
        });
    } else {
      setMessage("⚠️ Kein Code in der URL gefunden.");
    }
  }, [searchParams, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>E-Mail Verifizierung</h2>
      <p>{message}</p>
    </div>
  );
};
export default VerifyEmail;


*/
/*
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../api'; // zentrale Axios-Instanz

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("Bitte warten...");
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setMessage("Kein Aktivierungscode gefunden.");
      return;
    }

    API.get(`/auth/verify-email?code=${code}`)
      .then(() => {
        setMessage("Deine E-Mail wurde erfolgreich bestätigt! 🎉");
        setTimeout(() => navigate("/login"), 3000); // automatische Weiterleitung
      })
      .catch((err) => {
        setMessage("Fehler bei der E-Mail-Verifizierung.");
        console.error("Verifizierungsfehler:", err);
      });
  }, []);

  return (
    <div className="verify-email-container">
      <h2>E-Mail Verifizierung</h2>
      <p>{message}</p>
    </div>
  );
};

export default VerifyEmail;
*/