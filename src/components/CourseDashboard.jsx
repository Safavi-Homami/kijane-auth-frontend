export default function CourseDashboard({
  isCourseCreator,
  isAdmin = false,
  isTrainer = false,
  ownedCoursesCount = 0,
  learningCoursesCount = 0,
  catalogCoursesCount = 0,
  completedCount = 0,
  onOpenCertificates,
}) {
  const overviewLabel = isAdmin
    ? "Admin-Kursübersicht"
    : isTrainer
    ? "Trainer-Kursübersicht"
    : "Lernübersicht";

  const headline = isCourseCreator
    ? "Willkommen zurück im Kursbereich"
    : "Willkommen zurück";

  return (
    <div className="course-dashboard">
      <div className="course-dashboard-header-row">
        <div>
          <p className="course-dashboard-eyebrow">
            {overviewLabel}
          </p>

          <h2>{headline}</h2>
        </div>

        {onOpenCertificates && (
          <button
            type="button"
            className="course-dashboard-certificate-btn"
            onClick={onOpenCertificates}
          >
            🎓 Meine Zertifikate
          </button>
        )}
      </div>

      <div className="course-dashboard-stats">
        {isCourseCreator ? (
          <>
            <div className="course-dashboard-card">
              <span>Eigene Kurse</span>
              <strong>{ownedCoursesCount}</strong>
            </div>

            <div className="course-dashboard-card">
              <span>Meine Lernkurse</span>
              <strong>{learningCoursesCount}</strong>
            </div>

            <div className="course-dashboard-card">
              <span>Weitere Kurse</span>
              <strong>{catalogCoursesCount}</strong>
            </div>
          </>
        ) : (
          <>
            <div className="course-dashboard-card">
              <span>Meine Kurse</span>
              <strong>{learningCoursesCount}</strong>
            </div>

            <div className="course-dashboard-card">
              <span>Abgeschlossen</span>
              <strong>{completedCount}</strong>
            </div>

            <div className="course-dashboard-card">
              <span>Kurskatalog</span>
              <strong>{catalogCoursesCount}</strong>
            </div>
          </>
        )}
      </div>
    </div>
  );
}