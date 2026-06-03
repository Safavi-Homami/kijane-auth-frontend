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
  salutation: "",
  title: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  companyName: "",
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

  if (!formData.salutation?.trim()) {
    newErrors.salutation = "Anrede ist erforderlich.";
  }

  if (!formData.firstName?.trim()) {
    newErrors.firstName = "Vorname ist erforderlich.";
  }

  if (!formData.lastName?.trim()) {
    newErrors.lastName = "Nachname ist erforderlich.";
  }

  if (!formData.email?.trim()) {
    newErrors.email = "E-Mail ist erforderlich.";
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    newErrors.email = "Ungültige E-Mail-Adresse.";
  }

  if (!formData.phone?.trim()) {
    newErrors.phone = "Telefon / Mobilnummer ist erforderlich.";
  }

  if (!formData.street?.trim()) {
    newErrors.street = "Straße und Hausnummer sind erforderlich.";
  }

  if (!formData.zip?.trim()) {
    newErrors.zip = "PLZ ist erforderlich.";
  }

  if (!formData.city?.trim()) {
    newErrors.city = "Stadt ist erforderlich.";
  }

  if (!formData.country?.trim()) {
    newErrors.country = "Land ist erforderlich.";
  }

  if (!formData.role) {
    newErrors.role = "Nutzungsart ist erforderlich.";
  }

  if (formData.role === "STUDENT" && !formData.education?.trim()) {
    newErrors.education = "Bildungsstatus ist erforderlich.";
  }

  if (formData.role === "TRAINER" && !formData.qualification?.trim()) {
    newErrors.qualification = "Qualifikation ist erforderlich.";
  }

  if (!formData.password) {
    newErrors.password = "Passwort ist erforderlich.";
  } else if (
    !/(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}/.test(formData.password)
  ) {
    newErrors.password =
      "Passwort muss mindestens 8 Zeichen, 1 Großbuchstaben, 1 Zahl und 1 Sonderzeichen enthalten.";
  }

  if (formData.password !== formData.confirmPassword) {
    newErrors.confirmPassword = "Passwörter stimmen nicht überein.";
  }

  if (!formData.agreeTerms) {
    newErrors.agreeTerms = "Du musst den AGB zustimmen.";
  }

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
  email: formData.email.trim().toLowerCase(),

  salutation: formData.salutation,
  title: formData.title?.trim() || "",

  firstName: formData.firstName.trim(),
  lastName: formData.lastName.trim(),
  phone: formData.phone.trim(),

  companyName: formData.companyName?.trim() || "",

  streetName: formData.street.trim(),
  zipCode: formData.zip.trim(),
  city: formData.city.trim(),
  country: formData.country.trim(),

  role: formData.role,
  qualification: formData.qualification?.trim() || "",
  education: formData.education?.trim() || "",
  motivation: formData.motivation?.trim() || "",

  password: formData.password,
  confirmPassword: formData.confirmPassword,

  agreeTerms: formData.agreeTerms,
  newsletter: formData.newsletter,
};

      const response = await registerUser(adjustedData);

// WICHTIG: Registrierung erzeugt keinen Login-Token.
// Deshalb keinen Token speichern.
sessionStorage.removeItem("token");
sessionStorage.setItem("username", adjustedData.email);



setStep(4);
    } catch (error) {
      console.error("❌ Registrierung fehlgeschlagen!");
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
    <div className="auth-page-bg register-page-wrapper">
      <div className="auth-page-zoom">
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
  onSubmit={() => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("username");
    navigate("/login", {
      replace: true,
      state: {
        flash: {
          type: "success",
          message: "Account erfolgreich aktiviert. Bitte logge dich jetzt ein.",
        },
      },
    });
  }}
/>
          )}

          {errors.global && <p className="error-message">{errors.global}</p>}
        </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiStepRegister;

