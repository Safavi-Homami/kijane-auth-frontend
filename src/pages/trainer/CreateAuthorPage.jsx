// src/pages/trainer/CreateAuthorPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";

export default function CreateAuthorPage({ onClose }) { 
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const [errors, setErrors] = useState({});
const [touched, setTouched] = useState({});

useEffect(() => {
  setErrors({
    firstName: validateField("firstName", firstName),
    lastName: validateField("lastName", lastName),
  });
}, [firstName, lastName]);




const validateField = (name, value) => {
  let error = "";

  if (name === "firstName") {
    if (!value.trim()) error = "Vorname ist erforderlich";
    else if (value.trim().length < 2) error = "Mindestens 2 Zeichen";
  }

  if (name === "lastName") {
    if (!value.trim()) error = "Nachname ist erforderlich";
    else if (value.trim().length < 2) error = "Mindestens 2 Zeichen";
  }

  return error;
};

  const navigate = useNavigate();

  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValid) return;

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();

   
   const payload = {
      displayName: `${trimmedFirst} ${trimmedLast}`,
    };


    

    try {
  setIsSaving(true);
  setError(null);

  const response = await api.post("/authors", payload);

  

  // ✅ NACH Erfolg zurück zum Kurs-Formular
            if (onClose) {
                  onClose(response.data.id); 
            } 
            else {

            navigate(`/trainer?authorId=${response.data.id}`, {
              replace: true,
              state: {
                authorCreated: true,
                authorName: response.data.name,
              },
            }
            );
          }
    
} catch (err) {

      console.error("Fehler beim Anlegen eines Autors:", err);
      if (err.response) {
        const { status, data } = err.response;
        console.error("Autor-Anlegen-Fehler-Details:", status, data);

        // Spezieller Fall: AlreadyAuthorException (ApiError)
        if (status === 409 && data?.error === "already_author") {
          setError(data.message || "Du bist bereits als Author registriert.");
        } else if (status === 401 || status === 403) {
          // Auth-/Rechte-Problem
          setError(
            "Du bist nicht berechtigt, einen Autor anzulegen. Bitte erneut anmelden."
          );
        } else {
          // generischer Fehlertext, falls kein spezieller Fall
          const serverMessage =
            data?.message ||
            "Autor konnte nicht angelegt werden. Bitte später erneut versuchen.";
          setError(serverMessage);
        }
      } else {
        // kein response-Objekt -> Netzwerkfehler o.Ä.
        setError(
          "Es ist ein Verbindungsfehler aufgetreten. Bitte prüfe deine Netzwerkverbindung und versuche es erneut."
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  const isValid =
  firstName.trim().length >= 2 &&
  lastName.trim().length >= 2 &&
  !errors.firstName &&
  !errors.lastName;

  return (
    <div
      style={{
        maxWidth: "640px",
        margin: "3rem auto",
        padding: "2rem",
        borderRadius: "16px",
        backgroundColor: "#ffffff",
        boxShadow: "0 20px 45px rgba(15, 23, 42, 0.08)",
      }}
    >
      <h1
        style={{
          fontSize: "1.8rem",
          fontWeight: 600,
          textAlign: "center",
          marginBottom: "1.5rem",
        }}
      >
        Neuen Autor anlegen
      </h1>

      <form onSubmit={handleSubmit}>
        {/* Vorname */}
        <label
          style={{
            display: "block",
            textAlign: "left",
            fontWeight: 500,
            marginBottom: "0.25rem",
          }}
        >
          Vorname
        </label>
       <input
  type="text"
  placeholder="z.B. Helmuth"
  value={firstName}
  onChange={(e) => {
    setFirstName(e.target.value);
    const err = validateField("firstName", e.target.value);
    setErrors(prev => ({ ...prev, firstName: err }));
  }}
  onBlur={() => setTouched(prev => ({ ...prev, firstName: true }))}
/>

{touched.firstName && errors.firstName && (
  <div style={{ color: "red", fontSize: "12px" }}>
    {errors.firstName}
  </div>
)}
        {/* Nachname */}
        <label
          style={{
            display: "block",
            textAlign: "left",
            fontWeight: 500,
            marginBottom: "0.25rem",
          }}
        >
          Nachname
        </label>
        <input
  type="text"
  placeholder="z.B. Schmidt"
  value={lastName}
  onChange={(e) => {
    setLastName(e.target.value);
    const err = validateField("lastName", e.target.value);
    setErrors(prev => ({ ...prev, lastName: err }));
  }}
  onBlur={() => setTouched(prev => ({ ...prev, lastName: true }))}
/>

{touched.lastName && errors.lastName && (
  <div style={{ color: "red", fontSize: "12px" }}>
    {errors.lastName}
  </div>
)}

        {error && (
          <div
            style={{
              color: "#dc2626",
              fontSize: "0.9rem",
              marginBottom: "0.75rem",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>

  <button

    type="button"  
    onClick={() => onClose()}
    style={{
      flex: 1,
      color: "#111",
      padding: "10px",
      borderRadius: "10px",
      background: "#e5e7eb"
    }}
  >
    ❌ Abbrechen
  </button>

 <button
  type="submit"
disabled={!isValid || isSaving}
  style={{
    flex: 1,
    padding: "10px",
    borderRadius: "10px",
    background: isValid ? "#2563eb" : "#93c5fd",
    color: "white",
    cursor: isValid ? "pointer" : "not-allowed",
    opacity: isValid ? 1 : 0.6
  }}
>
  💾 Autor speichern
</button>

</div>
      </form>
    </div>
  );
}
