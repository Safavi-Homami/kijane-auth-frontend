import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AddCourseForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [authorId, setAuthorId] = useState([]);
  const [authors, setAuthors] = useState([]);

  const navigate = useNavigate();

  // Autoren für Auswahl laden
  useEffect(() => {
    axios.get("/api/authors")
      .then(res => {
        console.log("Full response:", res);
        console.log("res.data:", res.data);

        if (Array.isArray(res.data)) {
          setAuthors(res.data);
        } else {
          console.error("res.data ist kein Array!", res.data);
        }
      })
      .catch(err => console.error("Fehler beim Laden der Autoren", err));
  }, []);
  useEffect(() => {
    if (authors.length > 0) {
      console.log("Setze standardmßig Author:" , authors[0].id);
      setAuthorId(authors[0].id);
    }
  }, [authors]); // 👈 dieser Effekt reagiert nur, wenn sich `authors` ändert
  
    // Formular zurücksetzen
  const resetForm = () => {
      setTitle("");
      setDescription("");
      setAuthorId(authors.length > 0 ? authors[0].id.toString() : "");
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();

    const newCourse = {
      title,
      description,
      authorIds: [parseInt(authorId)]

    };

    axios.post("/api/courses", newCourse)
    .then(res => {
      console.log("Kurs erfolgreich erstellt:", res.data);
      resetForm();
      navigate("/"); // Zurück zur Startseite oder Kursliste
      })
      .catch(err => {
        console.error("Fehler beim Speichern des Kurses", err);
        alert("❌ Fehler beim Speichern!");
      });
  };

  return (
    <div className="card">
      <h2>🟦 Neuen Kurs erstellen</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Titel:
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Kurstitel eingeben"
            required
          />
        </label>
        <br />

        <label>
          Beschreibung:
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Kurzbeschreibung des Kurses"
            required
          />
        </label>
        <br />

        <label>
          Autor:
          <select value={authorId} onChange={e => setAuthorId(e.target.value)}>
            {!Array.isArray(authors) ? (
              <option>Autoren werden geladen...</option>
            ) : (
              authors.map(author => (
                <option key={author.id} value={author.id}>
                  {author.firstName} {author.lastName}
                </option>
              ))
            )}
          </select>
        </label>
        <br />

        <button type="submit">💾 Kurs speichern</button>
      </form>
    </div>
  );
}
