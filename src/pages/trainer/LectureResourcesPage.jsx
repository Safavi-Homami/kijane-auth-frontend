import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api";
import { useUser } from "../../context/useUser";
import { downloadResource } from "./download";
import "./Course.css";
import PageHero from "../../components/PageHero";

const RESOURCE_TYPES = ["TEXT", "VIDEO", "FILE", "LINK", "QUIZ"];

const RESOURCE_BADGE = {
  VIDEO: { label: "V", color: "orange", title: "Video" },
  TEXT:  { label: "T", color: "blue",  title: "Text" },
  FILE:  { label: "F", color: "yellow",  title: "Datei" },
QUIZ:  { label: "Q", color: "quiz", title: "Quiz" },
  LINK:  { label: "L", color: "green",title: "Link" },
};

const getDisplayBadge = (res) => {
  if (!res) return null;

  if (res.type === "TEXT") {
    const title = (res.title || "").toLowerCase();
    const content = (res.content || "").toLowerCase();

    if (
      title.includes("code") ||
      title.includes("code-beispiel") ||
      content.includes("```")
    ) {
      return { label: "C", color: "code", title: "Code-Beispiel" };
    }

    if (
      title.includes("übung") ||
      title.includes("uebung") ||
      title.includes("exercise")
    ) {
      return { label: "Ü", color: "exercise", title: "Übung" };
    }
  }

  return RESOURCE_BADGE[res.type];
};



export default function LectureResourcesPage() {

const markLectureAsVisited = async () => {
  try {
    await api.post("/lectures/resource-used", {
      lectureId: Number(lectureId),
    });
  } catch (err) {
    console.warn("Progress update failed");
  }
}; 


const markResourceAsVisited = async (resourceId) => {
  if (!resourceId || isTempId(resourceId)) return;

  try {
    await api.post(`/resources/${resourceId}/visited`);
  } catch (err) {
    console.warn("Resource visited update failed!");
  }
};

const upsertResource = (updated) => {
  setResources(prev => {
    const exists = prev.some(r => r.id === updated.id);

    if (exists) {
      return prev.map(r => r.id === updated.id ? updated : r);
    }

    return [...prev, updated];
  });
};

  const [draft, setDraft] = useState(null);
  const [originalDraft, setOriginalDraft] = useState(null);
  const [saving, setSaving] = useState(false);



  const { sectionId, lectureId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  
  
 

  
  const [resources, setResources] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [creating, setCreating] = useState(false);


  const [deleteTarget, setDeleteTarget] = useState(null);

  const isTempId = (id) => String(id).startsWith("tmp-");

  const [quizErrors, setQuizErrors] = useState({});

  const [lecture, setLecture] = useState(null);
  const [section, setSection] = useState(null);
  const [course, setCourse] = useState(null);
  const [sectionLectures, setSectionLectures] = useState([]);
const [showCurriculumModal, setShowCurriculumModal] = useState(false);
  const canEditResources = course?.canEdit === true;

  const [hasLoadedResources, setHasLoadedResources] = useState(false);

  const [lectureNavigation, setLectureNavigation] = useState(null);

  const [courseProgressPercent, setCourseProgressPercent] = useState(0);

const courseCompleted = Number(courseProgressPercent) >= 100;

  // =========================
// YouTube Helpers (SAFE)
// =========================

const getYoutubeEmbedUrl = (url) => {
  if (!url || typeof url !== "string") return null;

  // youtu.be/VIDEOID
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1]?.split(/[?&]/)[0];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }

  // youtube.com/watch?v=VIDEOID
  if (url.includes("watch?v=")) {
    const id = url.split("watch?v=")[1]?.split(/[?&]/)[0];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }

  return null;
};

const isValidVideoUrl = (url) => {
  return !!getYoutubeEmbedUrl(url);
};

// 🅲 Playlist-ID aus YouTube-URL extrahieren
const getYoutubePlaylistId = (url) => {
  if (!url || typeof url !== "string") return null;

  // playlist?list=PL123
  if (url.includes("playlist?list=")) {
    return url.split("playlist?list=")[1]?.split(/[?&]/)[0] || null;
  }

  // watch?v=XXX&list=PL123
  if (url.includes("list=")) {
    return url.split("list=")[1]?.split(/[?&]/)[0] || null;
  }

  return null;
};

const isPlaylistUrl = (url) => {
  return !!getYoutubePlaylistId(url);
};


 // 🅱️ B – YouTube-URL sanitisieren (Parameter & Müll entfernen)
const sanitizeVideoUrl = (url) => {
  if (!url) return "";

  // youtu.be/VIDEOID?xyz
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1].split(/[?&]/)[0];
    return `https://www.youtube.com/watch?v=${id}`;
  }

  // youtube.com/watch?v=VIDEOID&xyz
  if (url.includes("watch?v=")) {
    const id = url.split("watch?v=")[1].split(/[?&]/)[0];
    return `https://www.youtube.com/watch?v=${id}`;
  }

  // sonst unverändert zurück
  return url;
};


  /* =========================
     BACKEND CALLS
     ========================= */

  const loadResources = async () => {
    try {
      const res = await api.get(`/lectures/${lectureId}/resources`);
      setResources(res.data);
    } catch (e) {
      console.error("Failed to load resources", e);
    }
  };

  const refreshCourseProgress = async (courseId) => {
  if (!courseId) return 0;

  try {
    const res = await api.get(`/courses/${courseId}/lecture-progress`);
    const progress = Number(res.data?.progressPercent ?? 0);

    setCourseProgressPercent(progress);
    return progress;
  } catch (err) {
    console.warn("Course progress konnte nicht geladen werden!");
    setCourseProgressPercent(0);
    return 0;
  }
};

  
useEffect(() => {
  async function loadContext() {
    try {
      const sectionRes = await api.get(`/sections/${sectionId}`);
      setSection(sectionRes.data);

      const lecturesRes = await api.get(`/sections/${sectionId}/lectures`);
      setSectionLectures(lecturesRes.data);

      const foundLecture = lecturesRes.data.find(
        (l) => String(l.id) === String(lectureId)
      );

      setLecture(foundLecture);

      const courseRes = await api.get(`/courses/${sectionRes.data.courseId}`);
      setCourse(courseRes.data);

      await refreshCourseProgress(sectionRes.data.courseId);

      try {
        const navRes = await api.get(`/lectures/${lectureId}/navigation`);
        setLectureNavigation(navRes.data);
      } catch (err) {
        console.warn("Lecture navigation konnte nicht geladen werden!");
        setLectureNavigation(null);
      }
    } catch (err) {
      console.error("Kontext laden fehlgeschlagen", err);
    }
  }

  if (!user || !lectureId || !sectionId) return;

    loadContext();
    loadResources();
    setHasLoadedResources(true);
    }, [user, lectureId, sectionId]);


