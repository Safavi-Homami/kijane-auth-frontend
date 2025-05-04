// src/pages/CourseDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
// oben im File
import {Link} from "react-router-dom";



function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
/*
  useEffect(() => {
    axios.get(`/courses/${id}`)
      .then(response => setCourse(response.data))
      .catch(error => console.error("Fehler beim Laden des Kurses:", error));
  }, [id]);
*/
useEffect(() => {
  console.log("useEffect läuft mit ID:", id); // Debug
  axios.get(`/api/courses/${id}`)
    .then(response => {
      console.log("Course Detail Response:", response.data); // NEU!
      setCourse(response.data);
    })
    .catch(error => console.error("Fehler beim Laden des Kurses:", error));
}, [id]);

  if (!course) {
    return <p>Lade Kursdetails...</p>;
  }

  console.log("Aktueller Kurs im Render:", course); // 👈 Hier für Debug


  return (
    <div className="course-detail">
      <h2>{course.title}</h2>
      <p>{course.description}</p>

      <h4>Autoren:</h4>
      <ul>
  {course.authorNames?.map((name, index) => (
    <li key={index}>{name}</li>
  ))}
</ul>
<Link to="/" className="back-link">Zurück zur Startseite</Link>

    </div>
  );
}

export default CourseDetail;
