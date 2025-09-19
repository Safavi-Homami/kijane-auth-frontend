import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useUser } from "../context/useUser"; // named import

export default function AddCourseForm({ authors }) {
  const { user } = useUser();
  const roles = user?.roles || [];
  const isAuthorized = roles.includes("ADMIN") || roles.includes("TRAINER");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [authorId, setAuthorId] = useState("");

  const navigate = useNavigate();

  if (!isAuthorized) {
    return (
      <p style={{ color: "red", fontWeight: "bold" }}>
        Du hast keine Berechtigung, Kurse anzulegen.
      </p>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authorId) {
      alert("Bitte einen Autor auswählen.");
      return;
    }

    const payload = {
      title,
      description,
      authorIds: [authorId], // Option A: Übergabe als Array mit einem Wert
    };

    try {
      await api.post("/courses", payload);
      navigate("/courses");
    } catch (error) {
      console.error("Fehler beim Speichern des Kurses:", error);
    }
  };

  return (
  <div className="trainer-form-container">

    <form onSubmit={handleSubmit}>
      <h2>Neuen Kurs anlegen</h2>

      <label>Titel:</label>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <label>Beschreibung:</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      <label>Autor:</label>
      <select
        value={authorId}
        onChange={(e) => setAuthorId(e.target.value)}
        required
      >
        <option value="">Bitte auswählen</option>
        {authors.map((author) => (
          <option key={author.id} value={author.id}>
            {author.firstName} {author.lastName}
          </option>
        ))}
      </select>

      <button type="submit">Kurs speichern</button>
    </form>
    </div>
  );
}

AddCourseForm.propTypes = {
  authors: PropTypes.array.isRequired,
};

