import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../api";
import PageHero from "../../components/PageHero";
import "./QuizResultPage.css";

export default function QuizResultPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [result, setResult] = useState(location.state?.result || null);
  const [status, setStatus] = useState(null);

  const [loading, setLoading] = useState(!location.state?.result);
  const [error, setError] = useState("");

const isFinalExam =
  location.state?.isFinalExam === true ||
  sessionStorage.getItem(`quiz-is-final-exam-${quizId}`) === "true";


  const courseId =
  location.state?.courseId ||
  sessionStorage.getItem(`quiz-course-id-${quizId}`);

const [certificateStatus, setCertificateStatus] = useState(null);
const [certificateLoading, setCertificateLoading] = useState(false);
const [certificateError, setCertificateError] = useState("");
const [downloadingCertificate, setDownloadingCertificate] = useState(false);

  

  const returnTo = useMemo(() => {
    if (location.state?.returnTo) {
      return location.state.returnTo;
    }

    const storedReturnTo = sessionStorage.getItem(`quiz-return-to-${quizId}`);

    if (storedReturnTo) {
      return storedReturnTo;
    }

    return "/courses";
  }, [location.state, quizId]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    if (location.state?.returnTo) {
      sessionStorage.setItem(
        `quiz-return-to-${quizId}`,
        location.state.returnTo
      );
    }
  }, [location.state, quizId]);


  useEffect(() => {
  if (location.state?.courseId) {
    sessionStorage.setItem(
      `quiz-course-id-${quizId}`,
      String(location.state.courseId)
    );
  }
}, [location.state, quizId]);

