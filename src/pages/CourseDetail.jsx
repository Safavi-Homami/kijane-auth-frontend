// src/pages/CourseDetail.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import { useNavigate, useLocation } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHero from "../components/PageHero";
import "../CourseStyles.css";
import Modal from "../components/Modal";
import CreateAuthorPage from "./trainer/CreateAuthorPage";
import { buildPersonName, formatAuthorName } from "../utils/personName";

function CourseDetail() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showCreatedInfo, setShowCreatedInfo] = useState(false);
  const [authors, setAuthors] = useState([]);
  const [saveMessage, setSaveMessage] = useState(null);
  const [showAuthorModal, setShowAuthorModal] = useState(false);

  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [courseDraft, setCourseDraft] = useState(null);

  const { id } = useParams();
  const [course, setCourse] = useState(null);

  const [errorMessage, setErrorMessage] = useState(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState(null);
  const courseImageUploadRef = useRef(null);

  const [trainerImage, setTrainerImage] = useState(null);
  const [trainerPreview, setTrainerPreview] = useState(null);
  const [trainerUploading, setTrainerUploading] = useState(false);
  const [trainerError, setTrainerError] = useState(null);

  const [progress, setProgress] = useState(null);
  const [lastLecture, setLastLecture] = useState(null);
  const [lastLectureTitle, setLastLectureTitle] = useState(null);
  const [lastSectionName, setLastSectionName] = useState(null);

  const [certificateStatus, setCertificateStatus] = useState(null);
const [courseCertificate, setCourseCertificate] = useState(null);
const [roles, setRoles] = useState([]);

const isLoggedIn = !!sessionStorage.getItem("token");

useEffect(() => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "auto",
  });
}, [id]);

  const loadCourse = async () => {
    try {
      const courseRes = await api.get(`/courses/${id}`);
      setCourse(courseRes.data);
    } catch (err) {
      console.error("Course reload error!");
      setErrorMessage("Kurs konnte nicht geladen werden.");
    }
  };


const loadCourseCertificate = async (finalExamQuizId) => {
  if (!finalExamQuizId) return null;

  try {
    const res = await api.get("/certificates/my");

    return (
      (res.data || []).find(
        (cert) => Number(cert.quizId) === Number(finalExamQuizId)
      ) || null
    );
  } catch (err) {
    console.warn("Kurs-Zertifikat konnte nicht geladen werden!");
    return null;
  }
};


  const trainerFullName = buildPersonName({
  salutation: course?.trainerSalutation,
  title: course?.trainerTitle,
  firstName: course?.trainerFirstName,
  lastName: course?.trainerLastName,
  fallback: course?.authorNames?.[0] || "Unbekannt",
});

const primaryAuthorFullName = buildPersonName({
  salutation: course?.authorSalutations?.[0] || course?.authorSalutation,
  title: course?.authorTitles?.[0] || course?.authorTitle,
  firstName: course?.authorFirstNames?.[0] || course?.authorFirstName,
  lastName: course?.authorLastNames?.[0] || course?.authorLastName,
  fallback: course?.authorNames?.[0] || "Kein Author vorhanden",
});

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (trainerPreview) URL.revokeObjectURL(trainerPreview);
    };
  }, [previewUrl, trainerPreview]);

 
 useEffect(() => {
  const loadData = async () => {
    await loadCourse();

    const token = sessionStorage.getItem("token");

    if (!token) {
      setProgress(null);
      setLastLecture(null);
      setLastLectureTitle(null);
      setLastSectionName(null);
      setCertificateStatus(null);
      setCourseCertificate(null);
      return;
    }

    try {
      const progressRes = await api.get(`/courses/${id}/lecture-progress`);

      setProgress(progressRes.data?.progressPercent ?? 0);

      setLastLecture(
        progressRes.data.lastLectureId && progressRes.data.lastSectionId
          ? {
              lectureId: progressRes.data.lastLectureId,
              sectionId: progressRes.data.lastSectionId,
            }
          : null
      );

      setLastLectureTitle(progressRes.data.lastLectureTitle || null);

      setLastSectionName(
        progressRes.data.lastSectionName ||
          progressRes.data.sectionName ||
          null
      );
    } catch (err) {
      console.warn("Progress konnte nicht geladen werden:", err);
      setProgress(0);
    }

   let statusData = null;

try {
  const statusRes = await api.get(`/courses/${id}/certificate-status`);
  statusData = statusRes.data;
  setCertificateStatus(statusData);
} catch (err) {
  console.warn("Certificate status konnte nicht geladen werden!");
  setCertificateStatus(null);
}

const cert = await loadCourseCertificate(statusData?.finalExamQuizId);
setCourseCertificate(cert);
  };

  loadData();
}, [id, location.key, location.state?.refreshProgress]);


