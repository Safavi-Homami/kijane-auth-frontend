import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import "./Course.css";
import { useRef } from "react";


export default function CourseCurriculumPage() {

  const [loadingCurriculum, setLoadingCurriculum] = useState(false);

  const loadingCurriculumRef = useRef(false);
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);

  const [newSectionName, setNewSectionName] = useState("");

  const [newLectureTitles, setNewLectureTitles] = useState({});

  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editSectionName, setEditSectionName] = useState("");

  const [editingLectureId, setEditingLectureId] = useState(null);
  const [editLectureTitle, setEditLectureTitle] = useState("");

  const [openSections, setOpenSections] = useState({});

  const [confirmDeleteSectionId, setConfirmDeleteSectionId] = useState(null);
  const [confirmDeleteLecture, setConfirmDeleteLecture] = useState(null);
  const [toast, setToast] = useState(null);  

  
// ====================

const toastTimeoutRef = useRef(null);

  const showToast = (message, type = "success") => {

  setToast({ message, type });

  if (toastTimeoutRef.current) {
    clearTimeout(toastTimeoutRef.current);
  }

  toastTimeoutRef.current = setTimeout(() => {
    setToast(null);
  }, 3000);
};

const [loadingAction, setLoadingAction] = useState(false); //-> für lecture
const [loadingSection, setLoadingSection] = useState(false);// für section


  // =========================
  // LOAD CURRICULUM
  // =========================

  const loadCurriculum = async () => {

  if (loadingCurriculumRef.current) return;
    loadingCurriculumRef.current = true;
    setLoadingCurriculum(true);   

  try {

    const courseRes = await api.get(`/courses/${courseId}`);
    const sectionsRes = await api.get(`/courses/${courseId}/sections`);

    const sectionsData = sectionsRes.data || [];

    const withLectures = await Promise.all(
      sectionsData.map(async (s) => {
        const lecturesRes = await api.get(`/sections/${s.id}/lectures`);
        return { ...s, lectures: lecturesRes.data || [] };
      })
    );

    setCourse(courseRes.data);
   setSections(withLectures);

   
    setOpenSections(prev => {
      const next = {};
      withLectures.forEach(s => {
        next[s.id] = prev[s.id] ?? false;
      });
      return next;
    });

  } catch (err) {

    console.error(err);
    showToast("Fehler beim Laden", "error");

  } finally {
    loadingCurriculumRef.current = false;
    setLoadingCurriculum(false);   
  }
};


useEffect(() => {

  loadCurriculum();
  
}, [courseId]);


  // =========================
  // SECTION CRUD
  // =========================

  const createSection = async () => {

  if (loadingSection) return;
  if (!newSectionName.trim()) return;

  setLoadingSection(true);

  try {

    await api.post(`/courses/${courseId}/sections`, {
      name: newSectionName,
    });

    await loadCurriculum();   // ✅ Backend ist Wahrheit

    showToast("Kapitel erstellt");

    setNewSectionName("");

  } catch (err) {

    console.error(err);
    showToast("Fehler beim Erstellen", "error");

  } finally {
    setLoadingSection(false);
  }
};


 const updateSection = async (sectionId) => {

  if (!editSectionName.trim()) {
    showToast("Name darf nicht leer sein", "error");
    return;
  }

  try {

    await api.put(`/sections/${sectionId}`, {
      name: editSectionName,
    });

    await loadCurriculum();   // 🔥 NEU

    showToast("Kapitel aktualisiert");

    setEditingSectionId(null);
    setEditSectionName("");  

  } catch (err) {
    console.error(err);
    showToast("Fehler beim Aktualisieren", "error");
  }
};

  const deleteSection = (sectionId) => {
      setConfirmDeleteSectionId(sectionId);
    };

  const moveSectionUp = async (sectionId) => {

  try {

    await api.post(`/sections/${sectionId}/move-up`);

   await loadCurriculum();   // 🔥 NEU


  } catch (err) {
    console.error(err);
    showToast("Fehler beim Verschieben", "error");
  }
};
 const moveSectionDown = async (sectionId) => {

  try {

    await api.post(`/sections/${sectionId}/move-down`);

await loadCurriculum();   // 🔥 NEU

  } catch (err) {
    console.error(err);
    showToast("Fehler beim Verschieben", "error");
  }
};

