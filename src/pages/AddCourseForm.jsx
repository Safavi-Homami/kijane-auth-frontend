import React, { useEffect, useState } from "react";
import api from "../api";
import { useUser } from "../context/useUser";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";

const COURSE_DRAFT_KEY = "add-course-draft";

export default function AddCourseForm({ onClose, authors: externalAuthors, newAuthorId }) {

  const { user } = useUser();
  const roles = user?.roles || [];
  const isAuthorized = roles.includes("ADMIN") || roles.includes("TRAINER");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [authorId, setAuthorId] = useState("");

  const authors = externalAuthors || [];

const loadingAuthors = !externalAuthors;

  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();  

  const [errors, setErrors] = useState({});
const [touched, setTouched] = useState({});

  /* --------------------------------------------------
     1️⃣ Draft beim Mount laden
  -------------------------------------------------- */
  useEffect(() => {
    const saved = sessionStorage.getItem(COURSE_DRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTitle(parsed.title || "");
        setDescription(parsed.description || "");
      } catch {
        sessionStorage.removeItem(COURSE_DRAFT_KEY);
      }
    }
  }, []);

  /* --------------------------------------------------
     2️⃣ Draft bei Änderungen speichern
  -------------------------------------------------- */
  useEffect(() => {
    sessionStorage.setItem(
      COURSE_DRAFT_KEY,
      JSON.stringify({ title, description })
    );
  }, [title, description]);


  useEffect(() => {
  setErrors({
    title: validateField("title", title),
    description: validateField("description", description),
    authorId: validateField("authorId", authorId),
  });
}, [title, description, authorId]);

  /* --------------------------------------------------
     3️⃣ Autoren laden + authorId aus URL
  -------------------------------------------------- */
 useEffect(() => {
  if (!externalAuthors) return;

  if (newAuthorId) {
    const exists = externalAuthors.find(
      (a) => String(a.id) === String(newAuthorId)
    );

    if (exists) {
      
      setAuthorId(String(newAuthorId));
    }

    return;
  }

  const idFromUrl = searchParams.get("authorId");

  if (idFromUrl && externalAuthors.some(a => String(a.id) === idFromUrl)) {
    setAuthorId(idFromUrl);

    if (!onClose) {
      navigate("/trainer", { replace: true });
    }
  }
}, [externalAuthors, newAuthorId]);


  if (!isAuthorized) {
    return (
      <p style={{ color: "red", fontWeight: 600 }}>
        Du hast keine Berechtigung, Kurse anzulegen.
      </p>
    );
  }

     
  const validateField = (name, value) => {
  let error = "";

  if (name === "title") {
    if (!value.trim()) error = "Titel ist erforderlich";
    else if (value.trim().length < 3) error = "Mindestens 3 Zeichen";
  }

  if (name === "description") {
    if (!value.trim()) error = "Beschreibung ist erforderlich";
    else if (value.trim().length < 10) error = "Mindestens 10 Zeichen";
  }

  if (name === "authorId") {
    if (!value) error = "Bitte Autor auswählen";
  }

  return error;
};


  /* --------------------------------------------------
     4️⃣ Kurs speichern (mit Validierung)
  -------------------------------------------------- */
 const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);
  setInfo(null);

  const newErrors = {
    title: validateField("title", title),
    description: validateField("description", description),
    authorId: validateField("authorId", authorId),
  };

  setErrors(newErrors);
  setTouched({
    title: true,
    description: true,
    authorId: true,
  });

  if (Object.values(newErrors).some(Boolean)) return;

  try {
   const res = await api.post("/courses", {
    title,
    description,
    authorIds: [Number(authorId)],
  });

  const createdCourse = res.data;

  sessionStorage.removeItem(COURSE_DRAFT_KEY);

  if (onClose) {
    onClose("saved", createdCourse);
  } else {
    navigate(`/courses/${createdCourse.id}`, {
      state: { editAfterCreate: true },
    });
  }
  } catch {
    setError("Kurs konnte nicht gespeichert werden.");
  }
};