useEffect(() => {
  const loadCourseProgress = async () => {
    if (!course?.id) return;

    try {
      const res = await api.get(`/courses/${course.id}/lecture-progress`);
      setCourseProgressPercent(Number(res.data?.progressPercent ?? 0));
    } catch (err) {
      console.warn("Course progress konnte nicht geladen werden!");
      setCourseProgressPercent(0);
    }
  };

  loadCourseProgress();
}, [course?.id]);


// ✅ Sicherheits-Redirect:
// LectureResourcesPage ist ab jetzt nur noch für Trainer/Admin-Resource-Verwaltung.
// Wer nicht bearbeiten darf, gehört in den neuen CoursePlayer.
useEffect(() => {
  if (!course?.id || !lectureId) return;

  if (course.canEdit !== true) {
    navigate(`/courses/${course.id}/player?lectureId=${lectureId}`, {
      replace: true,
    });
  }
}, [course?.id, course?.canEdit, lectureId, navigate]);


  const createResourceBackend = async (payload) =>
    (await api.post(`/lectures/${lectureId}/resources`, payload)).data;

  const updateResourceBackend = async (id, payload) =>
    (await api.put(`/lectures/${lectureId}/resources/${id}`, payload)).data;

  const deleteResourceBackend = async (id) =>
    api.delete(`/lectures/${lectureId}/resources/${id}`);

  const moveResourceBackend = async (id, dir) =>
    api.put(`/lectures/${lectureId}/resources/${id}/move`, null, {
      params: { direction: dir },
    });

const [downloadedId, setDownloadedId] = useState(null);

const normalizeLinkUrl = (url) => {
  if (!url) return "";

  let cleaned = url.trim();

  // Mehrfache Protokolle entfernen
  cleaned = cleaned.replace(/^https?:\/\/(https?:\/\/)+/, "https://");

  if (
    cleaned.startsWith("http://") ||
    cleaned.startsWith("https://")
  ) {
    return cleaned;
  }

  return "https://" + cleaned;
};

const isVideoSearchLinkTitle = (title = "") => {
  return /^video-(suche|empfehlung):/i.test(String(title).trim());
};

