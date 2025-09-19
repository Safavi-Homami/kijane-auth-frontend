import React, { useState } from "react";
import Step1General from "./Step1General";
import Step2Role from "./Step2Role";
import Step3Credentials from "./Step3Credentials";
import Step4Activation from "./Step4Activation";
import { useNavigate } from "react-router-dom";
import "@/styles/FormStyles.css";
import { registerUser } from "@/api";

const MultiStepRegister = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    zip: "",
    city: "",
    country: "",
    role: "",
    qualification: "",
    education: "",
    motivation: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
    newsletter: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "Vorname ist erforderlich.";
    if (!formData.lastName.trim()) newErrors.lastName = "Nachname ist erforderlich.";
    if (!formData.email.includes("@")) newErrors.email = "Ungültige E-Mail-Adresse.";
    if (!formData.password)
      newErrors.password = "Passwort ist erforderlich.";
    else if (!/(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}/.test(formData.password))
      newErrors.password = "Passwort muss mindestens 8 Zeichen, 1 Großbuchstaben, 1 Zahl und 1 Sonderzeichen enthalten.";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwörter stimmen nicht überein.";
    if (!formData.agreeTerms)
      newErrors.agreeTerms = "Du musst den AGB zustimmen.";
    return newErrors;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({}); // Reset vorherige Fehler

    try {
      const adjustedData = {
        ...formData,
        username: formData.email.trim().toLowerCase(),
      };

      const response = await registerUser(adjustedData);
      sessionStorage.setItem("token", response.data.token);
      sessionStorage.setItem("username", adjustedData.username);
      console.log("✅ Registrierung erfolgreich:", response.data);

      setStep(4);
    } catch (error) {
      console.error("❌ Registrierung fehlgeschlagen:", error);
      const backendMessage = error?.response?.data?.message;
      setErrors({
        global: backendMessage || "Fehler bei der Registrierung. Bitte erneut versuchen.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    setErrors({});
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setErrors({});
    setStep((prev) => prev - 1);
  };

  return (
    <div className="register-container">
      {isLoading ? (
        <div className="spinner"></div>
      ) : (
        <>
          {step === 1 && (
            <Step1General
              formData={formData}
              handleChange={handleChange}
              nextStep={handleNext}
            />
          )}
          {step === 2 && (
            <Step2Role
              formData={formData}
              handleChange={handleChange}
              nextStep={handleNext}
              prevStep={handleBack}
            />
          )}
          {step === 3 && (
            <Step3Credentials
              formData={formData}
              setFormData={setFormData}
              onBack={handleBack}
              onSubmit={handleRegisterSubmit}
            />
          )}
          {step === 4 && (
            <Step4Activation
              formData={formData}
              onSubmit={() => navigate("/login")}
            />
          )}

          {errors.global && <p className="error-message">{errors.global}</p>}
        </>
      )}
    </div>
  );
};

export default MultiStepRegister;

