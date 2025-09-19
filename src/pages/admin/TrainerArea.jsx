import { useEffect, useState } from "react";
import AddCourseForm from "../AddCourseForm";
import api from "../../api";

export default function TrainerArea() {
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    api.get("/authors")
      .then((res) => setAuthors(res.data))
      .catch((err) => console.error("Fehler beim Laden der Autoren:", err));
  }, []);

  return (
    <div>
      <AddCourseForm authors={authors} />
    </div>
  );
}




/*
import React, { useEffect, useState } from "react";
import AddCourseForm from "../AddCourseForm"; // ✅ korrekt
import api from "../../api"; // <– wichtig: deine zentrale API mit Token-Header

export default function TrainerArea() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Autoren laden bei Aufruf der Trainer-Seite
  useEffect(() => {
    api.get("/authors")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setAuthors(res.data);
        } else {
          console.error("❌ res.data ist kein Array:", res.data);
        }
      })
      .catch((err) => {
        console.error("❌ Fehler beim Laden der Autoren:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p>⏳ Lade Daten ...</p>;
  }

  return (
    <div>
      <h2>👨‍🏫 Trainerbereich</h2>
      <p>Willkommen im Trainer-Dashboard</p>

      <h3>📚 Kurs erstellen</h3>
      <AddCourseForm authors={authors} />

      <hr />

      <h3>👥 Verfügbare Autoren ({authors.length})</h3>
      <ul>
        {authors.map((a) => (
          <li key={a.id}>
            {a.firstName} {a.lastName}
          </li>
        ))}
      </ul>
    </div>
  );
}
*/