import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { buildPersonName } from "../utils/personName";

export default function CourseCard({
  course,
  onOpen,
  onToggleVisibility,
  onDelete,
  isNewest = false,

  // 🔥 NEU
  mode = "trainer",
  progressPercent = 0,
  certificateStatus,
  lastLectureTitle,
  lastSectionName,
  nextLectureTitle,
  hasVideo = false,
 onContinue,
  onReview,

  onStartFinalExam
  }) {

const handleImageOpen = (e) => {
  e.stopPropagation();

  if (onOpen) {
    onOpen();
  }
};    

 // Kursliste / Kurskarte:
// bewusst OHNE Anrede, aber MIT Titel.
// Beispiel: "Dr. Sebastian Trainer"
// Nicht: "Herr Dr. Sebastian Trainer"
const trainerFullName = buildPersonName({
  title: course.trainerTitle,
  firstName: course.trainerFirstName,
  lastName: course.trainerLastName,
  fallback: course.authorNames?.[0] || "Kein Trainer",
});


  const trainerInitial =
  trainerFullName && trainerFullName !== "Kein Trainer"
    ? trainerFullName.trim().charAt(0).toUpperCase()
    : "?";

const hasTrainerAvatar =
  course.trainerAvatar &&
  course.trainerAvatar !== "null" &&
  course.trainerAvatar !== "undefined" &&
  course.trainerAvatar.trim?.() !== "";
 
  const title =
    course.title || course.name || course.courseName || "Unbenannter Kurs";

 const rating = course.rating ?? null;

// ✅ Stabiler Status-Fallback:
// Wenn certificateStatus kurz null ist, bleibt die Karte trotzdem stabil.
const safeProgressPercent = Number(progressPercent ?? course.progressPercent ?? 0);

const status = certificateStatus || course.certificateStatus || {
  courseId: course.id,
  progressPercent: safeProgressPercent,
  courseCompleted: safeProgressPercent >= 100,
  finalExamExists: false,
  finalExamQuizId: null,
  finalExamTitle: null,
  finalExamPassed: false,
  bestFinalExamPercentage: null,
  certificateIssued: false,
  certificateAvailable: false,
};

const hasFinalExam = status.finalExamExists === true;
const finalExamPassed = status.finalExamPassed === true;
const certificateAvailable = status.certificateAvailable === true;
const finalExamQuizId = status.finalExamQuizId;

const displayCourseCompleted =
  status.courseCompleted === true || safeProgressPercent >= 100;

const canStartFinalExam =
  safeProgressPercent >= 100 &&
  hasFinalExam &&
  !finalExamPassed &&
  !!finalExamQuizId;

  const COURSE_PLACEHOLDER = "/course-placeholder.jpg";

const AVATAR_PLACEHOLDER = "/avatar-placeholder.png";

const getAvatarSrc = (avatar) => {
  if (
    !avatar ||
    avatar === "null" ||
    avatar === "undefined" ||
    avatar.trim?.() === ""
  ) {
    return AVATAR_PLACEHOLDER;
  }

  if (avatar.startsWith("http")) return avatar;

  return `http://localhost:8080${avatar}`;
};



const imageSrc =
  course.imageUrl &&
  typeof course.imageUrl === "string" &&
  course.imageUrl.trim() !== "" &&
  course.imageUrl !== "null"
    ? `http://localhost:8080${course.imageUrl}`
    : COURSE_PLACEHOLDER;


   const avatarSrc = getAvatarSrc(course.trainerAvatar);   


    const AvatarCircle = () => (
  <div className="relative w-8 h-8 shrink-0 overflow-visible">
    {hasTrainerAvatar ? (
      <img
        src={avatarSrc}
        className="
          w-8 h-8 rounded-full object-cover bg-gray-200
          transition-transform duration-300 ease-out
          hover:scale-[2.5] hover:z-50 hover:shadow-xl
          relative
        "
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.style.display = "none";
        }}
      />
    ) : (
      <div
        className="
          w-8 h-8 rounded-full bg-slate-300 text-slate-700
          flex items-center justify-center text-xs font-bold
          transition-transform duration-300 ease-out
          hover:scale-[2.5] hover:z-50 hover:shadow-xl
          relative
        "
      >
        {trainerInitial}
      </div>
    )}
  </div>
);


  // 🟢 =========================
  // 🎓 STUDENT MODE
  // 🟢 =========================
  if (mode === "student") {
    return (
      <Card
        className="
        w-full max-w-[320px]
        flex flex-col
        rounded-2xl overflow-hidden
        shadow-md hover:shadow-xl
        transition-all duration-300
        cursor-pointer
        transform hover:-translate-y-1
        bg-gradient-to-br from-indigo-50 via-white to-indigo-100
        dark:from-zinc-900 dark:to-zinc-800
        "
      >

        {/* IMAGE */}
        <div
            className="h-[140px] w-full overflow-hidden relative cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={handleImageOpen}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleImageOpen(e);
              }
            }}
            title="Kursdetails öffnen"
          >
          <img
            src={imageSrc}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = COURSE_PLACEHOLDER;
            }}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            alt={title}
          />

          {hasVideo && (
            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
              ▶
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="flex flex-col p-4 gap-2 flex-1">

          <div className="font-semibold text-sm line-clamp-2">
            {title}
          </div>

          <div className="flex items-center gap-2 mt-1">
          <AvatarCircle />
            <span className="text-xs text-gray-500">
              {trainerFullName}
            </span>
          </div>

          {rating !== null && rating > 0 && (
            <div className="text-xs text-gray-500">
              ⭐ {rating}
            </div>
          )}

          {lastSectionName && (
            <div className="text-xs text-gray-600 mt-1">
              <span className="font-medium">Letztes Kapitel:</span>
              <div className="truncate">{lastSectionName}</div>
            </div>
          )}

          {lastLectureTitle && (
            <div className="text-xs text-gray-600 mt-1">
              <span className="font-medium">Letzte Lektion:</span>
              <div className="truncate">{lastLectureTitle}</div>
            </div>
          )}

          {safeProgressPercent > 0 && safeProgressPercent < 100 && nextLectureTitle && (
            <div className="text-xs text-gray-600 mt-1">
              <span className="font-medium">Nächste Lektion:</span>
              <div className="truncate">{nextLectureTitle}</div>
            </div>
          )}

         {safeProgressPercent >= 100 ? (
          <div className="mt-2 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-center">
            ✅ Kurs absolviert
          </div>
        ) : (
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Fortschritt</span>
              <span>{safeProgressPercent}%</span>
            </div>

            <div className="w-full h-[6px] bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all"
                style={{ width: `${safeProgressPercent}%` }}
              />
            </div>
          </div>
        )}

        {safeProgressPercent >= 100 && (
          <div className="mt-2 text-xs bg-white/80 border border-gray-200 rounded-lg px-3 py-2 text-center">
            <div className="font-semibold mb-1">🎓 Zertifikat-Status</div>

            <div>
              Kurs abgeschlossen:{" "}
              <strong>{displayCourseCompleted ? "Ja" : "Nein"}</strong>
            </div>

            <div>
              Abschlussprüfung vorhanden:{" "}
              <strong>{status.finalExamExists ? "Ja" : "Nein"}</strong>
            </div>

            <div>
              Abschlussprüfung bestanden:{" "}
              <strong>{status.finalExamPassed ? "Ja" : "Nein"}</strong>
            </div>

            <div>
              Zertifikat verfügbar:{" "}
              <strong>{certificateAvailable ? "Ja" : "Nein"}</strong>
            </div>
          </div>
        )}

        {canStartFinalExam && (
          <Button
            size="sm"
            className="w-full text-xs h-9 mt-2 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              if (onStartFinalExam) onStartFinalExam();
            }}
          >
            🎓 Abschlussprüfung starten
          </Button>
        )}

        {finalExamPassed && (
          <div className="mt-2 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-center">
            ✅ Abschlussprüfung bestanden
          </div>
        )}
        {/* BUTTON */}
        {/* BUTTONS */}
        <div className="mt-auto pt-3 flex gap-2">

          {/* 📘 DETAILS BUTTON */}
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs h-9 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              if (onOpen) onOpen();
            }}
          >
            Details
          </Button>

          {/* ▶ START / CONTINUE */}
          {safeProgressPercent >= 100 ? (
          <Button
            size="sm"
        className="flex-1 text-xs h-9 flex items-center justify-center whitespace-nowrap px-2"
            onClick={(e) => {
              e.stopPropagation();
              if (onReview) onReview();
            }}
          >
            📚 Kursstruktur
          </Button>
        ) : (
          <Button
            size="sm"
            className="flex-1 text-xs h-9 flex items-center justify-center"
            disabled={!onContinue}
            onClick={(e) => {
              e.stopPropagation();
              if (onContinue) onContinue();
            }}
          >
            {safeProgressPercent > 0 ? "▶ Weiter lernen" : "🚀 Starten"}
          </Button>
        )}

        </div>

                </div>
              </Card>
            );
          }

          // 🟣 TRAINER MODE (UNVERÄNDERT)

          if (mode === "viewer") {
          return (
            <Card
              className="
              w-full max-w-[320px]
              flex flex-col
              rounded-2xl overflow-hidden
              shadow-md hover:shadow-xl
              transition-all duration-300
              cursor-pointer
              transform hover:-translate-y-1
              bg-white
              "
            >

              {/* IMAGE */}
            <div
                className="h-[140px] w-full overflow-hidden cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={handleImageOpen}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleImageOpen(e);
                  }
                }}
                title="Kursdetails öffnen"
              >
                <img
                  src={imageSrc}
                  onError={(e) => {
                    if (!e.target.dataset.fallback) {
                      e.target.src = "/course-placeholder.jpg";
                      e.target.dataset.fallback = "true";
                    }
                  }}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  alt={title}
                />
              </div>

              {/* CONTENT */}
              <div className="flex flex-col p-4 gap-2 flex-1">

                <div className="font-semibold text-sm line-clamp-2">
                  {title}
                </div>

                <div className="flex items-center gap-2">
                  <AvatarCircle />
                  <span className="text-xs text-gray-500">
                    {trainerFullName}
                  </span>
                </div>

              {rating !== null && rating > 0 && (
                  <div className="text-xs text-gray-500">
                    ⭐ {rating}
                  </div>
                )}
                {safeProgressPercent > 0 && (
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Fortschritt</span>
              <span>{safeProgressPercent}%</span>
            </div>

            <div className="w-full h-[6px] bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500"
                style={{ width: `${safeProgressPercent}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-auto pt-3">
          <Button
            size="sm"
            className="w-full text-xs"
           onClick={(e) => {
              e.stopPropagation();

              if (onOpen) {
                onOpen();
              } else if (onContinue) {
                onContinue();
              }
            }}
          >
            Details
          </Button>
        </div>

      </div>
    </Card>
  );
}


  return (
    <Card
  className={`group w-[250px] min-h-[320px] flex flex-col
  rounded-xl overflow-hidden
  shadow-md hover:shadow-[0_25px_50px_rgba(250,204,21,0.25)]
  transition-all duration-300 cursor-pointer
  transform hover:-translate-y-1 relative
  ${isNewest ? "bg-white" : "bg-blue-50 border border-blue-200"}`}
      style={{
        opacity: course.visible === false ? 0.5 : 1,
        filter: course.visible === false ? "grayscale(70%)" : "none"
      }}
    >

    

{course.canEdit && (
  <div className="absolute top-2 right-2 flex gap-2 z-50 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility(course.id);
            }}
            className="bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center"
          >
            {course.visible ? "👁️" : "🚫"}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(course.id);
            }}
            className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      <div
          className="w-full aspect-[16/9] overflow-hidden bg-gray-100 relative flex-shrink-0 cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={handleImageOpen}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleImageOpen(e);
            }
          }}
          title="Kursdetails öffnen"
        >
        <img
          src={imageSrc}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = COURSE_PLACEHOLDER;
          }}
          className="w-full h-full object-cover transition group-hover:scale-105"
          alt={title}
        />
      </div>

    <div className="flex flex-col p-3 gap-2 flex-1">

  {/* 🏷️ BADGES - nicht mehr über dem Bild */}
  {(course.canEdit || isNewest) && (
    <div className="flex flex-wrap gap-2 mb-1">
      {course.canEdit && (
        <span className="inline-flex items-center rounded-full bg-orange-500 text-white text-[10px] px-2 py-1 font-semibold shadow-sm">
          Dein Kurs
        </span>
      )}

      {isNewest && (
        <span className="inline-flex items-center rounded-full bg-green-600 text-white text-[10px] px-2 py-1 font-semibold shadow-sm">
          Neu
        </span>
      )}
    </div>
  )}

  {/* 🔥 TITLE */}
  <div className="font-semibold text-sm line-clamp-2">
    {title}
  </div>

  {/* 🔥 TRAINER */}
  
<div className="flex items-center gap-2">
  
    <AvatarCircle />
  

  <span className="text-xs text-gray-600">
  {trainerFullName || "Kein Trainer"}
  </span>

</div>
 

  {/* ⭐ RATING */}
  {rating !== null && rating > 0 && (
  <div className="text-xs text-gray-500">
    ⭐ {rating}
  </div>
)}

  {/* 📊 STATS */}
  <div className="text-xs text-gray-500 flex justify-between">
    <span>🎥 {course.lectureCount || 0}</span>
    <span>📚 {course.sectionCount || 0}</span>
  </div>

 {/* 📈 PROGRESS NUR FÜR STUDENTEN */}
{!course.canEdit && (
  <div className="mt-2">
    <div className="flex justify-between text-xs mb-1">
      <span>Fortschritt</span>
      <span>{safeProgressPercent}%</span>
    </div>

    <div className="w-full h-[6px] bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-green-500 transition-all"
        style={{ width: `${safeProgressPercent}%` }}
      />
    </div>
  </div>
)}

  {/* 🔘 BUTTON */}
  <div className="mt-auto pt-2">
    <Button size="sm" className="w-full text-xs" onClick={onOpen}>
      Details
    </Button>
  </div>

</div>
    </Card>
  );
}