useEffect(() => {
  const token = sessionStorage.getItem("token");

  if (!token) {
    setRoles([]);
    return;
  }

  api
    .get("/auth/me")
    .then((res) => {
      setRoles(res.data?.roles || []);
    })
    .catch((err) => {
      console.warn("Rollen konnten nicht geladen werden!");
      setRoles([]);
    });
}, [id]);

  useEffect(() => {
    if (course && location.state?.createdCourse === true) {
      setShowCreatedInfo(true);

      navigate(location.pathname, {
        replace: true,
        state: {},
      });
    }
  }, [course?.id]);

  useEffect(() => {
    if (!course?.canEdit) return;

    api
      .get("/authors/my")
      .then((res) => setAuthors(res.data))
      .catch((err) => console.error("Autoren laden fehlgeschlagen!"));
  }, [course?.canEdit]);

  if (!course && errorMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{errorMessage}</p>
          <Link to="/courses" className="text-blue-600 underline">
            Zurück zur Kursliste
          </Link>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Lade Kurs...</p>
      </div>
    );
  }

  const startEditingCourse = () => {
    if (!course) return;

    setCourseDraft({
      title: course.title || "",
      description: course.description || "",
      targetAudience: course.targetAudience || "",
      prerequisites: course.prerequisites || "",
      notes: course.notes || "",
      trainerBio: course.trainerBio || "",

      authorId: course.authorIds?.[0] || "",
      authorName: course.authorNames?.[0] || "",
    });

    setIsEditingCourse(true);
    setShowCreatedInfo(false);
    setSaveMessage(null);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEditingCourse = () => {
    setIsEditingCourse(false);
    setCourseDraft(null);
    setShowCreatedInfo(false);
    setSaveMessage(null);
  };

  const handleSaveCourse = async () => {
    try {
      

      if (!courseDraft) return;

      await api.put(`/courses/${id}`, {
        title: courseDraft.title,
        description: courseDraft.description,
        targetAudience: courseDraft.targetAudience,
        prerequisites: courseDraft.prerequisites,
        notes: courseDraft.notes,
        trainerBio: courseDraft.trainerBio,
        authorIds: courseDraft.authorId ? [Number(courseDraft.authorId)] : [],
      });

      const courseRes = await api.get(`/courses/${id}`);
      setCourse(courseRes.data);

      setIsEditingCourse(false);
      setCourseDraft(null);
      setShowCreatedInfo(false);

      setSaveMessage("Kurs wurde gespeichert ✅");
    } catch (err) {
      console.error("❌ Course Update Fehler!");

      if (err.response?.status === 403) {
        alert("Keine Berechtigung");
      } else if (err.response?.status === 400) {
        alert("Ungültige Eingaben");
      } else {
        alert("Serverfehler");
      }
    }
  };

  const handleStartOrContinueCourse = async () => {
  try {
    if (progress > 0) {
      const res = await api.get(`/courses/${id}/next-lecture`);
      const next = res.data;

      if (next?.id) {
        navigate(`/courses/${id}/player?lectureId=${next.id}`);
        return;
      }

      navigate(`/courses/${id}/player`);
      return;
    }

    await api.post(`/courses/${id}/start`);

    const res = await api.get(`/courses/${id}/next-lecture`);
    const firstLecture = res.data;

    if (firstLecture?.id) {
      navigate(`/courses/${id}/player?lectureId=${firstLecture.id}`);
      return;
    }

    navigate(`/courses/${id}/player`);
  } catch (err) {
    console.error("Start Fehler!");
  }
};

  const handleTrainerUpload = async () => {
    if (!trainerImage || trainerUploading) return;

    const formData = new FormData();
    formData.append("file", trainerImage);

    try {
      setTrainerUploading(true);

      const res = await api.post(`/courses/trainer/avatar`, formData);
      const newAvatar = res.data;

      setCourse((prev) => ({
        ...prev,
        trainerAvatar: newAvatar,
      }));

      await loadCourse();

      alert("Trainerbild gespeichert ✅");

      setTrainerImage(null);
      setTrainerPreview(null);
    } catch (err) {
      console.error(err);
    } finally {
      setTrainerUploading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageError(null);

    if (!file.type.startsWith("image/")) {
      setImageError("Nur Bilddateien erlaubt");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError("Max 5MB");
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));

    setTimeout(() => {
      courseImageUploadRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);

    e.target.value = null;
  };

  const handleUpload = async () => {
    if (!selectedImage || uploading) return;

    const formData = new FormData();
    formData.append("file", selectedImage);

    try {
      setUploading(true);

      await api.post(`/courses/${id}/upload-image`, formData);

      await loadCourse();

      setSelectedImage(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error("❌ Upload Fehler FULL!");

      if (err.response) {
        console.error("Status:", err.response.status);
        
      }

      alert("Upload fehlgeschlagen");
    } finally {
      setUploading(false);
    }
  };

  const getAvatarSrc = (avatar) => {
    if (!avatar) return "/default-avatar.png";
    if (avatar.startsWith("http")) return avatar;
    return `http://localhost:8080${avatar}`;
  };

  const normalizedRoles = roles.map((role) => role.replace("ROLE_", ""));

const isAdmin = normalizedRoles.includes("ADMIN");
const isTrainer = normalizedRoles.includes("TRAINER");
const isManager = normalizedRoles.includes("MANAGER");
const isEditor = normalizedRoles.includes("EDITOR");

const isCourseCreatorRole = isAdmin || isTrainer || isManager || isEditor;

// Version 1:
// Jeder eingeloggte User darf fremde Kurse als Lernender starten.
// Nur eigene Kurse bleiben im Bearbeitungs-/Trainer-Modus.
const canUseStudentActions =
  isLoggedIn && !course?.canEdit && course?.canLearn === true;

const hasNoLearningAccess =
  isLoggedIn && !course?.canEdit && course?.canLearn !== true;

const canUseCreatorPreviewOnly =
  hasNoLearningAccess && isCourseCreatorRole;

const canUseLockedStudentInfo =
  hasNoLearningAccess && !isCourseCreatorRole;

const progressValue = Number(progress ?? 0);

// Für Version 1 ist der echte Kursabschluss im Frontend nur vom aktuellen Lernfortschritt abhängig.
// certificateStatus darf nicht den gelöschten/alten Fortschritt überstimmen.
const isCourseCompleted = progressValue >= 100;

const finalExamExists = certificateStatus?.finalExamExists === true;
const finalExamPassed = certificateStatus?.finalExamPassed === true;

const certificateAvailable =
  certificateStatus?.certificateAvailable === true;

const certificateIssued =
  certificateStatus?.certificateIssued === true || !!courseCertificate;

const finalExamTitle =
  certificateStatus?.finalExamTitle || "Abschlussprüfung";

const finalExamPercentage =
  certificateStatus?.bestFinalExamPercentage ?? null;

const formatPercent = (value) => {
  if (value === null || value === undefined) return "-";
  return `${Number(value).toFixed(0)}%`;
};

const formatDate = (value) => {
  if (!value) return "Noch nicht ausgestellt";
  return new Date(value).toLocaleDateString("de-DE");
};

const handleStartFinalExam = () => {
  const finalExamQuizId = certificateStatus?.finalExamQuizId;

  if (!finalExamQuizId) {
    alert("Für diesen Kurs wurde keine Abschlussprüfung gefunden.");
    return;
  }

  sessionStorage.setItem(
    `quiz-is-final-exam-${finalExamQuizId}`,
    "true"
  );

  sessionStorage.setItem(
    `quiz-course-id-${finalExamQuizId}`,
    String(id)
  );

  sessionStorage.setItem(
    `quiz-return-to-${finalExamQuizId}`,
    `/courses/${id}`
  );

  navigate(`/quiz-play/${finalExamQuizId}`, {
    state: {
      returnTo: `/courses/${id}`,
      isFinalExam: true,
      courseId: Number(id),
      quizResourceId: finalExamQuizId,
      quizTitle: finalExamTitle,
      source: "course-detail-final-exam",
    },
  });
};

const handleOpenCertificates = () => {
  navigate("/certificates", {
    state: {
      courseId: Number(id),
      returnTo: `/courses/${id}`,
      returnLabel: "← Zurück zum Kurs",
      courseReturnTo: `/courses/${id}`,
    },
  });
};


const handleReviewCourseContent = () => {
  navigate(`/courses/${id}/player`);
};

const handlePrimaryStudentCourseAction = () => {
  if (!canUseStudentActions) {
    return;
  }

  if (certificateAvailable) {
    handleOpenCertificates();
    return;
  }

  if (isCourseCompleted && finalExamExists && !finalExamPassed) {
    handleStartFinalExam();
    return;
  }

  if (isCourseCompleted) {
    handleReviewCourseContent();
    return;
  }

  handleStartOrContinueCourse();
};

const primaryStudentCourseButtonLabel = certificateAvailable
  ? "🎓 Zertifikat ansehen"
  : isCourseCompleted && finalExamExists && !finalExamPassed
  ? "🎓 Abschlussprüfung starten"
  : isCourseCompleted
  ? "🔁 Kursinhalt ansehen"
  : progressValue > 0
  ? "▶ Weiter lernen"
  : "🚀 Kurs starten";

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100">
      <div className="mx-auto max-w-6xl px-4 pt-2 pb-6">
         <PageHero
          eyebrow="Kurs"
          title={
            isEditingCourse ? (
              <input
                className="bg-white text-black px-3 py-1 rounded w-full"
                value={courseDraft?.title || ""}
                onChange={(e) =>
                  setCourseDraft((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
              />
            ) : (
              course?.title
            )
          }
        />

        {showCreatedInfo && (
          <div className="my-6 flex justify-center">
            <div className="w-full max-w-3xl rounded-2xl bg-slate-950 text-white shadow-xl border border-slate-800 p-6">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-xl">
                  ✅
                </div>

                <h3 className="text-xl font-bold">Ihr Kurs wurde angelegt</h3>

                <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                  Sie können die restlichen Felder und Bilder jetzt ergänzen
                  oder den Kurs später weiter bearbeiten.
                </p>

                <p className="mt-2 text-sm font-medium text-slate-200">
                  Möchten Sie diese Felder gleich befüllen?
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    setShowCreatedInfo(false);
                    startEditingCourse();
                  }}
                >
                  Ja, jetzt ergänzen
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white"
                  onClick={() => setShowCreatedInfo(false)}
                >
                  Nein, später
                </Button>
              </div>
            </div>
          </div>
        )}

        {!showCreatedInfo && (
          <>
            {saveMessage && (
              <div className="my-4 rounded-xl bg-green-50 border border-green-300 px-4 py-3 text-green-800 font-semibold">
                {saveMessage}
              </div>
            )}

            {isEditingCourse && (
              <div className="fixed bottom-0 left-0 w-full z-50 bg-yellow-50/95 border-t border-yellow-300 shadow-md">
                <div className="w-full px-4 py-2 flex items-center gap-6">
                  <span className="text-sm font-semibold text-yellow-800">
                    ✏️ Bearbeitungsmodus aktiv
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="whitespace-nowrap px-3"
                      onClick={handleSaveCourse}
                      disabled={!courseDraft?.title?.trim()}
                    >
                      💾 Kurs speichern
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="px-3"
                      onClick={cancelEditingCourse}
                    >
                      Abbrechen
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-8 mt-8">
              <div className="md:col-span-2 space-y-6">
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Über den Kurs</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                     {course?.imageUrl && !previewUrl && (
                        <div className="w-full aspect-[16/9] bg-slate-950 rounded-xl shadow overflow-hidden flex items-center justify-center">
                          <img
                            src={
                              course.imageUrl
                                ? `http://localhost:8080${course.imageUrl}`
                                : "/course-placeholder.jpg"
                            }
                            alt="Course"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}

                      {previewUrl && (
                        <div className="space-y-3">
                          {course?.imageUrl && (
                            <div>
                              <p className="text-xs text-slate-400 mb-1">
                                Aktuelles Bild
                              </p>

                             <div className="w-full aspect-[16/9] bg-slate-950 rounded-lg overflow-hidden opacity-60 flex items-center justify-center">
                                <img
                                  src={
                                    course.imageUrl
                                      ? `http://localhost:8080${course.imageUrl}`
                                      : "/course-placeholder.jpg"
                                  }
                                  alt="Current"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            </div>
                          )}

                          <div>
                            <p className="text-sm font-semibold text-blue-600 mb-1">
                              Vorschau (noch nicht gespeichert)
                            </p>

                           <div className="w-full aspect-[16/9] bg-slate-950 rounded-xl border-2 border-blue-500 shadow overflow-hidden flex items-center justify-center">
                              <img
                                src={previewUrl}
                                alt="Preview"
                                className="w-full h-full object-contain"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {course?.canEdit && (
                        <div
                          ref={courseImageUploadRef}
                          className="flex gap-3 items-center flex-wrap"
                        >
                          <input
                            id="fileUpload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />

                          <Button
                            type="button"
                            variant="outline"
                            disabled={uploading}
                            onClick={() =>
                              document.getElementById("fileUpload").click()
                            }
                          >
                            Bild auswählen
                          </Button>

                          {selectedImage && (
                            <Button onClick={handleUpload} disabled={uploading}>
                              {uploading ? "Lädt..." : "Bild speichern"}
                            </Button>
                          )}
                        </div>
                      )}

                      {imageError && (
                        <p className="text-red-500 text-sm mt-2">
                          {imageError}
                        </p>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold">Beschreibung</h4>

                      {isEditingCourse && courseDraft ? (
                        <textarea
                          className="w-full border rounded-lg p-2 mt-1 bg-white border-blue-400"
                          value={courseDraft?.description || ""}
                          onChange={(e) =>
                            setCourseDraft((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        <p className="text-slate-700 whitespace-pre-line">
                          {course?.description ||
                            "Keine Beschreibung vorhanden"}
                        </p>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold">Zielgruppe</h4>

                      {isEditingCourse && courseDraft ? (
                        <textarea
                          className="w-full border rounded-lg p-2 mt-1 bg-white border-blue-400"
                          value={courseDraft?.targetAudience || ""}
                          onChange={(e) =>
                            setCourseDraft((prev) => ({
                              ...prev,
                              targetAudience: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        <p className="text-slate-700">
                          {course?.targetAudience || "Keine Angaben"}
                        </p>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold">Voraussetzungen</h4>

                      {isEditingCourse && courseDraft ? (
                        <textarea
                          className="w-full border rounded-lg p-2 mt-1 bg-white border-blue-400"
                          value={courseDraft?.prerequisites || ""}
                          onChange={(e) =>
                            setCourseDraft((prev) => ({
                              ...prev,
                              prerequisites: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        <p className="text-slate-700">
                          {course?.prerequisites || "Keine Angaben"}
                        </p>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold">Hinweise</h4>

                      {isEditingCourse && courseDraft ? (
                        <textarea
                          className="w-full border rounded-lg p-2 mt-1 bg-white border-blue-400"
                          value={courseDraft?.notes || ""}
                          onChange={(e) =>
                            setCourseDraft((prev) => ({
                              ...prev,
                              notes: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        <p className="text-slate-700">
                          {course?.notes || "Keine Hinweise"}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Über den Trainer und Author(en)
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      {!course?.trainerAvatar && !trainerPreview && (
                        <p className="text-sm text-slate-400 italic">
                          Noch kein Trainerbild vorhanden – bitte hochladen
                        </p>
                      )}

                      {!trainerPreview && (
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-slate-500">
                            Trainer
                          </p>

                          <div className="flex items-center gap-4">
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 shadow border">
                              <img
                                src={getAvatarSrc(course?.trainerAvatar)}
                                alt="Trainer"
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div>
                              <p className="font-semibold text-lg">
                                {trainerFullName || "Unbekannt"}
                              </p>

                              <p className="text-sm text-slate-500">
                                {course?.trainerEmail || "Keine E-Mail"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {trainerPreview && (
                        <div className="space-y-3">
                          {course?.trainerAvatar && (
                            <div>
                              <p className="text-xs text-slate-400 mb-1">
                                Aktuelles Bild
                              </p>

                              <img
                                src={`http://localhost:8080${course.trainerAvatar}`}
                                alt="Current"
                                className="w-full max-h-40 object-cover rounded-lg opacity-60"
                              />
                            </div>
                          )}

                          <div>
                            <p className="text-sm font-semibold text-blue-600 mb-1">
                              Vorschau (noch nicht gespeichert)
                            </p>

                            <img
                              src={trainerPreview}
                              alt="Preview"
                              className="w-full max-h-56 object-cover rounded-xl border-2 border-blue-500 shadow"
                            />
                          </div>
                        </div>
                      )}

                      {course?.canEdit && (
                        <div className="flex gap-3 items-center flex-wrap">
                          <input
                            id="trainerUpload"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (!file) return;

                              setTrainerError(null);

                              if (!file.type.startsWith("image/")) {
                                setTrainerError("Nur Bilddateien erlaubt");
                                return;
                              }

                              if (file.size > 5 * 1024 * 1024) {
                                setTrainerError("Max 5MB");
                                return;
                              }

                              setTrainerImage(file);
                              setTrainerPreview(URL.createObjectURL(file));

                              e.target.value = null;
                            }}
                            className="hidden"
                          />

                          <Button
                            type="button"
                            variant="outline"
                            disabled={trainerUploading}
                            onClick={() =>
                              document.getElementById("trainerUpload").click()
                            }
                          >
                            Bild auswählen
                          </Button>

                          {trainerImage && (
                            <Button
                              onClick={handleTrainerUpload}
                              disabled={trainerUploading}
                            >
                              {trainerUploading ? "Lädt..." : "Bild speichern"}
                            </Button>
                          )}
                        </div>
                      )}

                      {trainerError && (
                        <p className="text-red-500 text-sm mt-2">
                          {trainerError}
                        </p>
                      )}
                    </div>

                    <div className="space-y-4 mt-6">
                      <h4 className="font-semibold text-lg">
                        Trainer Skills & Beschreibung
                      </h4>

                      {isEditingCourse ? (
                        <textarea
                          className="w-full border rounded-lg p-2 mt-1 bg-white border-blue-400"
                          value={courseDraft?.trainerBio || ""}
                          onChange={(e) =>
                            setCourseDraft((prev) => ({
                              ...prev,
                              trainerBio: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        <p className="text-slate-700 whitespace-pre-line">
                          {course?.trainerBio ||
                            "Keine Beschreibung vorhanden"}
                        </p>
                      )}
                    </div>

                    <div className="mt-4">
                      <h5 className="font-semibold text-sm text-slate-600">
                        Author(en)
                      </h5>

                      {isEditingCourse ? (
                        <div className="space-y-3">
                          <select
                            className="w-full border rounded-lg p-2 mt-1 bg-white border-blue-400"
                            value={courseDraft?.authorId || ""}
                            onChange={(e) =>
                              setCourseDraft((prev) => ({
                                ...prev,
                                authorId: e.target.value,
                              }))
                            }
                          >
                            <option value="">Bitte Author auswählen</option>

                            {authors.map((author) => (
                              <option key={author.id} value={author.id}>
                                {formatAuthorName(author)}
                              </option>
                            ))}
                          </select>

                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowAuthorModal(true)}
                          >
                            ➕ Neuen Author erstellen
                          </Button>
                        </div>
                      ) : (
                        <p className="text-slate-800">
                          {primaryAuthorFullName}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <aside className="space-y-4">
                <Card className="rounded-2xl shadow-sm md:sticky md:top-24">
                  <CardHeader>
                    <CardTitle className="text-lg">Kurs-Aktionen</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {course?.canEdit && !isEditingCourse && (
                      <Button className="w-full" onClick={startEditingCourse}>
                        ✏️ Kursprofil bearbeiten
                      </Button>
                    )}

                   {canUseStudentActions && (
                      <Button
                        className="w-full"
                        onClick={handlePrimaryStudentCourseAction}
                      >
                        {primaryStudentCourseButtonLabel}
                      </Button>
                    )}

                    {canUseCreatorPreviewOnly && (
                      <div className="rounded-xl border bg-slate-50 p-3 text-sm text-slate-700 leading-relaxed">
                        Du bist mit einer Verwaltungsrolle angemeldet.
                        Für diesen fremden Kurs ist kein Lernmodus aktiv.
                        Du kannst die Kursstruktur ansehen, aber keine Lernfortschritte erzeugen.
                      </div>
                    )}
                    {canUseLockedStudentInfo && (
                      <div className="rounded-xl border bg-amber-50 p-3 text-sm text-amber-800 leading-relaxed">
                        Für diesen Kurs hast du aktuell keine aktive Lernfreigabe.
                        Du kannst die Kursstruktur ansehen, aber den Lernmodus erst starten,
                        wenn ein Admin dich für diesen Kurs freigibt.
                      </div>
                    )}

                    {!course?.canEdit && !isLoggedIn && (
                      <Button asChild className="w-full">
                        <Link to="/login">Zur Demo-Anmeldung</Link>
                      </Button>
                    )}

                    <Button asChild variant="secondary" className="w-full">
                      <Link to={`/courses/${id}/curriculum-view?mode=preview`}>
                        👁 Kursstruktur ansehen
                      </Link>
                    </Button>

                    {course?.canEdit && (
                      <Button asChild className="w-full">
                        <Link
                          to={`/courses/${id}/curriculum`}
                          onClick={(e) => {
                            if (isEditingCourse) e.preventDefault();
                          }}
                        >
                          🧩 Kursstruktur verwalten
                        </Link>
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800"
                      onClick={() => navigate("/courses", { replace: true })}
                    >
                      ← Zurück zur Kursliste
                    </Button>
                  </CardContent>
                </Card>

                {canUseStudentActions && (
                    <Card className="rounded-2xl shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Mein Lernstand</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-3 text-sm">
                      <div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 transition-all"
                            style={{ width: `${progress || 0}%` }}
                          />
                        </div>

                        <p className="mt-2 font-semibold text-slate-700">
                          Fortschritt: {progress || 0}%
                        </p>
                      </div>

                      {lastSectionName && (
                        <p className="text-slate-600">
                          Letztes Kapitel:{" "}
                          <span className="font-semibold text-slate-800">
                            {lastSectionName}
                          </span>
                        </p>
                      )}

                      {lastLecture && (
                        <p className="text-slate-600">
                          Letzte Lektion:{" "}
                          <span className="font-semibold text-slate-800">
                            {lastLectureTitle || `#${lastLecture.lectureId}`}
                          </span>
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

             {canUseStudentActions && (
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Kursabschluss & Zertifikat</CardTitle>
                  </CardHeader>

                    <CardContent className="space-y-3 text-sm">
                      <div className="rounded-xl border bg-slate-50 p-3 space-y-2">
                        <p>
                          Kurs abgeschlossen:{" "}
                          <strong>{isCourseCompleted ? "Ja" : "Nein"}</strong>
                        </p>

                        <p>
                          Abschlussprüfung vorhanden:{" "}
                          <strong>{finalExamExists ? "Ja" : "Nein"}</strong>
                        </p>

                        <p>
                          Abschlussprüfung bestanden:{" "}
                          <strong>{finalExamPassed ? "Ja" : "Nein"}</strong>
                        </p>

                        <p>
                          Zertifikat verfügbar:{" "}
                          <strong>{certificateAvailable ? "Ja" : "Nein"}</strong>
                        </p>

                        {finalExamPercentage !== null && (
                          <p>
                            Bestes Prüfungsergebnis:{" "}
                            <strong>{formatPercent(finalExamPercentage)}</strong>
                          </p>
                        )}

                        {courseCertificate && (
                          <p>
                            Zertifikat ausgestellt am:{" "}
                            <strong>{formatDate(courseCertificate.issuedAt)}</strong>
                          </p>
                        )}
                      </div>

                      {isCourseCompleted && finalExamExists && !finalExamPassed && (
                        <Button className="w-full" onClick={handleStartFinalExam}>
                          🎓 Abschlussprüfung starten
                        </Button>
                      )}

                      {certificateAvailable && (
                        <Button className="w-full" onClick={handleOpenCertificates}>
                          🎓 Zertifikat anzeigen
                        </Button>
                      )}

                      {!finalExamExists && isCourseCompleted && (
                        <p className="text-xs text-slate-500">
                          Für diesen Kurs wurde noch keine Abschlussprüfung eingerichtet.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {course?.canEdit && (
                  <Card className="rounded-2xl shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Kurs-Check</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-2 text-sm">
                      <p>
                        {course?.description ? "✅" : "⚠️"} Beschreibung
                      </p>
                      <p>
                        {course?.targetAudience ? "✅" : "⚠️"} Zielgruppe
                      </p>
                      <p>
                        {course?.prerequisites ? "✅" : "⚠️"} Voraussetzungen
                      </p>
                      <p>{course?.notes ? "✅" : "⚠️"} Hinweise</p>
                      <p>
                        {course?.authorNames?.length > 0 ? "✅" : "⚠️"} Author
                      </p>
                      <p>
                        {course?.trainerAvatar ? "✅" : "⚠️"} Trainerbild
                      </p>
                      <p>{course?.imageUrl ? "✅" : "⚠️"} Kursbild</p>
                    </CardContent>
                  </Card>
                )}

                <Card className="rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Trainer Kurzinfo</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 border shadow-sm">
                        <img
                          src={getAvatarSrc(course?.trainerAvatar)}
                          alt="Trainer"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div>
                        <p className="font-semibold text-slate-900">
                          {trainerFullName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {course?.trainerEmail || "Keine E-Mail"}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600">
                      Author:{" "}
                      <span className="font-semibold text-slate-800">
                        {primaryAuthorFullName}
                      </span>
                    </p>
                  </CardContent>
                </Card>
              </aside>
            </div>

            <Modal
              isOpen={showAuthorModal}
              onClose={() => setShowAuthorModal(false)}
            >
              <CreateAuthorPage
                onClose={async (createdAuthorId) => {
                  setShowAuthorModal(false);

                  if (!createdAuthorId) return;

                  const res = await api.get("/authors/my");
                  setAuthors(res.data);

                  setCourseDraft((prev) => ({
                    ...prev,
                    authorId: String(createdAuthorId),
                  }));
                }}
              />
            </Modal>
          </>
        )}

        <div className="h-24" />
      </div>
    </div>
  );
}

export default CourseDetail;