const confirmDeleteSection = async () => {

  if (!confirmDeleteSectionId) return;

  try {

    await api.delete(`/sections/${confirmDeleteSectionId}`);

     await loadCurriculum();   // 🔥 NEU

     showToast("Kapitel gelöscht");


    setConfirmDeleteSectionId(null);
    

  } catch (err) {

    showToast("Kapitel kann nicht gelöscht werden", "error");

  }
};

  // =========================
  // LECTURE CRUD
  // =========================

 const handleConfirmDeleteLecture = async () => {

  if (!confirmDeleteLecture) return;

  const { sectionId, lectureId } = confirmDeleteLecture;

  try {

    await api.delete(`/sections/${sectionId}/lectures/${lectureId}`);

    await loadCurriculum();   // 🔥 NEU

    showToast("Lecture gelöscht");

    setConfirmDeleteLecture(null);

  } catch (err) {
    console.error(err);
    showToast(
      "Lecture kann nicht gelöscht werden. Bitte zuerst Resources löschen",
      "error"
    );
  }
};


 const createLecture = async (sectionId) => {

  if (loadingAction) return;   // 🔥 STOP

  const title = newLectureTitles[sectionId];

  if (!title || !title.trim()) {
    showToast("Titel darf nicht leer sein", "error");
    return;
  }

  setLoadingAction(true); // 🔥 START LOCK

  try {

    await api.post(`/sections/${sectionId}/lectures`, {
        title,
      });

    await loadCurriculum();
        
    showToast("Lecture erstellt");

    setNewLectureTitles(prev => ({
      ...prev,
      [sectionId]: ""
    }));

  } catch (err) {
    console.error(err);
    showToast("Fehler beim Erstellen", "error");
  } finally {
    setLoadingAction(false); // 🔥 RELEASE
  }
};

 const updateLecture = async (sectionId, lectureId) => {

  if (!editLectureTitle.trim()) {
    showToast("Titel darf nicht leer sein", "error");
    return;
  }

  try {

    await api.put(`/sections/${sectionId}/lectures/${lectureId}`, {
      title: editLectureTitle,
    });

    await loadCurriculum();   // 🔥 NEU

    showToast("Lecture aktualisiert");

    setEditingLectureId(null);
    setEditLectureTitle("");  

  } catch (err) {
    console.error(err);
    showToast("Fehler beim Aktualisieren", "error");
  }
};

const moveLectureUp = async (sectionId, lectureId) => {
  try {
    await api.post(`/sections/${sectionId}/lectures/${lectureId}/move-up`);
    await loadCurriculum();   // 🔥 FIX
  } catch (err) {
    console.error(err);
    showToast("Fehler beim Verschieben", "error");
  }
};