const buildYoutubeSearchUrlFromTitle = (title = "") => {
  const query = String(title)
    .replace(/^video-(suche|empfehlung):\s*/i, "")
    .trim();

  if (!query) return "";

  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query).replace(/%20/g, "+")}`;
};

const getEffectiveLinkUrl = (res) => {
  const title = String(res?.title || "").trim();
  const rawUrl = String(res?.url || "").trim();

  // ✅ Wichtig:
  // Bei Video-Suche/Video-Empfehlung ignorieren wir gespeicherte kaputte URLs komplett.
  // Die KI speichert manchmal Markdown-Links wie [https://...](https://...)
  if (isVideoSearchLinkTitle(title)) {
    return buildYoutubeSearchUrlFromTitle(title);
  }

  // Normale Links
  if (rawUrl) {
    return normalizeLinkUrl(rawUrl);
  }

  return "";
};

const isDirty = () => {
  if (!draft || !originalDraft) return false;
  return JSON.stringify(draft) !== JSON.stringify(originalDraft);
};


// Auto-Save deaktiviert:
// Trainer/Admin sollen Resources bewusst manuell speichern.
// Dadurch verlässt die Resource nicht automatisch den Bearbeitungsmodus.
  /* =========================
     HELPERS
     ========================= */

  const createResourceByType = (type) => ({
  id: `tmp-${Date.now()}`,
  type,
  title: "",

  description: "",
  timeLimitMinutes: 10,
  passingPercentage: 70,
  content: "",
  url: "",
  domain: "",
  fileName: "",
  fileSize: 0,
});

const createDraftFromResource = (r) => ({ ...r });

const mapDraftToSaveDto = (d) => {
  const base = { type: d.type, title: d.title };

  if (d.type === "TEXT") base.content = d.content ?? "";

  if (d.type === "VIDEO") {
    base.url = d.url ?? "";
  }

  if (d.type === "LINK") {
    base.url = d.url ?? "";
    base.domain = d.domain ?? "";
  }

  if (d.type === "FILE") {
    base.fileName = d.fileName ?? "";
    base.fileSize = d.fileSize ?? 0;
  }

  if (d.type === "QUIZ") {
  base.description = d.description ?? "";
  base.timeLimitMinutes = d.timeLimitMinutes ?? 0;
  base.passingPercentage = d.passingPercentage ?? 0;

  // alte Logik bleibt vorerst kompatibel
  base.certificateEnabled = d.certificateEnabled ?? false;

  // ✅ NEU: Kurs-Abschlussprüfung
  base.courseFinalExam = d.courseFinalExam ?? false;
}

  return base;
};

  const removeLocal = (id) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
    if (openId === id) setOpenId(null);
    if (editingId === id) {
      setEditingId(null);
      setDraft(null);
      //setSelectedFile(null);
    }
  };

  /* =========================
     DELETE (with modal)
     ========================= */

  const confirmDelete = async () => {
    const target = deleteTarget;
    setDeleteTarget(null);
    if (!target) return;

    // Temp-resource nur lokal löschen
    if (isTempId(target.id)) {
      removeLocal(target.id);
      return;
    }

    try {
  await deleteResourceBackend(target.id);

  // 🔥 LOCAL REMOVE
  removeLocal(target.id);

} catch (e) {
  console.error("Delete failed", e);
}
  };

  /* =========================
   SAVE
   ========================= */
const handleSave = async () => {
  if (!draft) return;


    if (saving) return;
    setSaving(true);

        // =========================
      // QUIZ VALIDATION (FRONTEND)
      // =========================
      if (draft.type === "QUIZ") {

        const errors = {};

        if (!draft.description || draft.description.trim() === "") {
          errors.description = "Beschreibung ist erforderlich.";
        }

       if (draft.timeLimitMinutes == null || draft.timeLimitMinutes <= 0)
         {
          errors.timeLimitMinutes = "Zeitlimit muss größer als 0 sein.";
        }

        if (
            draft.passingPercentage == null ||
            draft.passingPercentage <= 0 ||
            draft.passingPercentage > 100
          )
         {
           errors.passingPercentage = "Bestehensquote muss zwischen 1 und 100 liegen.";
         }

       if (Object.keys(errors).length > 0) {
          setQuizErrors(errors);
          setSaving(false); // 🔥 WICHTIG
          return;
        }

        setQuizErrors({});

      }

  try {
    // =========================
    // FILE (Option A: Create → Upload)
    // =========================
    if (draft.type === "FILE") {
  const file = draft._file;

  // 🟢 FALL 1: Neue Datei → Upload
  if (file) {
    // 🔥 NEU
    removeLocal(draft.id);

    const created = await createResourceBackend({
      type: "FILE",
      title: draft.title
    });

    const fd = new FormData();
    fd.append("file", file);

    await api.post(`/lectures/resources/${created.id}/upload`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

// 🔥 KEIN GET MEHR!

const newResource = {
  ...created,
  fileName: file.name,
  fileSize: file.size,
  type: "FILE",
  title: draft.title
};

setResources(prev => {
  return prev
    .filter(r => !isTempId(r.id))
    .concat(newResource)
    .sort((a, b) => a.position - b.position);
});
    setEditingId(null);
    setDraft(null);
    setOriginalDraft(null);
    setOpenId(created.id);
  }

  // 🟢 FALL 2: Nur Titel ändern (bestehende Datei behalten)
  else {
   const updated = await updateResourceBackend(draft.id, {
  type: "FILE",
  title: draft.title
});

// 🔥 LOCAL UPDATE
upsertResource(updated);

  setEditingId(null);
  setDraft(null);
  setOriginalDraft(null);

  setOpenId(updated.id);
  }
}

    // =========================
    // TEXT / VIDEO / LINK / QUIZ
    // =========================
    else {
  let payload = mapDraftToSaveDto(draft);

  // 🔗 LINK automatisch normalisieren
  if (draft.type === "LINK") {
  const rawUrl = String(payload.url || "").trim();

  if (rawUrl) {
    payload.url = normalizeLinkUrl(rawUrl);
  } else if (isVideoSearchLinkTitle(payload.title)) {
    payload.url = buildYoutubeSearchUrlFromTitle(payload.title);
  } else {
    payload.url = "";
  }
}

  const saved = isTempId(draft.id)
    ? await createResourceBackend(payload)
    : await updateResourceBackend(draft.id, payload);

    // 🔥 NEU: sofort Draft schließen → verhindert 2. Save!
    setEditingId(null);
    setDraft(null);
    setOriginalDraft(null);

    setResources(prev => {
  // 🔥 FALL 1: TEMP RESOURCE → ersetzen
  if (isTempId(draft.id)) {
    return prev
      .filter(r => !isTempId(r.id))
      .concat(saved)
      .sort((a, b) => a.position - b.position);
  }

  // 🔥 FALL 2: UPDATE → EXISTIERENDE ERSETZEN
  return prev
    .map(r => r.id === saved.id ? saved : r)
    .sort((a, b) => a.position - b.position);
});
    
  }

    // =========================
    // CLEANUP
    // =========================
    setEditingId(null);
    setDraft(null);
    setOriginalDraft(null);
    setSaving(false);
    setOpenId(null);
  } catch (e) {
  console.error("Save failed", e);

  const message =
    e.response?.data?.message ||
    e.response?.data?.error ||
    e.response?.data ||
    "Speichern fehlgeschlagen.";

  if (draft?.type === "QUIZ") {
    setQuizErrors((prev) => ({
      ...prev,
      general: message,
    }));
  }

  alert(message);
  setSaving(false);
}
};

 const handleCancelEdit = () => {
  // 🔥 NEU: Dirty Check
  if (isDirty()) {
    const confirmLeave = window.confirm("Änderungen verwerfen?");
    if (!confirmLeave) return;
  }

  // bestehende Logik
  if (draft?.id && isTempId(draft.id)) {
    removeLocal(draft.id);
    setOpenId(null);
  }

  setEditingId(null);
  setDraft(null);
  setOriginalDraft(null); // 🔥 wichtig!
  setQuizErrors({});
};


const scrollResourceIntoView = (resourceId) => {
  setTimeout(() => {
    const item = document.getElementById(`res-${resourceId}`);
    if (!item) return;

    const body = item.querySelector(".accordion-body");
    const target = body || item;

    const yOffset = -140;
    const y =
      target.getBoundingClientRect().top +
      window.pageYOffset +
      yOffset;

    window.scrollTo({
      top: y,
      behavior: "smooth",
    });
  }, 120);
};

const openResourceForCurrentMode = async (res, isOpen) => {
  const nextOpen = isOpen ? null : res.id;

  setOpenId(nextOpen);
  setDownloadedId(null);

  if (!nextOpen) return;

  // Wichtig:
  // Trainer/Admin öffnen Resources zur Verwaltung.
  // Das darf KEIN Lernfortschritt sein.
  if (!canEditResources) {
    await markLectureAsVisited();
    await markResourceAsVisited(res.id);

    if (course?.id) {
      await refreshCourseProgress(course.id);
    }
  }

  scrollResourceIntoView(res.id);
};

  const handleStartQuizForStudent = async (res) => {
  if (!res?.id) {
    console.warn("Quiz-Resource hat keine ID!");
    return;
  }

  const quizResourceId = res.id;
  const isFinalExam = res.courseFinalExam === true;

  // ✅ Bei Abschlussprüfung zuerst aktuellen Kursfortschritt prüfen
  if (isFinalExam) {
    const latestProgress = await refreshCourseProgress(course?.id);

    if (latestProgress < 100) {
      alert(
        `Die Abschlussprüfung ist erst verfügbar, wenn der Kurs zu 100% abgeschlossen ist. Aktueller Fortschritt: ${latestProgress}%`
      );
      return;
    }
  }

  const returnTo = `/sections/${sectionId}/lectures/${lectureId}/resources`;

  // ✅ Rücksprung speichern
  sessionStorage.setItem(
    `quiz-return-to-${quizResourceId}`,
    returnTo
  );

  // ✅ HIER GENAU REIN: Abschlussprüfung stabil speichern
  if (isFinalExam) {
    sessionStorage.setItem(
      `quiz-is-final-exam-${quizResourceId}`,
      "true"
    );

    if (course?.id) {
      sessionStorage.setItem(
        `quiz-course-id-${quizResourceId}`,
        String(course.id)
      );
    }
  }

  await markLectureAsVisited();
  await markResourceAsVisited(quizResourceId);

  navigate(`/quiz-play/${quizResourceId}`, {
    state: {
      returnTo,

      sectionId,
      lectureId,
      courseId: course?.id,

      courseTitle: course?.title,
      sectionName: section?.name,
      lectureTitle: lecture?.title,

      quizResourceId,
      quizTitle: res.title,

      // ✅ wichtig für QuizPlayPage und QuizResultPage
      isFinalExam,
    },
  });
};
  /* =========================
     RENDER
     ========================= */

   const normalizeResourceText = (value) => {
  if (!value) return "";

  return String(value)
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();
};

const renderInlineContent = (text, keyPrefix) => {
  if (!text) return null;

  return String(text)
    .split(/(`[^`]*`|\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part, index) => {
      const key = `${keyPrefix}-inline-${index}`;

      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={key} className="resource-inline-code">
            {part.slice(1, -1)}
          </code>
        );
      }

      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={key}>{part.slice(2, -2)}</strong>;
      }

      return <span key={key}>{part}</span>;
    });
};

