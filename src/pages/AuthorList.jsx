// src/pages/AuthorList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function AuthorList() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/authors/my")
      .then((res) => {
        setAuthors(res.data || []);
      })
      .catch((err) => {
        console.error("❌ Fehler beim Laden der Authoren!");
        alert("Authoren konnten nicht geladen werden.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelectAuthor = (author) => {
  

    // 👉 für nächsten Schritt (z. B. Course erstellen)
    sessionStorage.setItem("selectedAuthorId", author.id);

    navigate("/trainer"); // oder später: /courses/new
  };

  if (loading) {
    return <p>Authoren werden geladen …</p>;
  }

  return (
    <div className="author-list-wrapper">
      <h1>Meine Authoren</h1>

      {authors.length === 0 ? (
        <p>Du hast noch keine Authoren angelegt.</p>
      ) : (
        <div className="author-list-container">
          {authors.map((author) => (
            <div key={author.id} className="author-card">
              <div className="author-name">
                {author.name}
              </div>

              <button
                type="button"
                onClick={() => handleSelectAuthor(author)}
              >
                Author auswählen
              </button>
            </div>
          ))}
        </div>
      )}

      <button onClick={() => navigate("/trainer")}>
        Zurück
      </button>
    </div>
  );
}

export default AuthorList;
