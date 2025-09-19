import React, { useState } from "react";
import FormStepper from "./FormStepper";
import "../../styles/FormStyles.css";

const Step3Credentials = ({ formData, setFormData, onBack, onSubmit }) => {
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmVisibility = () => {
    setShowConfirm((prev) => !prev);
  };

  const validate = () => {
    const newErrors = {};
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?]).{8,}$/;

    if (!formData.password || !passwordRegex.test(formData.password)) {
      newErrors.password =
        "Passwort muss mindestens 8 Zeichen lang sein und mindestens 1 Großbuchstaben, 1 Zahl und 1 Sonderzeichen enthalten.";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwörter stimmen nicht überein.";
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms =
        "Sie müssen den AGB und Datenschutzbedingungen zustimmen.";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      onSubmit(e); // Übergabe an übergeordnetes Register-Formular
    }
  };

  return (
    <div className="form-container">
      <FormStepper currentStep={3} />
      <h2 className="form-title">Zugangsdaten und Zustimmung</h2>

      <form onSubmit={handleSubmit}>
        <label className="form-label required">Passwort</label>
        <div className="password-wrapper">
          <input
            className="form-input"
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password || ""}
            onChange={handleChange}
            required
          />
          <span
            className="password-toggle"
            onClick={togglePasswordVisibility}
            title={showPassword ? "Verbergen" : "Anzeigen"}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>
        <small className="info">
          Mindestens 8 Zeichen, 1 Großbuchstabe, 1 Zahl, 1 Sonderzeichen.
        </small>
        {errors.password && <p className="error-text">{errors.password}</p>}

        <label className="form-label required">Passwort wiederholen</label>
        <div className="password-wrapper">
          <input
            className="form-input"
            type={showConfirm ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword || ""}
            onChange={handleChange}
            required
          />
          <span
            className="password-toggle"
            onClick={toggleConfirmVisibility}
            title={showConfirm ? "Verbergen" : "Anzeigen"}
          >
            {showConfirm ? "🙈" : "👁️"}
          </span>
        </div>
        {errors.confirmPassword && (
          <p className="error-text">{errors.confirmPassword}</p>
        )}

        <label className="form-label checkbox-label">
          <input
            type="checkbox"
            name="agreeTerms"
            checked={formData.agreeTerms || false}
            onChange={handleChange}
          />
          Ich stimme den AGB und Datenschutzbedingungen zu.
        </label>
        {errors.agreeTerms && (
          <p className="error-text">{errors.agreeTerms}</p>
        )}

        <label className="form-label checkbox-label">
          <input
            type="checkbox"
            name="newsletter"
            checked={formData.newsletter || false}
            onChange={handleChange}
          />
          Ich möchte den Newsletter erhalten.
        </label>

        <div className="form-button-group">
          <button type="button" className="btn-secondary" onClick={onBack}>
            Zurück
          </button>
          <button type="submit" className="btn-primary">
            Registrieren
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step3Credentials;

