import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../CourseStyles.css";

function CourseList() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    axios.get("/api/courses")
      .then(response => setCourses(response.data))
      .catch(error => console.error("Fehler beim Laden der Kurse:", error));
  }, []);

  return (
    <div className="course-list">
      <h2>Kurse</h2>
  
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/add-course">
          <button>+ Neuen Kurs hinzufügen</button>
        </Link>
      </div>
  
      {courses.length === 0 ? (
        <p>Lade Kurse...</p>
      ) : (
        courses.map(course => (
          <div key={course.id} className="course-item">
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <Link to={`/courses/${course.id}`}>Details ansehen</Link>
          </div>
        ))
      )}
    </div>
  );
}
export default CourseList;
  