import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "../../api";
import "./CoursePlayerPage.css";

const getResourceTitle = (resource) =>
  resource?.title || resource?.name || resource?.label || "Unbenannte Ressource";

const getResourceType = (resource) =>
  (resource?.resourceType || resource?.type || "TEXT").toUpperCase();

const getResourceText = (resource) =>
  resource?.content ||
  resource?.text ||
  resource?.description ||
  resource?.body ||
  "";

const getResourceUrl = (resource) =>
  resource?.url ||
  resource?.link ||
  resource?.fileUrl ||
  resource?.videoUrl ||
  "";

const getSectionTitle = (section, fallbackIndex) =>
  section?.title ||
  section?.name ||
  section?.sectionTitle ||
  section?.headline ||
  section?.topic ||
  `Kapitel ${fallbackIndex + 1}`;

const getLectureTitle = (lecture) =>
  lecture?.title ||
  lecture?.name ||
  lecture?.lectureTitle ||
  "Unbenannte Lektion";

  

export default function CoursePlayerPage() {
  const { courseId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [progress, setProgress] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [resources, setResources] = useState([]);
  const [openResourceIds, setOpenResourceIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resourceLoading, setResourceLoading] = useState(false);
  const [error, setError] = useState("");
  const activeLectureRef = useRef(null);
const sidebarRef = useRef(null);
const playerLayoutRef = useRef(null);
const didInitialPlayerScrollRef = useRef(false);
  

  const flatLectures = useMemo(() => {
    const list = [];

   sections.forEach((section, sectionIndex) => {
  const sectionTitle = getSectionTitle(section, sectionIndex);

  (section.lectures || []).forEach((lecture) => {
    list.push({
      ...lecture,
      title: getLectureTitle(lecture),
      sectionId: section.id,
      sectionTitle,
    });
  });
});

    return list;
  }, [sections]);

  const visitedLectureIds = progress?.visitedLectureIds || [];

  const nextOpenLecture = flatLectures.find(
  (lecture) => !visitedLectureIds.includes(lecture.id)
);

const isCourseCompleted = flatLectures.length > 0 && !nextOpenLecture;

  const selectedIndex = flatLectures.findIndex(
    (lecture) => lecture.id === selectedLecture?.id
  );

  const lastLectureIndex = flatLectures.findIndex(
    (lecture) => lecture.id === progress?.lastLectureId
  );

  const getLectureLearningStatus = (lecture) => {
  if (!lecture?.id) return "open";

  if (visitedLectureIds.includes(lecture.id)) {
    return "visited";
  }

  const lectureIndex = flatLectures.findIndex((item) => item.id === lecture.id);

  if (
    lastLectureIndex >= 0 &&
    lectureIndex >= 0 &&
    lectureIndex < lastLectureIndex
  ) {
    return "skipped";
  }

  return "open";
};

const getLectureStatus = (lecture) => {
  if (selectedLecture?.id === lecture?.id) return "active";
  return getLectureLearningStatus(lecture);
};

const getLectureStatusText = (status) => {
  if (status === "visited") return "Gelesen";
  if (status === "skipped") return "Übersprungen";
  return "Noch offen";
};

const getLectureStatusHint = (status) => {
  if (status === "visited") {
    return "Diese Lektion wurde bereits für deinen Fortschritt gezählt.";
  }

  if (status === "skipped") {
    return "Diese Lektion liegt vor deinem aktuellen Lernstand, wurde aber noch nicht gelesen.";
  }

  return "Öffne mindestens eine Ressource, damit diese Lektion als gelesen markiert wird.";
};

  const loadPlayerData = async () => {
    setLoading(true);
    setError("");

    try {
      const [courseRes, sectionsRes, progressRes] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get(`/courses/${courseId}/sections`),
        api.get(`/courses/${courseId}/lecture-progress`),
      ]);

      const sectionsData = sectionsRes.data || [];

      const sectionsWithLectures = await Promise.all(
  sectionsData.map(async (section, sectionIndex) => {
    const lecturesRes = await api.get(`/sections/${section.id}/lectures`);

    return {
      ...section,
      title: getSectionTitle(section, sectionIndex),
      lectures: (lecturesRes.data || []).map((lecture) => ({
        ...lecture,
        title: getLectureTitle(lecture),
      })),
    };
  })
);

      setCourse(courseRes.data);
      setSections(sectionsWithLectures);
      setProgress(progressRes.data);

      const allLectures = [];
      sectionsWithLectures.forEach((section, sectionIndex) => {
        const sectionTitle = getSectionTitle(section, sectionIndex);

        (section.lectures || []).forEach((lecture) => {
            allLectures.push({
            ...lecture,
            title: getLectureTitle(lecture),
            sectionId: section.id,
            sectionTitle,
            });
        });
        });

      const lectureIdFromUrl = Number(searchParams.get("lectureId"));

      const initialLecture =
        allLectures.find((lecture) => lecture.id === lectureIdFromUrl) ||
        allLectures.find(
          (lecture) => lecture.id === progressRes.data?.recommendedLectureId
        ) ||
        allLectures[0] ||
        null;

      setSelectedLecture(initialLecture);

      if (initialLecture) {
        setSearchParams({ lectureId: String(initialLecture.id) }, { replace: true });
      }
    } catch (err) {
      console.error("CoursePlayer konnte nicht geladen werden:", err);
      setError("Der Course Player konnte nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  };

  const loadResources = async (lecture) => {
    if (!lecture?.id) return;

    setResourceLoading(true);
    setResources([]);
    setOpenResourceIds([]);

    try {
      const res = await api.get(`/lectures/${lecture.id}/resources`);
      setResources(res.data || []);
    } catch (err) {
      console.error("Resources konnten nicht geladen werden:", err);
      setResources([]);
    } finally {
      setResourceLoading(false);
    }
  };

  const reloadProgress = async () => {
    try {
      const res = await api.get(`/courses/${courseId}/lecture-progress`);
      setProgress(res.data);
    } catch (err) {
      console.warn("Progress konnte nicht aktualisiert werden!");
    }
  };

 useEffect(() => {
  didInitialPlayerScrollRef.current = false;
  loadPlayerData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [courseId]);

  useEffect(() => {
    if (selectedLecture) {
      loadResources(selectedLecture);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLecture?.id]);

  useEffect(() => {
  if (loading || !selectedLecture?.id) {
    return;
  }

  // 1) Beim ersten Öffnen des Players soll die Seite zum Player-Anfang springen,
  //    nicht mitten in die linke Baumstruktur.
  if (!didInitialPlayerScrollRef.current) {
    didInitialPlayerScrollRef.current = true;

    window.requestAnimationFrame(() => {
      playerLayoutRef.current?.scrollIntoView({
        behavior: "auto",
        block: "start",
      });
    });
  }

  // 2) Nur die linke Kursansicht intern zur aktiven Lektion scrollen.
  //    Dadurch bleibt die rechte Inhaltsseite oben sichtbar.
  window.requestAnimationFrame(() => {
    const sidebar = sidebarRef.current;
    const activeItem = activeLectureRef.current;

    if (!sidebar || !activeItem) {
      return;
    }

    const sidebarRect = sidebar.getBoundingClientRect();
    const activeRect = activeItem.getBoundingClientRect();

    const activeTopInsideSidebar =
      activeRect.top - sidebarRect.top + sidebar.scrollTop;

    sidebar.scrollTo({
      top: Math.max(activeTopInsideSidebar - 120, 0),
      behavior: "smooth",
    });
  });
}, [loading, selectedLecture?.id]);

  const selectLecture = (lecture) => {
  setSelectedLecture(lecture);
  setSearchParams(
    { lectureId: String(lecture.id) },
    { replace: true }
  );
};

  const goToLectureByOffset = (offset) => {
    if (selectedIndex < 0) return;

    const target = flatLectures[selectedIndex + offset];

    if (target) {
      selectLecture(target);
    }
  };

  const goToNextOpenLecture = () => {
  if (nextOpenLecture) {
    selectLecture(nextOpenLecture);
  }
};

  const markLectureByResourceOpen = async (resource) => {
    if (!selectedLecture?.id || !resource?.id) return;

    try {
      await api.post("/lectures/resource-used", {
        lectureId: Number(selectedLecture.id),
      });
    } catch (err) {
      console.warn("Lecture konnte nicht als besucht markiert werden!");
    }

    try {
      await api.post(`/resources/${resource.id}/visited`);
    } catch (err) {
      console.warn("Resource-Progress optional nicht gespeichert!");
    }

    await reloadProgress();
  };

  const toggleResource = async (resource) => {
    const alreadyOpen = openResourceIds.includes(resource.id);

    if (alreadyOpen) {
      setOpenResourceIds((prev) => prev.filter((id) => id !== resource.id));
      return;
    }

    setOpenResourceIds((prev) => [...prev, resource.id]);
    await markLectureByResourceOpen(resource);
  };

  const startQuiz = (resource) => {
    navigate(`/quiz/${resource.id}/start`, {
      state: {
        returnTo: `/courses/${courseId}/player?lectureId=${selectedLecture?.id}`,
        courseId: Number(courseId),
        quizResourceId: resource.id,
        isFinalExam: Boolean(resource.courseFinalExam),
        source: "course-player",
      },
    });
  };

  const renderResourceContent = (resource) => {
    const type = getResourceType(resource);
    const text = getResourceText(resource);
    const url = getResourceUrl(resource);

    if (type === "QUIZ") {
      return (
        <div className="player-resource-content">
          <p>Starte das Quiz zu dieser Lektion.</p>
          <button className="player-primary-btn" onClick={() => startQuiz(resource)}>
            Quiz starten
          </button>
        </div>
      );
    }

    if (type === "VIDEO") {
      return (
        <div className="player-resource-content">
          {url ? (
            <a href={url} target="_blank" rel="noreferrer" className="player-link-btn">
              Video öffnen
            </a>
          ) : (
            <p>Kein Video-Link vorhanden.</p>
          )}
        </div>
      );
    }

    if (type === "LINK") {
      return (
        <div className="player-resource-content">
          {url ? (
            <a href={url} target="_blank" rel="noreferrer" className="player-link-btn">
              Link öffnen
            </a>
          ) : (
            <p>Kein Link vorhanden.</p>
          )}
        </div>
      );
    }

    if (type === "FILE") {
      return (
        <div className="player-resource-content">
          {url ? (
            <a href={url} target="_blank" rel="noreferrer" className="player-link-btn">
              Datei öffnen
            </a>
          ) : (
            <p>Keine Datei vorhanden.</p>
          )}
        </div>
      );
    }

    return (
      <div className="player-resource-content">
        {text ? <p>{text}</p> : <p>Kein Inhalt vorhanden.</p>}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="course-player-page">
        <div className="course-player-loading">Course Player wird geladen...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-player-page">
        <div className="course-player-error">{error}</div>
      </div>
    );
  }

    const currentLearningStatus = selectedLecture
    ? getLectureLearningStatus(selectedLecture)
    : "open";


  return (
    <div className="course-player-page">
      <section className="course-player-hero">
        <div>
          <span>Lernmodus</span>
          <h1>{course?.title || "Kurs"}</h1>
        </div>

       <button
          className="player-outline-btn"
          onClick={() =>
            navigate(`/courses/${courseId}`, {
              replace: true,
              state: { refreshProgress: Date.now() },
            })
          }
        >
          ← Zurück zum Kurs
        </button>
      </section>

      <section className="course-player-progress-card">
        <div>
          <strong>Fortschritt</strong>
          <span>{progress?.progressPercent ?? 0}%</span>
        </div>

        <div className="course-player-progress-track">
          <div
            className="course-player-progress-fill"
            style={{ width: `${progress?.progressPercent ?? 0}%` }}
          />
        </div>

       <button
            className="player-primary-btn small"
            onClick={goToNextOpenLecture}
            disabled={isCourseCompleted}
            >
            {isCourseCompleted ? "Kurs abgeschlossen" : "Nächste offene Lektion"}
            </button>
      </section>

      <main ref={playerLayoutRef} className="course-player-layout">
        <aside ref={sidebarRef} className="course-player-sidebar">
          <h2>Kursansicht</h2>

          <div className="course-player-legend">
            <span><b className="dot visited" /> Gelesen</span>
            <span><b className="dot skipped" /> Übersprungen</span>
            <span><b className="dot active" /> Aktuell</span>
          </div>

          {sections.map((section, sectionIndex) => (
            <div key={section.id} className="player-section-block">
            <h3>
                {sectionIndex + 1}. {getSectionTitle(section, sectionIndex)}
            </h3>

              {(section.lectures || []).map((lecture, lectureIndex) => {
                const lectureWithSection = {
                  ...lecture,
                  sectionId: section.id,
                  sectionTitle: getSectionTitle(section, sectionIndex),
                };

                const status = getLectureStatus(lecture);

                return (
                  <button
                        key={lecture.id}
                        ref={status === "active" ? activeLectureRef : null}
                        className={`player-lecture-item ${status}`}
                        onClick={() => selectLecture(lectureWithSection)}
                        >
                    <span className="lecture-index">{lectureIndex + 1}</span>
                    <span className="lecture-title">{getLectureTitle(lecture)}</span>
                    <span className="lecture-status">
                      {status === "visited" && "✓"}
                      {status === "skipped" && "!"}
                      {status === "active" && "▶"}
                      {status === "open" && "○"}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </aside>

        <section className="course-player-content">
          {selectedLecture ? (
            <>
              <div className="player-current-header">
                <span>{selectedLecture.sectionTitle}</span>
                <h2>{selectedLecture.title}</h2>
               <div className={`player-current-status ${currentLearningStatus}`}>
                <div className="player-status-badge">
                    {getLectureStatusText(currentLearningStatus)}
                </div>

                <div className="player-status-message">
                    {getLectureStatusHint(currentLearningStatus)}
                </div>
                </div>
              </div>

              <div className="player-nav-row">
                <button
                  className="player-secondary-btn"
                  disabled={selectedIndex <= 0}
                  onClick={() => goToLectureByOffset(-1)}
                >
                  ◀ Vorherige Lektion
                </button>

                <button
                  className="player-secondary-btn"
                  disabled={selectedIndex >= flatLectures.length - 1}
                  onClick={() => goToLectureByOffset(1)}
                >
                  Nächste Lektion ▶
                </button>
              </div>

              {resourceLoading ? (
                <div className="player-empty">Ressourcen werden geladen...</div>
              ) : resources.length === 0 ? (
                <div className="player-empty">
                  Für diese Lektion sind noch keine Ressourcen vorhanden.
                </div>
              ) : (
                <div className="player-resource-list">
                  {resources.map((resource) => {
                    const isOpen = openResourceIds.includes(resource.id);
                    const type = getResourceType(resource);

                    return (
                      <div key={resource.id} className="player-resource-card">
                        <button
                          className="player-resource-header"
                          onClick={() => toggleResource(resource)}
                        >
                          <span className="resource-type">{type.charAt(0)}</span>
                          <strong>{getResourceTitle(resource)}</strong>
                          <span>{isOpen ? "▲" : "▼"}</span>
                        </button>

                        {isOpen && renderResourceContent(resource)}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="player-empty">Keine Lecture gefunden.</div>
          )}
        </section>
      </main>
    </div>
  );
}