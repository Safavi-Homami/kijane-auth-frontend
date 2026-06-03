import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../api";
import "./Course.css";
import { useUser } from "../../context/useUser";

export default function CurriculumViewPage() {
  const { user } = useUser();
  const roles = user?.roles || [];

  const params = useParams();
const courseId = params.courseId || params.id;


  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const mode = query.get("mode");

  const isPreviewMode = mode === "preview";
  const isStudentMode = mode === "student" || mode === "learning";

  
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [openSections, setOpenSections] = useState({});

  const canOpenPlayerFromCurriculum =
  !isPreviewMode &&
  isStudentMode &&
  course?.canLearn === true;

  const [loading, setLoading] = useState(false);
const [errorMessage, setErrorMessage] = useState(null);


const handleLectureClick = (sectionId, lectureId) => {
  if (!canOpenPlayerFromCurriculum) {
    return;
  }

  navigate(`/courses/${courseId}/player?lectureId=${lectureId}`);
};
  // =========================
  // LOAD
  // =========================

  const loadCurriculum = async () => {
      if (!courseId) {
        setErrorMessage("Kurs-ID fehlt.");
        return;
      }

      setLoading(true);
      setErrorMessage(null);

      try {
        // 1) Kurs zuerst laden und SOFORT setzen
        const courseRes = await api.get(`/courses/${courseId}`);
        setCourse(courseRes.data);

        // 2) Danach Sections laden
        const sectionsRes = await api.get(`/courses/${courseId}/sections`);
        const sectionsData = sectionsRes.data || [];

        // 3) Lectures einzeln laden
        // Wenn eine Lecture-Abfrage fehlschlägt, bleibt die Section trotzdem sichtbar
        const withLectures = await Promise.all(
          sectionsData.map(async (section) => {
            try {
              const lecturesRes = await api.get(`/sections/${section.id}/lectures`);

              return {
                ...section,
                lectures: lecturesRes.data || [],
              };
            } catch (err) {
              console.warn(
                "Lectures konnten nicht geladen werden für Section:",
                section.id,
                err
              );

              return {
                ...section,
                lectures: [],
              };
            }
          })
        );

        setSections(withLectures);

        const allOpen = {};
        withLectures.forEach((section) => {
          allOpen[section.id] = true;
        });

        setOpenSections(allOpen);
      } catch (err) {
        console.error("Curriculum konnte nicht geladen werden:", err);

        if (err.response?.status === 401 || err.response?.status === 403) {
          setErrorMessage(
            "Die Kursvorschau ist aktuell für Gäste noch nicht vollständig freigegeben."
          );
        } else {
          setErrorMessage("Curriculum konnte nicht geladen werden.");
        }
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadCurriculum();
  }, [courseId]);



  // =========================
  // RENDER
  // =========================

  return (

    <div className="page-container" style={{ maxWidth: 1100, margin: "0 auto" }}>

      {/* HEADER */}
      <div
        style={{
          background: "linear-gradient(135deg,#0f172a,#1e293b)",
          color: "white",
          borderRadius: "14px",
          padding: "26px 30px",
          marginTop: "30px",
          marginBottom: "10px",
          textAlign: "center" // 🔥 zentriert
        }}
      >
        <div>
          <div style={{ fontSize: "14px", opacity: 0.8 }}>
            Curriculum
          </div>

          <div style={{ fontSize: "28px", fontWeight: "600" }}>
            {course?.title}
          </div>
        </div>
      </div>

      {/* BUTTON */}
      <div style={{ marginBottom: "24px", textAlign: "center" }}>
        <button
          onClick={() => navigate(`/courses/${courseId}`, { replace: true })}
          style={{
            display: "inline-block",
            background: "#e2e8f0",
            color: "#1e293b",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",

            padding: "8px 16px",
            cursor: "pointer",

            fontWeight: "600",
            fontSize: "14px",

            minWidth: "220px",

            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#cbd5f5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#e2e8f0";
          }}
        >
          ← Zurück zum Kurs
        </button>
        {loading && (
          <div
            style={{
              padding: "18px",
              textAlign: "center",
              color: "#475569",
              fontWeight: 600,
            }}
          >
            Curriculum wird geladen...
          </div>
        )}

        {errorMessage && (
          <div
            style={{
              marginBottom: "20px",
              padding: "16px 18px",
              borderRadius: "12px",
              background: "#fff7ed",
              border: "1px solid #fdba74",
              color: "#9a3412",
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            {errorMessage}
          </div>
        )}  


      </div>

      {/* SECTIONS */}
      {[...sections]
        .sort((a, b) => (a.sectionOrder ?? 0) - (b.sectionOrder ?? 0))
        .map((section, index) => (

          <div
            key={section.id}
            style={{
              background: "linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%)",
              borderRadius: "14px",
              padding: "18px 20px",
              marginBottom: "18px",

              border: "1px solid #cbd5e1",
              boxShadow: "0 6px 20px rgba(0,0,0,0.04)",

              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.04)";
            }}
          >

            {/* SECTION HEADER */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",

                paddingBottom: "10px",
                marginBottom: "12px",

                borderBottom: "1px solid #f1f5f9"
              }}
            >
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#0f172a"
                }}
              >
                {index + 1}. {section.name}
              </span>

              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "500",
                  background: "#e0f2fe",
                  color: "#0369a1",
                  padding: "4px 10px",
                  borderRadius: "999px"
                }}
              >
                {section.lectures?.length} Lectures
              </span>
            </div>

           {/* LECTURES */}
<div>
  {[...section.lectures]
    .sort((a, b) => (a.lectureOrder ?? 0) - (b.lectureOrder ?? 0))
    .map((lecture, i) => (
      <div
        key={lecture.id}
          onClick={
            canOpenPlayerFromCurriculum
              ? () => handleLectureClick(section.id, lecture.id)
              : undefined
          }
        style={{
          padding: "10px 12px",
          borderRadius: "8px",

          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",

          background: "#f8fafc",
          marginBottom: "6px",

          border: "1px solid transparent",
          transition: "all 0.2s ease",

          // 🔥 WICHTIG
          
         opacity: 1,
          cursor: canOpenPlayerFromCurriculum ? "pointer" : "default"
        }}
        onMouseEnter={(e) => {
         if (!canOpenPlayerFromCurriculum) return;

          e.currentTarget.style.background = "#e0e7ff";
          e.currentTarget.style.transform = "scale(1.01)";
          e.currentTarget.style.border = "1px solid #c7d2fe";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#f8fafc";
          e.currentTarget.style.border = "1px solid transparent";
        }}
      >
        <span
          style={{
            fontSize: "14px",
            color: "#1e293b"
          }}
        >
          {i + 1}. {lecture.title}
        </span>

        <span style={{ fontSize: "14px", opacity: canOpenPlayerFromCurriculum ? 0.5 : 0.25 }}>
          {canOpenPlayerFromCurriculum ? "→" : "🔒"}
        </span>

        <span
          style={{
            width: "6px",
            height: "6px",
            background: canOpenPlayerFromCurriculum ? "#6366f1" : "#cbd5e1",
            borderRadius: "50%"
          }}
        />
      </div>
    ))}
</div>

          </div>

        ))}

    </div>
  );
}