const isValid =
  title.trim().length >= 3 &&
  description.trim().length >= 10 &&
  authorId &&
  !errors.title &&
  !errors.description &&
  !errors.authorId;

  const handleCreateAuthorClick = () => {
  setError(null);

  if (!title.trim() || !description.trim()) {
    setError("Bitte zuerst Titel und Beschreibung ausfüllen.");
    return;
  }

  if (onClose) {
    onClose("switch-to-author");
  }
};

  /* --------------------------------------------------
     UI
  -------------------------------------------------- */
  return (
    <div
          className="trainer-form-container"
          style={{
            maxWidth: "500px",
            margin: "0 auto",
            padding: "20px",
          }}
        >
      <form onSubmit={handleSubmit}>
        <h2>Neuen Kurs anlegen</h2>

        {error && (
          <div className="form-message error">
            ⚠️ {error}
          </div>
        )}

        {info && (
          <div className="form-message info">
            ℹ️ {info}
          </div>
        )}

        <label>Titel *</label>
        <input
  style={{ padding: "10px", borderRadius: "8px" }}
  value={title}
  onChange={(e) => {
    setTitle(e.target.value);

    const err = validateField("title", e.target.value);
    setErrors(prev => ({ ...prev, title: err }));
  }}
  onBlur={() => setTouched(prev => ({ ...prev, title: true }))}
/>

{touched.title && errors.title && (
  <div style={{ color: "red", fontSize: "12px" }}>
    {errors.title}
  </div>
)}

        <label>Beschreibung *</label>
        <textarea
  style={{ padding: "10px", borderRadius: "8px" }}
  value={description}
  onChange={(e) => {
    setDescription(e.target.value);

    const err = validateField("description", e.target.value);
    setErrors(prev => ({ ...prev, description: err }));
  }}
  onBlur={() => setTouched(prev => ({ ...prev, description: true }))}
/>

{touched.description && errors.description && (
  <div style={{ color: "red", fontSize: "12px" }}>
    {errors.description}
  </div>
)}

        <label>Autor *</label>
{loadingAuthors ? (
  <p>Autoren werden geladen…</p>
) : (
  <>
    <select
      value={authorId}
      onChange={(e) => {
        setAuthorId(e.target.value);

        const err = validateField("authorId", e.target.value);
        setErrors(prev => ({ ...prev, authorId: err }));
      }}
      onBlur={() => setTouched(prev => ({ ...prev, authorId: true }))}
      style={{ padding: "10px", borderRadius: "8px" }}
    >
      <option value="">Bitte auswählen</option>
      {authors.map((a) => (
        <option key={a.id} value={a.id}>
          {a.name}
          {String(a.id) === String(authorId) ? " (neu)" : ""}
        </option>
      ))}
    </select>

    {/* ✅ ERROR MUSS HIER HIN */}
    {touched.authorId && errors.authorId && (
      <div style={{ color: "red", fontSize: "12px" }}>
        {errors.authorId}
      </div>
    )}
  </>
)}

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>

                          <button
                            type="button"
                            onClick={handleCreateAuthorClick}
                            style={{
                              background: "#2563eb",
                              color: "white",
                              padding: "10px",
                              borderRadius: "10px",
                              display: "flex",
                              justifyContent: "center",
                              gap: "6px",
                            }}
                          >
                            ➕ Autor erstellen
                          </button>

                         <button
  type="submit"
  disabled={!isValid}
  style={{
    background: isValid ? "#1d4ed8" : "#93c5fd",
    color: "white",
    padding: "10px",
    borderRadius: "10px",
    display: "flex",
    justifyContent: "center",
    gap: "6px",
    cursor: isValid ? "pointer" : "not-allowed",
    opacity: isValid ? 1 : 0.6
  }}
>
  💾 Kurs speichern
</button>

                          <button
                          type="button"
                          onClick={() => onClose?.()}
                          style={{
                            background: "#e5e7eb",
                            color: "#111",
                            padding: "10px",
                            borderRadius: "10px",
                            marginTop: "10px"
                          }}
                        >
                          ❌ Abbrechen
                        </button>

                        </div>
      </form>

      {location.state?.authorCreated && (
        <div className="form-message success">
          ✅ Autor <strong>{location.state.authorName}</strong> wurde erfolgreich angelegt
        </div>
      )}
    </div>
  );
}

