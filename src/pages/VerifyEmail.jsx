// src/pages/VerifyEmail.jsx
import React, {useEffect} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from '@api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const navigate = useNavigate();

  useEffect(() => {
    if (!code) return;

    api.post(`/auth/confirm`, null, {
      params: { code },
    })
      .then(() => {
        navigate("/success");
      })
      .catch((err) => {
        console.error("Fehler bei der Bestätigung:", err);
        alert("Aktivierungslink ungültig oder abgelaufen.");
      });
  }, [code, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <p>✅ E-Mail wird bestätigt...</p>
    </div>
  );
}