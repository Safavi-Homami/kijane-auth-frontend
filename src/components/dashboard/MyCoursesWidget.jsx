import CourseCard from "../CourseCard";
import { useNavigate } from "react-router-dom";

function MyCoursesWidget({ courses = [], loading = false }) {

  const navigate = useNavigate();

  if (loading) {
    return <p>Lade Kurse...</p>;
  }

  if (!courses.length) {
    return (
      <div className="dashboard-section">
        <h2>Meine Kurse</h2>
        <p>Du bist noch in keinem Kurs eingeschrieben.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-section">
      <h2>Meine Kurse</h2>

      <div className="dashboard-row">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            mode="student"
            progressPercent={Math.floor(Math.random() * 100)} // 🔥 temporär
            lastLectureTitle="Weiter zum nächsten Kapitel"
            hasVideo={true}
            onContinue={() => navigate(`/courses/${course.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

export default MyCoursesWidget;