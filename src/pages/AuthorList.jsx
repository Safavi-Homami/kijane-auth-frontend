// src/pages/AuthorList.jsx
import React, { useEffect, useState } from "react";
import api from '../api';

function AuthorList() {
  const [authors, setAuthors] = useState([]);

 useEffect(() => {
  const token = sessionStorage.getItem("token");
  console.log("📦 Token beim Autoren-Request:", token);

  api.get("/authors")
    .then((res) => {
      console.log("✅ Autoren geladen:", res.data);
      setAuthors(res.data);
    })
    .catch((err) => {
      console.error("❌ Fehler beim Laden der Autoren:", err);
      if (err.response) {
        console.error("📋 Status:", err.response.status);
        console.error("📋 Header:", err.config.headers); // zeige gesetzte Header
      }
    });
}, []);


  return (
    <div>
      <h1>Autorenliste</h1>
      {authors.map((author, index) => (
        <div key={index}>
          <h2>{author.firstName} {author.lastName}</h2>
        </div>
      ))}
    </div>
  );
}

export default AuthorList;