const moveLectureDown = async (sectionId, lectureId) => {
  try {
    await api.post(`/sections/${sectionId}/lectures/${lectureId}/move-down`);
    await loadCurriculum();   // 🔥 FIX
  } catch (err) {
    console.error(err);
    showToast("Fehler beim Verschieben", "error");
  }
};

  // =========================
  // ACCORDION
  // =========================

 const toggleSection = (id) => {
    if (loadingCurriculum) return;   // blockieren
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  ////////////////////////
  

  const handleLectureOpen = (sectionId, lectureId) => {
    navigate(`/sections/${sectionId}/lectures/${lectureId}/resources`);
  };


  // =========================
  // RENDER
  // =========================

  return (

    
                <div className="page-container" style={{ maxWidth: 1100, margin: "0 auto" }}>
                <div
              style={{
                background: "linear-gradient(135deg,#0f172a,#1e293b)",
                color: "white",
                borderRadius: "14px",
                padding: "26px 30px",
                marginTop: "30px",
                marginBottom: "10px" // 👈 kleiner machen!
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

           <div style={{ marginBottom: "24px", textAlign: "center" }}>
              <button
                onClick={() => navigate(`/courses/${courseId}`, { replace: true })}
                style={{
                  display: "inline-block",          // ❗ wichtig → kein full width
                  background: "#e2e8f0",
                  color: "#1e293b",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",

                  padding: "8px 16px",              // ❗ kompakter
                  cursor: "pointer",

                  fontWeight: "600",                // 🔥 fetter
                  fontSize: "14px",

                  minWidth: "220px",                // optional → saubere Breite
                }}
              >
                ← Zurück zum Kurs
              </button>
            </div>

            
            {[...sections]
                .sort((a,b)=>(a.sectionOrder ?? 0)-(b.sectionOrder ?? 0))
                .map((section,index)=>(
            <div key={section.id} className="accordion">

                {/* SECTION HEADER */}

        <div
        className="accordion-header"
        onClick={() => toggleSection(section.id)}
        >

          {editingSectionId === section.id ? (

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      width: "100%"
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >

                  <input
                      value={editSectionName}
                      onChange={(e) => setEditSectionName(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        flex: 1,
                        padding: "6px 10px",
                        border: "1px solid #ddd",
                        borderRadius: "6px"
                      }}
                    />
                   <button
                      className="icon-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateSection(section.id);
                      }}
                    >
                    💾
                    </button>

                  <button
                    className="icon-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSectionId(null);
                      setEditSectionName("");   

                    }}
                  >
                  ✖
                  </button>

                  </div>

                ) : (
                <>
                <span>
                  {index + 1}. {section.name}

                  <span style={{ opacity: 0.6, marginLeft: 6 }}>
                    {section.lectures?.length === 0
                      ? "(leer)"
                      : `(${section.lectures.length} Lectures)`}
                  </span>

                  {openSections[section.id] ? " ▼" : " ▶"}
                </span>

                <div onClick={(e) => e.stopPropagation()}>

                   <button 
                        className="icon-btn arrow" 
                        disabled={loadingCurriculum}
                        onClick={() => moveSectionUp(section.id)}
                      >
                      ↑
                    </button>             
                    
                    <button 
                      className="icon-btn arrow" 
                      disabled={loadingCurriculum}
                      onClick={() => moveSectionDown(section.id)}
                      >
                      ↓</button>
                  
                    <button
                    className="icon-btn"
                    onClick={() => {
                        setEditingSectionId(section.id);
                        setEditSectionName(section.name);
                    }}
                    >
                    ✏
                    </button>

                 <button
                    className="icon-btn danger"
                    disabled={
                        loadingCurriculum || (section.lectures?.length || 0) > 0
                    }
                    title={
                      (section.lectures?.length || 0) > 0
                        ? "Bitte zuerst alle Lectures löschen"
                        : "Kapitel löschen"
                    }
                    onClick={() => deleteSection(section.id)}
                  >
                  🗑
                  </button>

                </div>

                </>

            )}

            </div>

          {/* SECTION BODY */}

          {openSections[section.id] && (
            <div className="accordion-body">

             {[...section.lectures]
                .sort((a,b)=>(a.lectureOrder ?? 0)-(b.lectureOrder ?? 0))
                .map((lecture,i)=>(

                <div key={lecture.id} className="lecture-row">

                 {editingLectureId === lecture.id ? (

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        width: "100%"
                      }}
                    >

                  <input
                        autoFocus
                        value={editLectureTitle}
                        onChange={(e) => setEditLectureTitle(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault(); // optional, verhindert unerwünschte Effekte
                            updateLecture(section.id, lecture.id);
                          }
                          if (e.key === "Escape") {
                              setEditingLectureId(null);
                              setEditLectureTitle("");
                            }
                          }}
                        style={{
                          flex: 1,
                          padding: "6px 10px",
                          border: "1px solid #ddd",
                          borderRadius: "6px"
                        }}
                      />

                      <button
                        className="icon-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateLecture(section.id, lecture.id);
                        }}
                      >
                      💾
                      </button>

                      <button
                        className="icon-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingLectureId(null);
                          setEditLectureTitle("");   

                        }}
                      >
                      ✖
                      </button>

                    </div>

) : (
                    <>
                      <span>
                        {i + 1}. {lecture.title}
                      </span>

                      <div>

                        <button
                          className="icon-btn arrow"
                          disabled={loadingCurriculum}
                          onClick={() =>
                            moveLectureUp(section.id, lecture.id)
                          }
                        >
                          ↑
                        </button>

                        <button
                          className="icon-btn arrow"
                          disabled={loadingCurriculum}
                          onClick={() =>
                            moveLectureDown(section.id, lecture.id)
                          }
                        >
                          ↓
                        </button>

                        <button
                          className="icon-btn"
                          onClick={() => {
                            setEditingLectureId(lecture.id);
                            setEditLectureTitle(lecture.title);
                          }}
                        >
                          ✏
                        </button>

   
                       <button
                          className="icon-btn danger"
                          disabled={loadingCurriculum}
                          onClick={() => setConfirmDeleteLecture({ sectionId: section.id, lectureId: lecture.id })}
                        >
                        🗑
                        </button>

                       <button
                          onClick={(e) => {
                            e.stopPropagation(); // 🔥 wichtig wegen accordion!
                            handleLectureOpen(section.id, lecture.id);
                          }}
                        >
                          Resources
                        </button>

                      </div>
                    </>
                  )}

                </div>
              ))}

            {/* CREATE LECTURE */}

          <div
            className="new-lecture"
            style={{
              marginTop: 14,
              display: "flex",
              gap: 12,
              alignItems: "center"
            }}
          >

            <input
              type="text"
              placeholder="Neue Lecture eingeben..."
              value={newLectureTitles[section.id] || ""}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) =>
                setNewLectureTitles((prev) => ({
                  ...prev,
                  [section.id]: e.target.value
                }))
              }
              style={{
                flex: "1 1 auto",
                minWidth: 0,
                padding: "8px 10px",
                border: "1px solid #d1d5db",
                borderRadius: "6px"
              }}
            />

            <button
              disabled={
                loadingAction ||
                loadingCurriculum ||
                !newLectureTitles[section.id]?.trim()
              }
              onClick={(e) => {
                e.stopPropagation();
                createLecture(section.id);
              }}
              style={{
                flex: "0 0 auto",
                padding: "8px 14px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              + Lecture
            </button>

            {/* NEUER CANCEL BUTTON */}

            <button
              className="icon-btn"
              onClick={(e) => {
                e.stopPropagation();

                setNewLectureTitles((prev) => ({
                  ...prev,
                  [section.id]: ""
                }));

                toggleSection(section.id);
              }}
            >
              ✖
            </button>

          </div>
                      </div>
                    )}
                  </div>
                  
                ))}

     {/* CREATE SECTION */}

        <div
          className="new-lecture"
          style={{
            marginTop: 14,
            display: "flex",
            gap: 12,
            alignItems: "center"
          }}
        >

          <input
            type="text"
            placeholder="Neues Kapitel eingeben..."
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                createSection();
              }
              if (e.key === "Escape") {
                setNewSectionName("");
              }
            }}
            style={{
              flex: "1 1 auto",      // 🔥 WICHTIG
              minWidth: 0,           // 🔥 WICHTIG
              padding: "8px 10px",
              border: "1px solid #d1d5db",
              borderRadius: "6px"
            }}
          />

          <button
            disabled={loadingSection || loadingCurriculum || !newSectionName.trim()}
            onClick={(e) => {
              e.stopPropagation();
              createSection();
            }}
            style={{
              flex: "0 0 auto",      // 🔥 WICHTIG
              padding: "8px 14px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            + Kapitel
          </button>

          <button
            className="icon-btn"
            onClick={() => setNewSectionName("")}
          >
            ✖
          </button>

        </div>
        {confirmDeleteSectionId && (

        <div className="modal-overlay">

          <div className="modal">

            <h3>Kapitel löschen</h3>

           <p>
            Kapitel wirklich löschen?
            <br/>
            (Nur möglich wenn keine Lectures vorhanden sind)
          </p>

            <div className="modal-buttons">

              <button
                className="modal-cancel"
                onClick={() => setConfirmDeleteSectionId(null)}
              >
                Abbrechen
              </button>

              <button
                className="modal-delete"
                disabled={loadingCurriculum}
                onClick={confirmDeleteSection}
              >
                Löschen
              </button>

            </div>

          </div>

        </div>

      )}

      {confirmDeleteLecture && (

        <div className="modal-overlay">

          <div className="modal">

            <h3>Lecture löschen</h3>

            <p>
              Lecture wirklich löschen?
            </p>

            <div className="modal-buttons">

              <button
                className="modal-cancel"
                onClick={() => setConfirmDeleteLecture(null)}
              >
                Abbrechen
              </button>

              <button
                className="modal-delete"
                onClick={handleConfirmDeleteLecture}
              >
                Löschen
              </button>

            </div>

          </div>

        </div>

      )}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            background: toast.type === "error" ? "#ef4444" : "#22c55e",
            color: "white",
            padding: "12px 18px",
            borderRadius: "8px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
            zIndex: 9999
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}