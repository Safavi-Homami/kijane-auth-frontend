import React, { useState } from "react";
import FormStepper from "./FormStepper";
import "../../styles/FormStyles.css";

const Step1General = ({ formData, handleChange, nextStep }) => {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'Vorname ist erforderlich';
    if (!formData.lastName.trim()) newErrors.lastName = 'Nachname ist erforderlich';
    if (!formData.email.trim()) newErrors.email = 'E-Mail ist erforderlich';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Ungültige E-Mail-Adresse';
    if (!formData.street.trim()) newErrors.street = 'Straße und Hausnummer sind erforderlich';
    if (!formData.zip.trim()) newErrors.zip = 'PLZ ist erforderlich';
    if (!formData.city.trim()) newErrors.city = 'Stadt ist erforderlich';
    if (!formData.country.trim()) newErrors.country = 'Land ist erforderlich';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      nextStep();
    }
  };

  return (
    <div className="form-container">
      <FormStepper currentStep={1} />
      <h2 className="form-title">Allgemeine Angaben</h2>

      <form onSubmit={handleSubmit}>
        <label className="form-label">Vorname*:
          <input
            className="form-input"
            type="text"
            name="firstName"
            value={formData.firstName || ''}
            onChange={handleChange}
            required
          />
          {errors.firstName && <span className="error-text">{errors.firstName}</span>}
        </label>

        <label className="form-label">Nachname*:
          <input
            className="form-input"
            type="text"
            name="lastName"
            value={formData.lastName || ''}
            onChange={handleChange}
            required
          />
          {errors.lastName && <span className="error-text">{errors.lastName}</span>}
        </label>

        <label className="form-label">E-Mail*:
          <input
            className="form-input"
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            required
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </label>

        <label className="form-label">Telefonnummer (optional):
          <input
            className="form-input"
            type="tel"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
          />
        </label>

        <label className="form-label">Straße und Hausnummer:
          <input
            className="form-input"
            type="text"
            name="street"
            value={formData.street || ''}
            onChange={handleChange}
          />
          {errors.street && <span className="error-text">{errors.street}</span>}
        </label>

        <label className="form-label">PLZ:
          <input
            className="form-input"
            type="text"
            name="zip"
            value={formData.zip || ''}
            onChange={handleChange}
          />
          {errors.zip && <span className="error-text">{errors.zip}</span>}
        </label>

        <label className="form-label">Stadt:
          <input
            className="form-input"
            type="text"
            name="city"
            value={formData.city || ''}
            onChange={handleChange}
          />
          {errors.city && <span className="error-text">{errors.city}</span>}
        </label>

        <label className="form-label">Land:
          <input
            className="form-input"
            type="text"
            name="country"
            value={formData.country || ''}
            onChange={handleChange}
          />
          {errors.country && <span className="error-text">{errors.country}</span>}
        </label>

        <div className="form-button-group">
          <button type="submit" className="btn-primary">Weiter</button>
        </div>
      </form>
    </div>
  );
};

export default Step1General;

/*
import React, { useState } from "react";
import FormStepper from "./FormStepper";
import "../../styles/FormStyles.css";

// Alias für styles

const Step1General = ({ formData, handleChange, nextStep }) => {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'Vorname ist erforderlich';
    if (!formData.lastName.trim()) newErrors.lastName = 'Nachname ist erforderlich';
    if (!formData.email.trim()) newErrors.email = 'E-Mail ist erforderlich';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Ungültige E-Mail-Adresse';
    if (!formData.street.trim()) newErrors.street = 'Straße und Hausnummer sind erforderlich';
    if (!formData.zip.trim()) newErrors.zip = 'PLZ ist erforderlich';
    if (!formData.city.trim()) newErrors.city = 'Stadt ist erforderlich';
    if (!formData.country.trim()) newErrors.country = 'Land ist erforderlich';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      nextStep();
    }
  };

  return (
    <div className="form-container">
      <FormStepper currentStep={1} />
      <h2>Allgemeine Angaben</h2>

      <form onSubmit={handleSubmit}>
        <label>
          Vorname*:
          <input
            type="text"
            name="firstName"
            value={formData.firstName || ''}
            onChange={handleChange}
            required
          />
          {errors.firstName && <span className="error">{errors.firstName}</span>}
        </label>

        <label>
          Nachname*:
          <input
            type="text"
            name="lastName"
            value={formData.lastName || ''}
            onChange={handleChange}
            required
          />
          {errors.lastName && <span className="error">{errors.lastName}</span>}
        </label>

        <label>
          E-Mail*:
          <input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            required
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </label>

        <label>
          Telefonnummer (optional):
          <input
            type="tel"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
          />
        </label>

        <label>
          Straße und Hausnummer:
          <input
            type="text"
            name="street"
            value={formData.street || ''}
            onChange={handleChange}
          />
          {errors.street && <span className="error">{errors.street}</span>}
        </label>

        <label>
          PLZ:
          <input
            type="text"
            name="zip"
            value={formData.zip || ''}
            onChange={handleChange}
          />
          {errors.zip && <span className="error">{errors.zip}</span>}
        </label>

        <label>
          Stadt:
          <input
            type="text"
            name="city"
            value={formData.city || ''}
            onChange={handleChange}
          />
          {errors.city && <span className="error">{errors.city}</span>}
        </label>

        <label>
          Land:
          <input
            type="text"
            name="country"
            value={formData.country || ''}
            onChange={handleChange}
          />
          {errors.country && <span className="error">{errors.country}</span>}
        </label>

        <button type="submit">Weiter</button>
      </form>
    </div>
  );
};

export default Step1General;
*/