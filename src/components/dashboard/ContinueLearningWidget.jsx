import CourseCard from "../CourseCard";

function ContinueLearningWidget({ data = [], loading = false }) {

  if (loading) {
    return <p>Lade weiterlernen...</p>;
  }

  if (!data.length) {
    return (
      <div className="dashboard-section">
        <h2>Weiterlernen</h2>
        <p>Du hast noch keinen Kurs gestartet.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-section">
      <h2>Weiterlernen</h2>

      <div className="dashboard-row">
        {data.slice(0, 3).map((item) => (
          <CourseCard
            key={item.courseId}
            course={{
              id: item.courseId,
              title: item.courseTitle,
              imageUrl: item.courseImage,
              rating: item.rating || 4.5
            }}
            mode="student"
            progressPercent={item.progressPercent}
            lastLectureTitle={item.lastLectureTitle}
            hasVideo={item.hasVideo}
            onContinue={() => {
              window.location.href = `/courses/${item.courseId}`;
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default ContinueLearningWidget;