const renderMultilineInlineContent = (text, keyPrefix) => {
  if (!text) return null;

  const lines = String(text).split("\n");

  return lines.map((line, index) => (
    <span key={`${keyPrefix}-line-${index}`}>
      {renderInlineContent(line, `${keyPrefix}-line-${index}`)}
      {index < lines.length - 1 && <br />}
    </span>
  ));
};

const renderTextParagraphs = (text, parentIndex) => {
  const normalized = normalizeResourceText(text);

  if (!normalized) return null;

  return normalized
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((paragraph, index) => {
      const p = paragraph.trim();

      if (!p) return null;

      // Markdown Headings
      if (p.startsWith("### ")) {
        return (
          <h4
            key={`${parentIndex}-heading-${index}`}
            className="resource-heading"
          >
            {p.replace(/^###\s*/, "")}
          </h4>
        );
      }

      if (p.startsWith("## ")) {
        return (
          <h3
            key={`${parentIndex}-heading-${index}`}
            className="resource-heading"
          >
            {p.replace(/^##\s*/, "")}
          </h3>
        );
      }

      if (p.startsWith("# ")) {
        return (
          <h3
            key={`${parentIndex}-heading-${index}`}
            className="resource-heading"
          >
            {p.replace(/^#\s*/, "")}
          </h3>
        );
      }

      // KI-Labels wie:
      // **Aufgabe:** ...
      // **Erwartetes Ergebnis:** ...
      // **Erklärung:** ...
      const boldLabelMatch = p.match(/^\*\*(.+?):\*\*\s*([\s\S]*)$/);

      if (boldLabelMatch) {
        const label = boldLabelMatch[1].trim();
        const value = boldLabelMatch[2].trim();

        return (
          <div
            key={`${parentIndex}-label-box-${index}`}
            className="resource-info-box"
          >
            <div className="resource-info-label">{label}</div>

            {value && (
              <div className="resource-info-content">
                {renderMultilineInlineContent(
                  value,
                  `${parentIndex}-label-content-${index}`
                )}
              </div>
            )}
          </div>
        );
      }

      // KI-Labels ohne Markdown:
      // Aufgabe: ...
      // Erklärung: ...
      const plainLabelMatch = p.match(
        /^(Aufgabe|Erwartetes Ergebnis|Erklärung|Hinweis|Ziel|Beispiel|Zusammenfassung):\s*([\s\S]*)$/i
      );

      if (plainLabelMatch) {
        const label = plainLabelMatch[1].trim();
        const value = plainLabelMatch[2].trim();

        return (
          <div
            key={`${parentIndex}-plain-label-box-${index}`}
            className="resource-info-box"
          >
            <div className="resource-info-label">{label}</div>

            {value && (
              <div className="resource-info-content">
                {renderMultilineInlineContent(
                  value,
                  `${parentIndex}-plain-label-content-${index}`
                )}
              </div>
            )}
          </div>
        );
      }

      const lines = p
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      // Bullet List
      if (lines.length > 0 && lines.every((line) => line.startsWith("- "))) {
        return (
          <ul key={`${parentIndex}-list-${index}`} className="resource-list">
            {lines.map((line, lineIndex) => (
              <li key={`${parentIndex}-list-${index}-${lineIndex}`}>
                {renderInlineContent(
                  line.replace(/^- /, ""),
                  `${parentIndex}-list-${index}-${lineIndex}`
                )}
              </li>
            ))}
          </ul>
        );
      }

      // Numbered List
      if (lines.length > 0 && lines.every((line) => /^\d+\.\s+/.test(line))) {
        return (
          <ol
            key={`${parentIndex}-ordered-list-${index}`}
            className="resource-list resource-ordered-list"
          >
            {lines.map((line, lineIndex) => (
              <li key={`${parentIndex}-ordered-list-${index}-${lineIndex}`}>
                {renderInlineContent(
                  line.replace(/^\d+\.\s+/, ""),
                  `${parentIndex}-ordered-list-${index}-${lineIndex}`
                )}
              </li>
            ))}
          </ol>
        );
      }

      return (
        <p
          key={`${parentIndex}-paragraph-${index}`}
          className="resource-paragraph"
        >
          {renderMultilineInlineContent(
            p,
            `${parentIndex}-paragraph-${index}`
          )}
        </p>
      );
    });
};

const normalizeCodeLanguage = (rawLanguage, codeText) => {
  const lang = String(rawLanguage || "").trim().toLowerCase();
  const code = String(codeText || "").toLowerCase();

  // C++ automatisch erkennen, auch wenn KI fälschlich ```java schreibt
  if (
    code.includes("#include") ||
    code.includes("using namespace std") ||
    code.includes("std::") ||
    code.includes("cout <<") ||
    code.includes("cin >>")
  ) {
    return "C++";
  }

  const languageMap = {
    cpp: "C++",
    "c++": "C++",
    cxx: "C++",
    hpp: "C++",

    c: "C",
    cs: "C#",
    "c#": "C#",
    csharp: "C#",

    java: "Java",
    js: "JavaScript",
    javascript: "JavaScript",
    jsx: "JSX",
    ts: "TypeScript",
    typescript: "TypeScript",
    tsx: "TSX",

    py: "Python",
    python: "Python",

    html: "HTML",
    css: "CSS",
    scss: "SCSS",
    sass: "Sass",

    sql: "SQL",
    json: "JSON",
    yaml: "YAML",
    yml: "YAML",
    xml: "XML",

    bash: "Bash",
    sh: "Shell",
    shell: "Shell",
    powershell: "PowerShell",
    ps1: "PowerShell",

    php: "PHP",
    go: "Go",
    rust: "Rust",
    rs: "Rust",
    ruby: "Ruby",
    rb: "Ruby",
    perl: "Perl",
    lua: "Lua",
  };

  return languageMap[lang] || (lang ? lang.toUpperCase() : "CODE");
};



const renderFormattedTextResource = (content) => {
  const text = normalizeResourceText(content);

  if (!text) return null;

  const parts = text.split(/(```[\s\S]*?```)/g).filter(Boolean);

  return (
    <div className="text-preview formatted-resource-text">
      {parts.map((part, index) => {
        const trimmed = part.trim();

        if (trimmed.startsWith("```")) {
         const match = trimmed.match(/^```([^\s\n]*)?\s*\n?([\s\S]*?)```$/);

        const rawLanguage = match?.[1] || "code";

        const code = match?.[2]
          ? match[2].trim()
          : trimmed
              .replace(/^```[^\n]*\n?/, "")
              .replace(/```$/, "")
              .trim();

        const language = normalizeCodeLanguage(rawLanguage, code);
                  return (
                    <div key={`code-${index}`} className="resource-code-block">
                      <div className="resource-code-header">{language}</div>

                      <pre>
                        <code>{code}</code>
                      </pre>
                    </div>
                  );
                }

                return renderTextParagraphs(part, index);
              })}
            </div>
          );
        };

  if (!user) {
  return (
    <div className="page-container resource-page">
      <div className="content-card">
        <PageHero eyebrow="Resources" title="Lade Benutzer..." />
        <p style={{ textAlign: "center", padding: "20px", opacity: 0.7 }}>
          Benutzer wird geladen...
        </p>
      </div>
    </div>
  );
}

if (course && course.canEdit !== true) {
  return null;
}
  
  return (
        <div className="page-container resource-page">
          <div className="content-card">
        <PageHero
            eyebrow={
              course && section && lecture
                ? `${course.title} → ${section.name} → ${lecture.title} → Resources`
                : "Resources"
            }
            title={lecture?.title || "Lecture"}
          />

          {lectureNavigation && (
  <div className={canEditResources ? "trainer-lecture-nav" : "student-lecture-nav"}>

    <button
      className="secondary-btn"
      disabled={!lectureNavigation.previousLectureId}
      onClick={() =>
        navigate(
          `/sections/${lectureNavigation.previousSectionId}/lectures/${lectureNavigation.previousLectureId}/resources`
        )
      }
    >
      ◀ Vorherige Lecture
    </button>

    <button
        className="secondary-btn"
        onClick={() =>
          navigate(
            canEditResources
              ? `/courses/${course.id}/curriculum`
              : `/courses/${course.id}/curriculum-view?mode=student`,
            { replace: true }
          )
        }
      >
       Zur Kursverwaltung
      </button>

    <button
      className="secondary-btn"
      disabled={!lectureNavigation.nextLectureId}
      onClick={() =>
        navigate(
          `/sections/${lectureNavigation.nextSectionId}/lectures/${lectureNavigation.nextLectureId}/resources`
        )
      }
    >
      Nächste Lecture ▶
    </button>
  </div>
)}

      <div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px"
  }}
>
  
  {canEditResources && (
    <button
      className="primary-btn"
      onClick={() => setCreating(true)}
    >
      + Neue Resource
    </button>
  )}
</div>
        {/* CREATE */}
      

            {/* 🔥 SEPARATER BLOCK */}
            {creating && (
              <div className="create-overlay">
                <div className="create-bar">
                  {RESOURCE_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        const r = createResourceByType(type);
                        setResources((p) => [...p, r]);
                        setOpenId(r.id);
                        setEditingId(r.id);
                        setDraft(createDraftFromResource(r));

                        // ✅ WICHTIG
                        setCreating(false);
                      }}
                    >
                      {type}
                    </button>
                  ))}

                  <button
                    className="secondary-btn"
                    onClick={() => setCreating(false)}
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            )}


          
        {/* LIST */}

        

        {resources.length === 0 && (
         <p style={{ 
            opacity: 0.6,
            textAlign: "center",
            padding: "20px"
          }}>
            📭 Keine Inhalte vorhanden
          </p>
        )}

        <div className="list-container">
          {resources.map((res) => {
            const isOpen = openId === res.id;
            const isEditing = editingId === res.id;

            return (
              <div
                  id={`res-${res.id}`}
                  key={res.id}
                  className={`accordion-item ${isOpen ? "open" : ""}`}
                >
                <div
                  className="accordion-header"
                  onClick={() => openResourceForCurrentMode(res, isOpen)}
                >

  
                  {/* ICON */}
                 {getDisplayBadge(res) && (
                    <span
                      className={`resource-badge badge-${getDisplayBadge(res).color}`}
                      title={getDisplayBadge(res).title}
                    >
                      {getDisplayBadge(res).label}
                    </span>
                  )}

                  {/* TITLE */}
                  <span className="resource-title">
                    {res.title || "Ohne Titel"}
                  </span>

                  {/* SPACER */}
                  <div className="spacer" />

                  {/* ACTIONS (optional hier reinziehen!) */}
                {canEditResources && (
                    <div
                      className="inline-actions"
                      onClick={(e) => e.stopPropagation()} // 🔥 wichtig!
                    >
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          await moveResourceBackend(res.id, -1);
                          setHasLoadedResources(false);
                          loadResources();
                        }}
                      >
                        ⬆️
                      </button>

                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          await moveResourceBackend(res.id, 1);
                          setHasLoadedResources(false);
                          loadResources();
                        }}
                      >
                        ⬇️
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenId(res.id); 
                          setEditingId(res.id);
                          const newDraft = {
                                ...res,
                                courseFinalExam: res.courseFinalExam ?? false,
                              };

                              setDraft(newDraft);
                              setOriginalDraft(newDraft);
                         setTimeout(() => {
                            const el = document.getElementById(`res-${res.id}`);
                            if (!el) return;

                            const yOffset = -120; // 🔥 Abstand nach oben (anpassen!)
                            const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;

                            window.scrollTo({
                              top: y,
                              behavior: "smooth",
                            });
                          }, 100);             
                        }}
                      >
                        ✏️
                      </button>

                      <button
                        className="danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(res);
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  )}

                  {/* ARROW ganz rechts */}
                 <span
                    className="accordion-arrow"
                    onClick={(e) => {
                      e.stopPropagation();
                      openResourceForCurrentMode(res, isOpen);
                    }}
                  >
                    {isOpen ? "▼" : "▶"}
                  </span>
                </div>
                  

                {isOpen && (
                  <div className="accordion-body">
                    {/* VIEW */}
                    {!isEditing && (
                      <>
                        {res.description && <p>{res.description}</p>}

                        {res.type === "QUIZ" && res.courseFinalExam && (
                          <div className="final-exam-badge">
                            🎓 Abschlussprüfung
                          </div>
                        )}

                       {res.type === "TEXT" && res.content && renderFormattedTextResource(res.content)}

                    {/* Quiz */}

                    {res.type === "QUIZ" && (
  <div style={{ marginTop: "10px" }}>
    {canEditResources ? (
  <button
    className="primary-btn"
    onClick={(e) => {
      e.stopPropagation();

     const returnTo = `/sections/${sectionId}/lectures/${lectureId}/resources`;
                    const isFinalExam = res.courseFinalExam === true;

                    sessionStorage.setItem(
                      `quiz-return-to-${res.id}`,
                      returnTo
                    );

                    if (course?.id) {
                      sessionStorage.setItem(
                        `quiz-course-id-${res.id}`,
                        String(course.id)
                      );
                    }

                    if (isFinalExam) {
                      sessionStorage.setItem(
                        `quiz-is-final-exam-${res.id}`,
                        "true"
                      );
                    } else {
                      sessionStorage.removeItem(`quiz-is-final-exam-${res.id}`);
                    }

                    navigate(`/quiz-editor/${res.id}`, {
                      state: {
                        returnTo,
                        sectionId,
                        lectureId,
                        lectureOrder: lecture?.orderIndex,
                        lectureTitle: lecture?.title,
                        sectionName: section?.name,
                        courseTitle: course?.title,
                        courseId: course?.id,
                        isFinalExam,
                      },
                    });
                        }}
                      >
                        📝 Quiz bearbeiten
                      </button>
                    ) : res.courseFinalExam === true && !courseCompleted ? (
                      <button
                        className="secondary-btn"
                        disabled
                        title="Die Abschlussprüfung ist erst nach 100% Kursfortschritt verfügbar."
                      >
                        🔒 Abschlussprüfung erst nach Kursabschluss
                      </button>
                    ) : (
                      <button
                        className="primary-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartQuizForStudent(res);
                        }}
                      >
                        {res.courseFinalExam === true
                          ? "🎓 Abschlussprüfung starten"
                          : "▶️ Quiz starten"}
                      </button>
                    )}
                      </div>
                    )}

                  {/* LINK */}
{res.type === "LINK" && (() => {
  const effectiveUrl = getEffectiveLinkUrl(res);

  if (!effectiveUrl) {
    return (
      <p className="hint">
        ⚠️ Kein gültiger Link hinterlegt.
      </p>
    );
  }

  return (
    <div className="link-preview">
      <a
        href={effectiveUrl}
        target="_self"
        className="link-anchor"
        onClick={(e) => {
          e.stopPropagation();
          
        }}
      >
        🔗 {res.title || effectiveUrl}
      </a>

      
    </div>
  );
})()}


                    {/* VIDEO – mit URL */}
                       {res.type === "VIDEO" && res.url && (
                          <div className="video-preview">

                            {getYoutubeEmbedUrl(res.url) ? (
                              <>
                                <iframe
                                  width="560"
                                  height="315"
                                  src={getYoutubeEmbedUrl(res.url)}
                                  title={res.title}
                                  frameBorder="0"
                                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              
                              </>
                            ) : (
                              <a
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="video-link"
                               
                              >
                                ▶️ Video öffnen
                              </a>
                            )}

                          </div>
                        )}
                        {/* VIDEO – OHNE URL (Hinweis) */}
                        {res.type === "VIDEO" && !res.url && (
                          <p className="hint">
                            ⚠️ Kein Video-Link hinterlegt
                          </p>
                        )}

                        {res.type === "FILE" &&
                          res.fileName &&
                          !isTempId(res.id) && (
                            <div className="file-info">
                              <p>
                                📎 {res.fileName} ({Math.round(res.fileSize / 1024)} KB)
                              </p>

                          <button
                          className={`download-btn ${
                            downloadedId === res.id ? "downloaded" : "ready"
                          }`}
                         onClick={async () => {
                            if (!canEditResources) {
                              await markResourceAsVisited(res.id);
                            }

                            await downloadResource(res.id);
                            setDownloadedId(res.id);
                          }}
                        >
                          {downloadedId === res.id
                            ? "📎 Datei erneut herunterladen"
                            : "📥 Datei herunterladen"}
                        </button>



                            </div>
                          )}

                       
                      </>
                    )}

                    {/* EDIT */}
                    
                    {canEditResources && isEditing && draft && (
                      <div className="resource-edit">

                        {saving && (
                          <div className="saving-indicator">
                            ⏳ Upload läuft...
                          </div>
                        )}

                                                  {/* ✅ HIER REIN */}
                                              <label className="resource-label">
                                                Titel
                                                {!draft.title && (
                          <p className="error-text">
                            ❌ Titel ist erforderlich
                          </p>
                        )}

                        <input
                          className="resource-input"
                          value={draft.title}
                          onChange={(e) =>
                            setDraft({ ...draft, title: e.target.value })
                          }
                        />
                      </label>

                                          

                       {draft.type === "VIDEO" && (
                          <>
                           <label className="resource-label">
                              Video-URL (YouTube oder extern)
                            </label>

                            {/* INPUT */}
                            <input
                              className={`resource-input ${
                                draft.url && !isValidVideoUrl(draft.url) ? "input-error" : ""
                              }`}
                              placeholder="https://www.youtube.com/watch?v=… oder https://youtu.be/…"
                              value={draft.url || ""}
                              onChange={(e) =>
                                setDraft({
                                  ...draft,
                                  url: sanitizeVideoUrl(e.target.value),
                                })
                              }

                            />

                              {draft.url && !isValidVideoUrl(draft.url) && (
                              <p className="error-text">
                                ❌ Ungültige Video-URL (nur YouTube wird unterstützt)
                              </p>
                            )}

                            {draft.url && isPlaylistUrl(draft.url) && (
                              <p className="error-text">
                                ❌ YouTube-Playlists werden nicht unterstützt.  
                                Bitte ein einzelnes Video verwenden.
                              </p>
                            )}

                            {/* LIVE PREVIEW */}
                            {getYoutubeEmbedUrl(draft.url) && (
                              <div className="video-preview edit-preview">
                                <iframe
                                  width="560"
                                  height="315"
                                  src={getYoutubeEmbedUrl(draft.url)}
                                  title="Video Preview"
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              </div>
                            )}
                          </>
                        )}

                        {draft.type === "TEXT" && (
                        <label className="resource-label">
                          Inhalt (Markdown)
                          <textarea
                            className="resource-textarea"
                            rows={10}
                            value={draft.content || ""}
                            onChange={(e) =>
                              setDraft({ ...draft, content: e.target.value })
                            }
                          />
                        </label>
                      )}

                     {draft.type === "LINK" && (
                          <>
                            <label className="resource-label">
                              URL
                              <input
                                className="resource-input"
                                placeholder="example.com oder https://example.com"
                                value={draft.url || ""}
                                onChange={(e) =>
                                  setDraft({ ...draft, url: e.target.value })
                                }
                              />
                            </label>
                          </>
                        )}

                        {/* FILE PICKER (button-style, wie dein Beispiel) */}
                        {draft.type === "FILE" && (
                          <div className="file-picker">
                            <div className="file-picker-head">
                              <span className="file-picker-icon">📎</span>
                              <strong>Datei (max. 50 MB)</strong>
                            </div>

                            <input
                              id={`file-${draft.id}`}
                              className="file-input-hidden"
                              type="file"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;

                                if (file) {
                                  setDraft((prev) => ({
                                    ...prev,
                                    _file: file,
                                    fileName: file.name,
                                    fileSize: file.size,
                                  }));
                                }
                              }}
                            />

                            <div className="file-picker-row">
                              <label className="file-choose-btn" htmlFor={`file-${draft.id}`}>
                                Datei auswählen
                              </label>

                              <span className="file-name">
                                {draft._file?.name || draft.fileName || "KEINE AUSGEWÄHLT"}
                              </span>
                            </div>

                            {/* 🔥 HIER EINFÜGEN (GANZ WICHTIG) */}
                            {(!draft._file && !draft.fileName) && (
                              <p className="error-text">
                                ❌ Bitte eine Datei auswählen
                              </p>
                            )}
                          </div>
                        )}
                        {draft.type === "QUIZ" && (
                          <>

                              {quizErrors.general && (
                                <p className="error-text">
                                  ❌ {quizErrors.general}
                                </p>
                              )}
                              <label className="resource-label final-exam-toggle">
                              <span>
                                Abschlussprüfung für diesen Kurs
                              </span>

                              <input
                                type="checkbox"
                                checked={draft.courseFinalExam || false}
                                onChange={(e) =>
                                  setDraft({
                                    ...draft,
                                    courseFinalExam: e.target.checked,
                                  })
                                }
                              />
                            </label>

                            <p className="hint" style={{ marginTop: "-6px", marginBottom: "12px" }}>
                              Nur ein Quiz pro Kurs kann als Abschlussprüfung markiert werden.
                            </p>  

                           <label className="resource-label">
                              Beschreibung
                              <textarea
                                className={`resource-textarea ${
                                  quizErrors.description ? "input-error" : ""
                                }`}
                                rows={3}
                                value={draft.description || ""}
                                onChange={(e) => {
                                  setDraft({ ...draft, description: e.target.value });
                                  setQuizErrors((prev) => ({ ...prev, description: undefined }));
                                }}
                              />
                            </label>

                            {quizErrors.description && (
                              <p className="error-text">
                                {quizErrors.description}
                              </p>
                            )}

                           {/* Zeitlimit */}
                          <label className="resource-label">
                            Zeitlimit (Minuten)
                            <input
                              type="number"
                              min="1"
                              max="300"
                              step="1"
                              inputMode="numeric"
                              className={`resource-input ${
                                quizErrors.timeLimitMinutes ? "input-error" : ""
                              }`}
                              value={draft.timeLimitMinutes ?? ""}
                              onChange={(e) => {
                                let value = e.target.value;

                                if (value === "") {
                                  setDraft({ ...draft, timeLimitMinutes: "" });
                                  return;
                                }

                                value = parseInt(value, 10);

                                if (value < 1) value = 1;

                                setDraft({
                                  ...draft,
                                  timeLimitMinutes: value,
                                });

                                setQuizErrors((prev) => ({
                                  ...prev,
                                  timeLimitMinutes: undefined,
                                }));
                              }}
                            />
                          </label>

                          {quizErrors.timeLimitMinutes && (
                            <p className="error-text">
                              {quizErrors.timeLimitMinutes}
                            </p>
                          )}

                          {/* Bestehensquote */}
                          <label className="resource-label">
                            Bestehensquote (%)
                            <input
                              type="number"
                              min="1"
                              max="100"
                              step="1"
                              inputMode="numeric"
                              className={`resource-input ${
                                quizErrors.passingPercentage ? "input-error" : ""
                              }`}
                              value={draft.passingPercentage ?? ""}
                              onChange={(e) => {
                                let value = e.target.value;

                                if (value === "") {
                                  setDraft({ ...draft, passingPercentage: "" });
                                  return;
                                }

                                value = parseInt(value, 10);

                                if (value < 1) value = 1;
                                if (value > 100) value = 100;

                                setDraft({
                                  ...draft,
                                  passingPercentage: value,
                                });

                                setQuizErrors((prev) => ({
                                  ...prev,
                                  passingPercentage: undefined,
                                }));
                              }}
                            />
                          </label>

                          {quizErrors.passingPercentage && (
                            <p className="error-text">
                              {quizErrors.passingPercentage}
                            </p>
                          )}

                          </>
                        )}


                       <button
                          onClick={handleSave}
                          disabled={
                          saving ||

                          // 🔴 FILE VALIDATION
                          (draft.type === "FILE" && (
                            !draft.title ||
                            draft.title.trim() === "" ||
                            (!draft._file && !draft.fileName)
                          )) ||

                          // 🟠 VIDEO
                          (draft.type === "VIDEO" &&
                            (!isValidVideoUrl(draft.url) || isPlaylistUrl(draft.url))
                          ) ||

                          // 🔵 QUIZ
                          (draft.type === "QUIZ" && (
                            !draft.description ||
                            draft.description.trim() === "" ||
                            !draft.timeLimitMinutes || draft.timeLimitMinutes < 1 ||
                            !draft.passingPercentage ||
                            draft.passingPercentage < 1 ||
                            draft.passingPercentage > 100
                          ))
                        }
                        >
                          💾
                        </button>
                        <button
                          className="secondary-btn"
                          onClick={handleCancelEdit}
                        >
                          ❌ Abbrechen
                        </button>
                        </div>                      
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

          {/* ✅ CURRICULUM INFO MODAL */}
        {showCurriculumModal && (
          <div
            className="modal-backdrop"
            onClick={() => setShowCurriculumModal(false)}
          >
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Kursinhalt</h3>

              <p style={{ marginBottom: "12px", opacity: 0.7 }}>
                {course?.title} → {section?.name}
              </p>

              <div style={{ display: "grid", gap: "8px" }}>
                {sectionLectures.map((l, index) => {
                  const isCurrent = String(l.id) === String(lectureId);

                  return (
                    <div
                      key={l.id}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "10px",
                        background: isCurrent ? "#dbeafe" : "#f1f5f9",
                        fontWeight: isCurrent ? "700" : "500",
                      }}
                    >
                      {index + 1}. {l.title}
                      {isCurrent && "  ← aktuelle Lektion"}
                    </div>
                  );
                })}
              </div>

              <div className="modal-actions" style={{ marginTop: "16px" }}>
                <button onClick={() => setShowCurriculumModal(false)}>
                  Schließen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ DELETE MODAL (Sicherheitsfrage) */}
        {deleteTarget && (
          <div className="modal-backdrop" onClick={() => setDeleteTarget(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Resource löschen?</h3>
              <p>
                Willst du <strong>{deleteTarget.title}</strong> wirklich löschen?
              </p>

              <div className="modal-actions">
                <button className="danger" onClick={confirmDelete}>
                  Ja, löschen
                </button>
                <button onClick={() => setDeleteTarget(null)}>Abbrechen</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