// ✅ HIER DIREKT DANACH
useEffect(() => {
  if (location.state?.isFinalExam === true) {
    sessionStorage.setItem(
      `quiz-is-final-exam-${quizId}`,
      "true"
    );
  }
}, [location.state, quizId]);



  useEffect(() => {
    const loadAttemptStatus = async () => {
      try {
        const res = await api.get(`/quizzes/${quizId}/play/attempt-status`);
        setStatus(res.data);

        // Fallback bei Reload der Result-Seite
        if (!location.state?.result) {
          if (res.data.lastPercentage !== null) {
            const lastPercentage = Number(res.data.lastPercentage);
            const passingPercentage = Number(res.data.passingPercentage ?? 70);

            setResult({
              percentage: lastPercentage,
              passingPercentage,
              passed: lastPercentage >= passingPercentage,
              attemptNumber: res.data.totalAttempts,
              maxAttempts: res.data.maxAttempts ?? null,
              finishedAt: null,
              attemptId: res.data.lastAttemptId,
            });

          } else {
            setError("Kein Ergebnis gefunden.");
          }
        }
      } catch (err) {
        console.error("Ergebnis konnte nicht geladen werden:", err);

        if (!location.state?.result) {
          setError("Ergebnis konnte nicht geladen werden.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadAttemptStatus();
  }, [quizId, location.state]);

  const passingPercentage = Number(
  result?.passingPercentage ??
  status?.passingPercentage ??
  70
);

  const currentPercentage = Number(
    result?.percentage ?? status?.lastPercentage ?? 0
  );

  const bestPercentageValue =
    status?.bestPercentage !== null && status?.bestPercentage !== undefined
      ? Number(status.bestPercentage)
      : currentPercentage;

  // Wichtig:
  // Für den Gesamtstatus zählt die beste Leistung.
  // Ein schlechter neuer Versuch überschreibt also nicht den bestandenen Status.
  const effectivePercentage = Math.max(currentPercentage, bestPercentageValue);

  const currentAttemptPassed = currentPercentage >= passingPercentage;
  const quizPassedByBestResult = effectivePercentage >= passingPercentage;

  const resultText = quizPassedByBestResult
    ? "Bestanden"
    : "Nicht bestanden";

  const resultHint = quizPassedByBestResult
  ? currentAttemptPassed
    ? isFinalExam
      ? "Sehr gut! Du hast die Abschlussprüfung erfolgreich bestanden."
      : "Sehr gut! Du hast diesen Selbsttest erfolgreich bestanden."
    : isFinalExam
      ? "Diese Abschlussprüfung gilt weiterhin als bestanden, weil deine beste Leistung zählt."
      : "Dieses Quiz gilt weiterhin als bestanden, weil deine beste Leistung zählt."
  : isFinalExam
    ? "Du hast die Abschlussprüfung noch nicht bestanden. Du kannst sie erneut versuchen."
    : "Du hast diesen Selbsttest noch nicht bestanden. Du kannst ihn erneut versuchen.";

  const scoreLabel = useMemo(() => {
    if (effectivePercentage >= 90) return "Sehr stark";
    if (effectivePercentage >= 70) return "Gut bestanden";
    if (effectivePercentage >= passingPercentage) return "Bestanden";
    return "Noch nicht bestanden";
  }, [effectivePercentage, passingPercentage]);

  const attemptLabel =
    result?.attemptNumber ?? status?.totalAttempts ?? "-";

  const maxAttemptsLabel = status?.maxAttempts
    ? `${status.maxAttempts} Versuche`
    : result?.maxAttempts
      ? `${result.maxAttempts} Versuche`
      : "Kein Limit";

  const currentPercentageLabel =
    result?.percentage !== null && result?.percentage !== undefined
      ? `${Number(result.percentage).toFixed(2)}%`
      : "-";

  const bestPercentageLabel =
    status?.bestPercentage !== null && status?.bestPercentage !== undefined
      ? `${Number(status.bestPercentage).toFixed(2)}%`
      : `${effectivePercentage.toFixed(2)}%`;

  const canShowCertificateBlock =
  isFinalExam && quizPassedByBestResult && !!courseId;

const canDownloadCertificate =
  certificateStatus?.certificateAvailable === true;

useEffect(() => {
  const loadCertificateStatus = async () => {
    if (!canShowCertificateBlock) return;

    try {
      setCertificateLoading(true);
      setCertificateError("");

      const res = await api.get(`/courses/${courseId}/certificate-status`);
      setCertificateStatus(res.data);
    } catch (err) {
      console.error("Zertifikat-Status konnte nicht geladen werden:", err);
      setCertificateError("Zertifikat-Status konnte nicht geladen werden.");
    } finally {
      setCertificateLoading(false);
    }
  };

  loadCertificateStatus();
}, [canShowCertificateBlock, courseId]);


const canRestartQuiz =
  status?.remainingAttempts === null ||
  status?.remainingAttempts === undefined ||
  Number(status.remainingAttempts) > 0;

const showRestartButton =
  (!isFinalExam || !quizPassedByBestResult) && canRestartQuiz;

  const handleBackToLecture = () => {
      navigate(returnTo, { replace: true });
  };

 const handleRestartQuiz = () => {
  navigate(`/quiz-play/${quizId}`, {
    replace: true,
    state: {
      returnTo,
      isFinalExam,
      courseId,
    },
  });
};


const handleDownloadCourseCertificate = async () => {
  if (!courseId) return;

  try {
    setDownloadingCertificate(true);
    setCertificateError("");

    const response = await api.get(
      `/certificates/course/${courseId}/download`,
      { responseType: "blob" }
    );

    const url = window.URL.createObjectURL(
      new Blob([response.data], { type: "application/pdf" })
    );

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `course-certificate-${courseId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Zertifikat-Download fehlgeschlagen:", err);

    setCertificateError(
      err.response?.data?.message ||
        "Zertifikat konnte nicht heruntergeladen werden."
    );
  } finally {
    setDownloadingCertificate(false);
  }
};


  if (loading) {
    return (
      <div className="quiz-result-page">
        <div className="quiz-result-wrapper">
          <div className="quiz-result-message-card">Lade Ergebnis...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-result-page">
        <div className="quiz-result-wrapper">
          <div className="quiz-result-message-card error">
            <h3>⚠️ Fehler</h3>
            <p>{error}</p>

            <button
              type="button"
              className="quiz-result-btn primary"
              onClick={handleBackToLecture}
            >
              Zurück
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="quiz-result-page">
      <div className="quiz-result-wrapper">
       <PageHero
          eyebrow={isFinalExam ? "Abschlussprüfung Ergebnis" : "Quiz Ergebnis"}
          title={resultText}
        />

        <div
          className={`quiz-result-card ${
            quizPassedByBestResult ? "passed" : "failed"
          }`}
        >
          {/* HEADER */}
          <div className="quiz-result-header">
            <div
              className={`quiz-result-icon ${
                quizPassedByBestResult ? "passed" : "failed"
              }`}
            >
              {quizPassedByBestResult ? "✓" : "✕"}
            </div>

            <div className="quiz-result-header-text">
              <p className="quiz-result-kicker">{scoreLabel}</p>
              <h1>{resultText}</h1>
              <p>{resultHint}</p>
            </div>
          </div>

          {/* SCORE */}
          <div className="quiz-result-score-box">
            <div
              className={`quiz-result-score ${
                quizPassedByBestResult ? "passed" : "failed"
              }`}
            >
              {effectivePercentage.toFixed(2)}%
            </div>

            <div
              className={`quiz-result-badge ${
                quizPassedByBestResult ? "passed" : "failed"
              }`}
            >
              {quizPassedByBestResult
                ? "✔ BESTANDEN"
                : "✘ NICHT BESTANDEN"}
            </div>
          </div>

          {/* META PILLS */}
          <div className="quiz-result-meta-row">
            <div className="quiz-result-meta-pill blue">
              <span>🧪 Versuch</span>
              <strong>{attemptLabel}</strong>
            </div>

            <div className="quiz-result-meta-pill yellow">
              <span>🔁 Limit</span>
              <strong>{maxAttemptsLabel}</strong>
            </div>

            <div className="quiz-result-meta-pill gray">
              <span>Aktueller Versuch</span>
              <strong>{currentPercentageLabel}</strong>
            </div>

            <div className="quiz-result-meta-pill green">
              <span>Beste Leistung</span>
              <strong>{bestPercentageLabel}</strong>
            </div>
          </div>

                    {/* CERTIFICATE */}
          {canShowCertificateBlock && (
            <div className="quiz-result-certificate-box">
              <h3>🎓 Kurszertifikat</h3>

              {certificateLoading && (
                <p>Zertifikat-Status wird geprüft...</p>
              )}

              {!certificateLoading && certificateStatus && (
                <>
                  {canDownloadCertificate ? (
                    <p>
                      Glückwunsch! Dein Kurszertifikat ist verfügbar.
                    </p>
                  ) : (
                    <p>
                      Die Abschlussprüfung ist bestanden. Das Zertifikat ist aber noch
                      nicht verfügbar.
                    </p>
                  )}

                  <div className="quiz-result-certificate-actions">
                    <button
                      type="button"
                      className="quiz-result-btn primary"
                      disabled={!canDownloadCertificate || downloadingCertificate}
                      onClick={handleDownloadCourseCertificate}
                    >
                      {downloadingCertificate
                        ? "PDF wird vorbereitet..."
                        : "Zertifikat herunterladen"}
                    </button>

                   <button
                      type="button"
                      className="quiz-result-btn secondary"
                      onClick={() =>
                        navigate("/certificates", {
                          state: {
                            courseId,
                            fromQuizId: quizId,
                            returnTo: `/quiz/${quizId}/result`,
                            returnLabel: "← Zurück zum Ergebnis",
                            isFinalExam,
                          },
                        })
                      }
                    >
                      Meine Zertifikate anzeigen
                    </button>
                  </div>
                </>
              )}

              {certificateError && (
                <p className="quiz-result-certificate-error">
                  {certificateError}
                </p>
              )}
            </div>
          )}

          {/* ACTIONS */}
          <div className="quiz-result-actions">
            {result.attemptId && (
              <button
                type="button"
                className="quiz-result-btn secondary"
                onClick={() =>
                  navigate(`/attempts/${result.attemptId}/details`)
                }
              >
                Detailanalyse anzeigen
              </button>
            )}

          {showRestartButton && (
            <button
              type="button"
              className="quiz-result-btn primary"
              onClick={handleRestartQuiz}
            >
              {isFinalExam ? "Abschlussprüfung erneut starten" : "Quiz erneut starten"}
            </button>
          )}

            <button
              type="button"
              className="quiz-result-btn outline"
              onClick={handleBackToLecture}
            >
              {isFinalExam ? "Zurück zum Kurs" : "Zurück zur Lecture"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}