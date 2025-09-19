import React from "react";
import { registerUser } from "@/api";
import { useNavigate } from "react-router-dom";

const RegisterForm = ({ formData }) => {
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const response = await registerUser(formData);
      sessionStorage.setItem("token", response.data.token);
      sessionStorage.setItem("username", response.data.username); // wichtig für send-code
      navigate("/register/activate"); // Weiterleitung zu Schritt 2
    } catch (error) {
      console.error("❌ Registrierung fehlgeschlagen:", error);
    }
  };

  return (
    <button className="btn" onClick={handleRegister}>
      Jetzt registrieren
    </button>
  );
};

export default RegisterForm;
