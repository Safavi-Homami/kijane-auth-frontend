import React from "react";
import "../../styles/FormStyles.css";

const FormStepper = ({ currentStep }) => {
  const steps = ["Allgemein", "Rolle", "Zugang", "Aktivierung"];

  return (
    <div className="stepper-container">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep === stepNumber;
        const isCompleted = currentStep > stepNumber;

        return (
          <div
            key={index}
            className={`step ${isActive ? "active" : ""} ${
              isCompleted ? "completed" : ""
            }`}
          >
            <div className="step-number">{stepNumber}</div>
            <div className="step-label">{step}</div>
          </div>
        );
      })}
    </div>
  );
};

export default FormStepper;


/*
import React from 'react';


const FormStepper = ({ currentStep }) => {
const steps = ["Allgemein", "Rolle", "Bestätigung", "Aktivierung"];

  return (
    <div className="stepper-container">
      {steps.map((step, index) => (
        <div key={index} className={`step ${currentStep === index + 1 ? 'active' : ''}`}>
          <div className="circle">{index + 1}</div>
          <div className="label">{step}</div>
        </div>
      ))}
    </div>
  );
};

export default FormStepper;
*/