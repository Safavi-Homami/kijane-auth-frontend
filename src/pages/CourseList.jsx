import React, { useEffect, useState } from "react";
import "../CourseStyles.css";
import api from "../api";
import Modal from "../components/Modal";
import AddCourseForm from "./AddCourseForm";
import CreateAuthorPage from "./trainer/CreateAuthorPage";
import CourseCard from "../components/CourseCard";
import AddCourseCard from "../components/AddCourseCard";
import { useNavigate, useLocation } from "react-router-dom";
import CourseDashboard from "../components/CourseDashboard";


function CourseList() {
  const [courses, setCourses] = useState([]);
  const [roles, setRoles] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const [showModal, setShowModal] = useState(false);
  const [modalView, setModalView] = useState("course");
  const [authors, setAuthors] = useState([]);
  const [newAuthorId, setNewAuthorId] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [isLoggedIn, setIsLoggedIn] = useState(
  () => !!sessionStorage.getItem("token")
);

  useEffect(() => {
  const timer = setTimeout(() => {
    window.scrollTo({
      top: 70,
      left: 0,
      behavior: "auto",
    });
  }, 80);

  return () => clearTimeout(timer);
}, []);

  const normalizedSearch = searchTerm.trim().toLowerCase();

const matchesSearch = (course) => {
  if (!normalizedSearch) return true;

  return (
    course.title?.toLowerCase().includes(normalizedSearch) ||
    course.description?.toLowerCase().includes(normalizedSearch) ||
    course.trainerFirstName?.toLowerCase().includes(normalizedSearch) ||
    course.trainerLastName?.toLowerCase().includes(normalizedSearch) ||
    course.authorNames?.some((name) =>
      name.toLowerCase().includes(normalizedSearch)
    )
  );
};


  const loadProgress = async (courseId) => {
    try {
      const res = await api.get(`/courses/${courseId}/lecture-progress`);
      return res.data;
    } catch (e) {
      console.warn("Progress load failed");
      return null;
    }
  };


 const loadCertificateStatus = async (courseId, progressPercent = 0) => {
  try {
    const res = await api.get(`/courses/${courseId}/certificate-status`);
    
    return res.data;
  } catch (e) {
    console.warn("Certificate status load failed for course!");

    // ✅ Fallback statt null:
    // Dadurch bleibt CourseCard stabil, auch wenn ein einzelner Status-Request fehlschlägt.
    return {
      courseId,
      progressPercent,
      courseCompleted: progressPercent >= 100,
      finalExamExists: false,
      finalExamQuizId: null,
      finalExamTitle: null,
      finalExamPassed: false,
      bestFinalExamPercentage: null,
      certificateIssued: false,
      certificateAvailable: false,
      loadFailed: true,
    };
  }
};

  const loadCourses = async (authenticated = !!sessionStorage.getItem("token")) => {
  try {
    const res = await api.get("/courses");

    // Gast: nur öffentliche Kurse laden, keine Progress-/Zertifikats-Requests
    if (!authenticated) {
      const publicCourses = (res.data || []).map((course) => ({
        ...course,
        canEdit: false,
        canLearn: false,
        progressPercent: 0,
        lastLectureId: null,
        lastSectionId: null,
        lastLectureTitle: null,
        lastSectionName: null,
        nextLectureTitle: null,
        certificateStatus: null,
      }));

      setCourses(publicCourses);
      return;
    }

    // Eingeloggt: volle Kursdaten inkl. Progress/Zertifikat
    const withProgress = await Promise.all(
      res.data.map(async (course) => {
        const progress = await loadProgress(course.id);
        const progressPercent = progress?.progressPercent || 0;

        const certificateStatus = await loadCertificateStatus(
          course.id,
          progressPercent
        );

        let nextLectureTitle = null;

        if (progressPercent > 0 && progressPercent < 100) {
          try {
            const nextRes = await api.get(`/courses/${course.id}/next-lecture`);
            nextLectureTitle = nextRes.data?.title || null;
          } catch (e) {
            nextLectureTitle = null;
          }
        }

        return {
          ...course,
          progressPercent,
          lastLectureId: progress?.lastLectureId,
          lastSectionId: progress?.lastSectionId,
          lastLectureTitle: progress?.lastLectureTitle,
          lastSectionName:
            progress?.lastSectionName || progress?.sectionName || null,
          nextLectureTitle,
          certificateStatus,
        };
      })
    );

    setCourses(withProgress);
  } catch (err) {
    console.error("Fehler beim Laden der Kurse!");
  }
};

 const toggleVisibility = async (courseId) => {
  try {
    await api.put(`/courses/${courseId}/visibility`);
    await loadCourses();
  } catch (err) {
    console.error("Toggle visibility failed!");
  }
};


  useEffect(() => {
  const token = sessionStorage.getItem("token");
  const authenticated = !!token;

  setIsLoggedIn(authenticated);
  loadCourses(authenticated);

  if (!authenticated) {
    setRoles([]);
    setAuthors([]);
    return;
  }

  api
    .get("/auth/me")
    .then((response) => {
      const userRoles = response.data.roles || [];
      setRoles(userRoles);

      const cleanRoles = userRoles.map((role) =>
        role.replace("ROLE_", "")
      );

      if (
        cleanRoles.includes("TRAINER") ||
        cleanRoles.includes("ADMIN") ||
        cleanRoles.includes("MANAGER") ||
        cleanRoles.includes("EDITOR")
      ) {
        api
          .get("/authors/my")
          .then((res) => setAuthors(res.data))
          .catch(() => {});
      }
    })
    .catch((error) =>
      console.error("Fehler beim Laden der Rolle!")
    );

  if (location.state?.refresh) {
    window.history.replaceState({}, document.title);
  }
}, [location.key, location.state?.refresh]);

  const handleDelete = (id) => {
  const courseToDelete = courses.find((c) => c.id === id);
  if (!courseToDelete) return;

  setDeleteTarget(courseToDelete);
};

const confirmDeleteCourse = async () => {
  if (!deleteTarget) return;

  try {
    await api.put(`/courses/${deleteTarget.id}/soft-delete`);

    setCourses((prev) =>
      prev.filter((c) => c.id !== deleteTarget.id)
    );

    setDeleteTarget(null);
  } catch (err) {
    console.error("❌ Soft delete course error!");
    console.error("STATUS:", err.response?.status);
    

    alert(
      err.response?.data?.message ||
      "Kurs konnte nicht als gelöscht markiert werden."
    );
  }
};

  const normalizedRoles = roles.map((role) =>
  role.replace("ROLE_", "")
);

const isAdmin = normalizedRoles.includes("ADMIN");
const isTrainer = normalizedRoles.includes("TRAINER");

const canAddCourse =
  normalizedRoles.includes("ADMIN") ||
  normalizedRoles.includes("MANAGER") ||
  normalizedRoles.includes("EDITOR") ||
  normalizedRoles.includes("TRAINER");

const isCourseCreator = canAddCourse;

// Version 1:
// Jeder eingeloggte User kann Lernender sein.
// Eigene Kurse bleiben trotzdem unter "Meine erstellten Kurse",
// weil learningCourses später nur aus foreignCourses gebildet wird.
const canUseStudentLearningFlow = isLoggedIn;

const canLearnCourse = (course) =>
  isLoggedIn && course?.canLearn === true;

const canOpenBlueprintDemo = isAdmin || isTrainer;

// Temporärer Demo-Link.
// Achtung: sectionId und lectureId können sich bei neuem Import ändern.
const blueprintDemoPath = "/course-blueprint-import";

  // 1) Eigene erstellte Kurse
  const ownedCourses = courses
  .filter((course) => course.canEdit)
  .sort((a, b) => b.id - a.id);


  const newestOwnedCourseId = ownedCourses[0]?.id;

  // 2) Fremde Kurse
  const foreignCourses = isLoggedIn
    ? courses.filter((course) => !course.canEdit)
    : courses;

  const learningCourses = canUseStudentLearningFlow
  ? foreignCourses.filter(
      (course) =>
        canLearnCourse(course) &&
        course.progressPercent > 0 &&
        matchesSearch(course)
    )
  : [];

const catalogCourses = isLoggedIn
  ? foreignCourses.filter((course) => {
      if (!matchesSearch(course)) return false;

      /*
       * Lernbare Kurse:
       * - wenn begonnen → Meine Lernkurse
       * - wenn nicht begonnen → Kurskatalog / Weitere Kurse
       */
      if (canLearnCourse(course)) {
        return !course.progressPercent || course.progressPercent === 0;
      }

      /*
       * Nicht lernbare Kurse:
       * bleiben sichtbar als Vorschau/Katalog,
       * aber ohne Student-Flow.
       */
      return true;
    })
  : courses.filter(matchesSearch);
    
    const startedCount = learningCourses.length;

    const completedCount = learningCourses.filter(
      (course) => course.progressPercent >= 100
    ).length;

  const averageProgress =
    learningCourses.length === 0
      ? 0
      : Math.round(
          learningCourses.reduce(
            (sum, course) => sum + (course.progressPercent || 0),
            0
          ) / learningCourses.length
        );

const handleStartFinalExam = (course) => {
  const status = course.certificateStatus;

  if (!status?.finalExamQuizId) {
    alert("Für diesen Kurs wurde keine Abschlussprüfung gefunden.");
    return;
  }

  const finalExamQuizId = status.finalExamQuizId;

  sessionStorage.setItem(
    `quiz-is-final-exam-${finalExamQuizId}`,
    "true"
  );

  sessionStorage.setItem(
    `quiz-course-id-${finalExamQuizId}`,
    String(course.id)
  );

  sessionStorage.setItem(
    `quiz-return-to-${finalExamQuizId}`,
    "/courses"
  );

  navigate(`/quiz-play/${finalExamQuizId}`, {
    state: {
      returnTo: "/courses",

      isFinalExam: true,
      courseId: course.id,

      quizResourceId: finalExamQuizId,
      quizTitle: status.finalExamTitle,

      source: "course-final-exam",
    },
  });
};

  const handleContinue = async (course, isStarted) => {
    if (!isLoggedIn || !canLearnCourse(course) || !isStarted) {
      navigate(`/courses/${course.id}`);
      return;
    }

  try {
    const res = await api.get(`/courses/${course.id}/next-lecture`);
    const next = res.data;

    if (next?.id) {
      navigate(`/courses/${course.id}/player?lectureId=${next.id}`);
      return;
    }

    navigate(`/courses/${course.id}/player`);
  } catch (err) {
    console.error("Continue Fehler!");
    navigate(`/courses/${course.id}/player`);
  }
};

  

  return (
    <div className="page-background">
      <div className="container">
       {isLoggedIn ? (
            <CourseDashboard
              isCourseCreator={isCourseCreator}
              isAdmin={isAdmin}
              isTrainer={isTrainer}
              ownedCoursesCount={ownedCourses.length}
              learningCoursesCount={learningCourses.length}
              catalogCoursesCount={catalogCourses.length}
              completedCount={completedCount}
              onOpenCertificates={() => navigate("/certificates")}
            />
          ) : (
            <div
              style={{
                margin: "18px 0 26px",
                padding: "24px",
                borderRadius: "18px",
                background: "#0f172a",
                color: "white",
                boxShadow: "0 10px 28px rgba(15, 23, 42, 0.18)",
                borderLeft: "6px solid #f97316",
                textAlign: "center",
              }}
            >
              <h2 style={{ margin: "0 0 8px", fontSize: "26px" }}>
                Öffentlicher Kurskatalog
              </h2>

              <p style={{ margin: 0, opacity: 0.88 }}>
                Du kannst die Demo-Kurse ansehen. Fortschritt, Quiz, Zertifikate und
                eigene Lernkurse sind erst nach Anmeldung mit einem Demo-Account verfügbar.
              </p>

              <button
                type="button"
                onClick={() => navigate("/login")}
                style={{
                  marginTop: "16px",
                  padding: "12px 18px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#0d6efd",
                  color: "white",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Zur Demo-Anmeldung
              </button>
            </div>
          )}

        {canOpenBlueprintDemo && (
  <div
    style={{
      margin: "18px 0 26px",
      padding: "18px",
      borderRadius: "16px",
      background: "#0f172a",
      color: "white",
      boxShadow: "0 10px 28px rgba(15, 23, 42, 0.18)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "16px",
      flexWrap: "wrap",
      borderLeft: "6px solid #f97316",
    }}
  >
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: "20px" }}>
        🧪 Blueprint-Import
      </h3>

      <p style={{ margin: 0, opacity: 0.85 }}>
        Temporärer Schnellzugriff auf den importierten Java-Blueprint-Testkurs.
      </p>
    </div>

    <button
      type="button"
      onClick={() => navigate(blueprintDemoPath)}
      style={{
        padding: "12px 18px",
        borderRadius: "10px",
        border: "none",
        background: "#0d6efd",
        color: "white",
        fontWeight: 700,
        cursor: "pointer",
        minWidth: "240px",
      }}
    >
      📥 Blueprint-Import öffnen
    </button>
  </div>
)}

       
        {/* TRAINER: EIGENE ERSTELLTE KURSE */}
        {isCourseCreator && (
          <>
            <div className="section-header">
              <div>
                <h1>Meine erstellten Kurse</h1>

                {ownedCourses.length === 0 && (
                  <div className="course-empty-state">
                    <p>Du hast noch keine eigenen Kurse erstellt.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="course-grid">
              {ownedCourses.map((course) => (
                <CourseCard
  key={course.id}
  course={course}
  mode="trainer"
  isNewest={course.id === newestOwnedCourseId}
  onOpen={() => navigate(`/courses/${course.id}`)}
  onToggleVisibility={toggleVisibility}
  onDelete={handleDelete}
/>
              ))}

              {canAddCourse && (
                <AddCourseCard
                  onClick={() => {
                    setModalView("course");
                    setShowModal(true);
                  }}
                />
              )}
            </div>
          </>
        )}

        {/* LERNKURSE: TRAINER UND STUDENT */}
      {canUseStudentLearningFlow && (
  <>
    <div className="section-header">
      <h1>Meine Lernkurse</h1>
    </div>

          {learningCourses.length === 0 && (
            <div className="course-empty-state course-empty-state-separated">
              <p>Du hast noch keinen Kurs begonnen.</p>
              <span>
                Starte einen Kurs aus dem Kurskatalog, dann erscheint er hier.
              </span>
            </div>
          )}

          {learningCourses.length > 0 && (
            <div className="course-grid">
              {learningCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  mode="student"
                  progressPercent={course.progressPercent || 0}
                  certificateStatus={course.certificateStatus}
                  lastLectureTitle={course.lastLectureTitle || null}
                  lastSectionName={course.lastSectionName || null}
                  nextLectureTitle={course.nextLectureTitle || null}
                  hasVideo={false}
                  onOpen={() => navigate(`/courses/${course.id}`)}
                  onContinue={() => handleContinue(course, true)}
                  onReview={() => {
                    navigate(`/courses/${course.id}/player`);
                  }}
                  onStartFinalExam={() => handleStartFinalExam(course)}
                />
              ))}
            </div>
          )}
        </>
      )}

       {/* KURSKATALOG / WEITERE KURSE */}
        <>
          <div className="section-header course-section-spacer">
            <h1>
              {!isLoggedIn
                ? "Öffentlicher Kurskatalog"
                : isCourseCreator
                ? "Weitere Kurse"
                : "Kurskatalog"}
            </h1>
          </div>

          <div className="course-search-box">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Kurs suchen..."
              className="course-search-input"
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="course-search-clear"
              >
                Zurücksetzen
              </button>
            )}
          </div>

          {catalogCourses.length > 0 ? (
            <div className="course-grid">
              {catalogCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  mode="viewer"
                  onOpen={() => navigate(`/courses/${course.id}`)}
                  progressPercent={0}
                  lastLectureTitle={null}
                  lastSectionName={null}
                  hasVideo={false}
                  onContinue={() => handleContinue(course, false)}
                 onReview={() => {
                    navigate(`/courses/${course.id}/curriculum-view?mode=preview`);
                  }}
                />
              ))}
            </div>
          ) : (
            searchTerm && (
              <div className="course-empty-state">
                <p>Kein Kurs gefunden.</p>
                <span>Bitte versuche einen anderen Suchbegriff.</span>
              </div>
            )
          )}
        </>
        </div>
     
     
     
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
  {deleteTarget && (
    <div
      style={{
        maxWidth: "520px",
        margin: "0 auto",
        padding: "28px",
        textAlign: "center",
        overflow: "hidden",
      }}
    >
      <h2 style={{ color: "#dc2626", fontSize: "24px", fontWeight: 700 }}>
        Kurs wirklich löschen?
      </h2>

      <p style={{ marginTop: "16px", marginBottom: "24px" }}>
        Möchtest du den Kurs{" "}
        <strong>{deleteTarget.title}</strong> wirklich löschen?
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={() => setDeleteTarget(null)}
          style={{
            padding: "10px 22px",
            borderRadius: "10px",
            border: "1px solid #d1d5db",
            background: "#e5e7eb",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Abbrechen
        </button>

        <button
          type="button"
          onClick={confirmDeleteCourse}
          style={{
            padding: "10px 22px",
            borderRadius: "10px",
            border: "none",
            background: "#dc2626",
            color: "white",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Ja, löschen
        </button>
      </div>
    </div>
  )}
</Modal>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        {modalView === "course" && (
          <AddCourseForm
            authors={authors}
            newAuthorId={newAuthorId}
            onClose={async (action, createdCourse) => {
              if (action === "switch-to-author") {
                setModalView("author");
                return;
              }

              if (action === "saved") {
                setShowModal(false);
                setNewAuthorId(null);

                await loadCourses();

                if (createdCourse?.id) {
                  navigate(`/courses/${createdCourse.id}`, {
                    state: { createdCourse: true },
                  });
                }

                return;
              }

              setShowModal(false);
              setNewAuthorId(null);
            }}
          />
        )}

        {modalView === "author" && (
          <CreateAuthorPage
            onClose={(createdAuthorId) => {
              setModalView("course");
              setNewAuthorId(createdAuthorId);
              api.get("/authors/my").then((res) => setAuthors(res.data));
            }}
          />
        )}
      </Modal>
    </div>
  );
}

export default CourseList;