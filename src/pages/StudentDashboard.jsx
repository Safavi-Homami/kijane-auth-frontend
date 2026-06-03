import { useEffect, useState } from "react";
import ContinueLearningWidget from "../components/dashboard/ContinueLearningWidget";

import MyCoursesWidget from "../components/dashboard/MyCoursesWidget";
import api from "../api";

function StudentDashboard() {

  const [data, setData] = useState([]);

  const [courses, setCourses] = useState([]);

useEffect(() => {

  // ContinueLearning Demo
  setData([
    {
      courseId: 1,
      courseTitle: "MySQL",
      courseImage: "/course-placeholder.jpg",
      progressPercent: 40,
      lastLectureTitle: "Einführung in den Kurs",
      hasVideo: true
    }
  ]);

  // 🔥 ECHTE DATEN
  api.get("/courses")
    .then(res => setCourses(res.data))
    .catch(err => console.error(err));

}, []);


  return (
    <div className="page-background">
      <div className="container">

        <h1 style={{ marginBottom: "20px" }}>
          Willkommen zurück 👋
        </h1>

        <ContinueLearningWidget data={data} />

        <MyCoursesWidget courses={courses} />

      </div>
    </div>
  );
}

export default StudentDashboard;