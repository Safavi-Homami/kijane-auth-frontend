import React, { useState } from "react";
import FormStepper from "./FormStepper";
import "../../styles/FormStyles.css";

const Step2Role = ({ formData, handleChange, nextStep, prevStep }) => {
  const [errors, setErrors] = useState({});
  const selectedRole = formData.role || "";

  const validate = () => {
    const newErrors = {};
    if (!formData.role) newErrors.role = "Bitte wählen Sie eine Rolle aus.";
    if (formData.role === "TRAINER" && !formData.qualification) {
      newErrors.qualification = "Qualifikation ist erforderlich.";
    }
    if (formData.role === "STUDENT" && !formData.education) {
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
      <h2 className="form-title">Rollen-Auswahl und Zusatzangaben</h2>

      <form onSubmit={handleSubmit}>
        <label className="form-label">Rolle auswählen*:
          <select
            name="role"
            className="form-input"
            value={formData.role || ""}
            onChange={handleChange}
            required
          >
            <option value="">-- Bitte wählen --</option>
            <option value="STUDENT">Student</option>
            <option value="TRAINER">Trainer</option>
            <option value="MANAGER">Manager</option>
            <option value="EDITOR">Editor</option>
            <option value="AUTHOR">Author</option>
          </select>
          {errors.role && <p className="error-text">{errors.role}</p>}
        </label>

        {selectedRole === "TRAINER" && (
          <>
            <label className="form-label">Beruf / Qualifikation*:
              <input
                className="form-input"
                type="text"
                name="qualification"
                value={formData.qualification || ""}
                onChange={handleChange}
                required
              />
              {errors.qualification && <p className="error-text">{errors.qualification}</p>}
            </label>

            <label className="form-label">Motivation (optional):
              <textarea
                className="form-input"
                name="motivation"
                value={formData.motivation || ""}
                onChange={handleChange}
              />
            </label>
          </>
        )}

        {selectedRole === "STUDENT" && (
          <label className="form-label">Bildungsstatus*:
            <input
              className="form-input"
              type="text"
              name="education"
              value={formData.education || ""}
              onChange={handleChange}
              required
            />
            {errors.education && <p className="error-text">{errors.education}</p>}
          </label>
        )}

        <div className="form-button-group">
          <button type="button" className="btn-secondary" onClick={prevStep}>Zurück</button>
          <button type="submit" className="btn-primary">Weiter</button>
        </div>
      </form>
    </div>
  );
};

export default Step2Role;

