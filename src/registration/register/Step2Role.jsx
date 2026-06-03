import React, { useState } from "react";
import FormStepper from "./FormStepper";
import "../../styles/FormStyles.css";

const Step2Role = ({ formData, handleChange, nextStep, prevStep }) => {
  const [errors, setErrors] = useState({});
  const selectedRole = formData.role || "";

  const validate = () => {
    const newErrors = {};

    if (!formData.role) {
      newErrors.role = "Bitte wählen Sie eine Nutzungsart aus.";
    }

    if (formData.role === "TRAINER" && !formData.qualification?.trim()) {
      newErrors.qualification = "Qualifikation ist erforderlich.";
    }

    if (formData.role === "STUDENT" && !formData.education?.trim()) {
      newErrors.education = "Bildungsstatus ist erforderlich.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      nextStep();
    }
  };

  return (
    <div className="form-container">
      <FormStepper currentStep={2} />

      <h2 className="form-title">Nutzungsart und Zusatzangaben</h2>

      <form onSubmit={handleSubmit}>
        <label className="form-label">
          Ich möchte mich registrieren als*:
          <select
            name="role"
            className="form-input"
            value={formData.role || ""}
            onChange={handleChange}
            required
          >
            <option value="">-- Bitte wählen --</option>
            <option value="STUDENT">Student / Teilnehmer</option>
            <option value="TRAINER">Als Trainer registrieren</option>
          </select>
          {errors.role && <p className="error-text">{errors.role}</p>}
        </label>

        {selectedRole === "TRAINER" && (
          <>
            <p className="form-hint">
                Hinweis: Als Trainer können Sie eigene Kurse erstellen und verwalten.
            </p>

            <label className="form-label">
              Beruf / Qualifikation*:
              <input
                className="form-input"
                type="text"
                name="qualification"
                value={formData.qualification || ""}
                onChange={handleChange}
                placeholder="z. B. Java Trainer, Softwareentwickler, Dozent"
                required
              />
              {errors.qualification && (
                <p className="error-text">{errors.qualification}</p>
              )}
            </label>

            <label className="form-label">
              Motivation / Thema optional:
              <textarea
                className="form-input"
                name="motivation"
                value={formData.motivation || ""}
                onChange={handleChange}
                placeholder="Kurz beschreiben, welche Kurse oder Themen Sie anbieten möchten."
              />
            </label>
          </>
        )}

        {selectedRole === "STUDENT" && (
          <label className="form-label">
            Bildungsstatus*:
            <input
              className="form-input"
              type="text"
              name="education"
              value={formData.education || ""}
              onChange={handleChange}
              placeholder="z. B. Schule, Studium, Berufstätig, Weiterbildung"
              required
            />
            {errors.education && (
              <p className="error-text">{errors.education}</p>
            )}
          </label>
        )}

        <div className="form-button-group">
          <button type="button" className="btn-secondary" onClick={prevStep}>
            Zurück
          </button>

          <button type="submit" className="btn-primary">
            Weiter
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step2Role;