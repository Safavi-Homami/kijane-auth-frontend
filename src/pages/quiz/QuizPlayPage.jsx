import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../api";
import PageHero from "../../components/PageHero";
import "./QuizPlayPage.css";

export default function QuizPlayPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [quiz, setQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const totalQuestions = quiz?.questions?.length || 0;

  const answeredCount = useMemo(() => {
    if (!quiz?.questions) return 0;

    return quiz.questions.filter((q) => {
      const selected = answers[q.id];
      return Array.isArray(selected) && selected.length > 0;
    }).length;
  }, [quiz, answers]);

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

  const isFinalExam =
  location.state?.isFinalExam === true ||
  sessionStorage.getItem(`quiz-is-final-exam-${quizId}`) === "true";

const courseId =
  location.state?.courseId ||
  sessionStorage.getItem(`quiz-course-id-${quizId}`) ||
  null;

  const currentAttemptNumber =
    status?.totalAttempts !== null && status?.totalAttempts !== undefined
      ? Number(status.totalAttempts) + 1
      : "-";

  const bestPercentage =
    status?.bestPercentage !== null && status?.bestPercentage !== undefined
      ? `${status.bestPercentage}%`
      : "-";

  const lastPercentage =
    status?.lastPercentage !== null && status?.lastPercentage !== undefined
      ? `${status.lastPercentage}%`
      : "-";

  const timeLimitLabel =
    quiz?.timeLimitMinutes && Number(quiz.timeLimitMinutes) > 0
      ? `${quiz.timeLimitMinutes} Minuten`
      : "Kein Limit";

  const passingPercentageLabel =
    quiz?.passingPercentage !== null && quiz?.passingPercentage !== undefined
      ? `${quiz.passingPercentage}%`
      : "-";

  const getErrorMessage = (
    err,
    fallback = "Quiz konnte nicht gestartet werden."
  ) => {
    const data = err?.response?.data;

    if (typeof data === "string") return data;
    if (data?.message) return data.message;
    if (data?.error) return data.error;

    return fallback;
  };

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
  if (location.state?.isFinalExam === true) {
    sessionStorage.setItem(`quiz-is-final-exam-${quizId}`, "true");
  }

  if (location.state?.courseId) {
    sessionStorage.setItem(
      `quiz-course-id-${quizId}`,
      String(location.state.courseId)
    );
  }
}, [location.state, quizId]);

  useEffect(() => {
    const initQuiz = async () => {
      try {
        setLoading(true);
        setError("");

        const quizRes = await api.get(`/quizzes/${quizId}/play`);
        const quizData = quizRes.data;

        setQuiz(quizData);

        const resolvedIsFinalExam =
          location.state?.isFinalExam === true ||
          quizData?.courseFinalExam === true ||
          sessionStorage.getItem(`quiz-is-final-exam-${quizId}`) === "true";

        const resolvedCourseId =
          location.state?.courseId ||
          quizData?.courseId ||
          sessionStorage.getItem(`quiz-course-id-${quizId}`) ||
          null;

        if (resolvedIsFinalExam) {
          sessionStorage.setItem(`quiz-is-final-exam-${quizId}`, "true");
        }

        if (resolvedCourseId) {
          sessionStorage.setItem(
            `quiz-course-id-${quizId}`,
            String(resolvedCourseId)
          );
        }

        const statusRes = await api.get(
          `/quizzes/${quizId}/play/attempt-status`
        );

        setStatus(statusRes.data);

       if (statusRes.data.remainingAttempts === 0) {
          navigate(`/quiz/${quizId}/result`, {
            replace: true,
            state: {
              returnTo,
              isFinalExam: resolvedIsFinalExam,
              courseId: resolvedCourseId,
            },
          });
          return;
        }

        const attemptRes = await api.post(`/quiz-attempts/start/${quizId}`);
        setAttemptId(attemptRes.data.attemptId);
      } catch (err) {
        console.error("Quiz Start Fehler:", err);
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    initQuiz();
  }, [quizId, navigate, returnTo]);

  const handleSelect = (questionId, answerId, multiple) => {
    setAnswers((prev) => {
      if (multiple) {
        const current = prev[questionId] || [];
        const exists = current.includes(answerId);

        return {
          ...prev,
          [questionId]: exists
            ? current.filter((id) => id !== answerId)
            : [...current, answerId],
        };
      }

      return {
        ...prev,
        [questionId]: [answerId],
      };
    });
  };

  const handleFinish = async () => {
    try {
      setError("");

      const res = await api.post(`/quiz-attempts/finish/${attemptId}`, {
        answers,
      });

          const resolvedIsFinalExam =
        isFinalExam ||
        quiz?.courseFinalExam === true ||
        sessionStorage.getItem(`quiz-is-final-exam-${quizId}`) === "true";

      const resolvedCourseId =
        courseId ||
        quiz?.courseId ||
        sessionStorage.getItem(`quiz-course-id-${quizId}`) ||
        null;

      if (resolvedIsFinalExam) {
        sessionStorage.setItem(`quiz-is-final-exam-${quizId}`, "true");
      }

      if (resolvedCourseId) {
        sessionStorage.setItem(
          `quiz-course-id-${quizId}`,
          String(resolvedCourseId)
        );
      }

      navigate(`/quiz/${quizId}/result`, {
        replace: true,
        state: {
          result: {
            ...res.data,
            passingPercentage:
              res.data?.passingPercentage ??
              quiz?.passingPercentage ??
              status?.passingPercentage ??
              70,
          },
          returnTo,
          isFinalExam: resolvedIsFinalExam,
          courseId: resolvedCourseId,
          quizResourceId: Number(quizId),
          quizTitle: quiz?.title,
        },
      });

    } catch (err) {
      console.error("Quiz Abschluss Fehler:", err);

      setError(
        getErrorMessage(err, "Quiz konnte nicht abgeschlossen werden.")
      );
    }
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (loading) {
    return (
      <div className="quiz-play-page">
        <div className="quiz-play-wrapper">
          <div className="quiz-play-message-card">Lade Quiz...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-play-page">
        <div className="quiz-play-wrapper">
          <div className="quiz-play-message-card error">
            <h3>⚠️ Hinweis</h3>
            <p>{error}</p>

            <button
              type="button"
              className="quiz-play-btn primary"
              onClick={() => navigate(returnTo, { replace: true })}
            >
              Zurück
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="quiz-play-page">
        <div className="quiz-play-wrapper">
          <div className="quiz-play-message-card error">
            Quiz konnte nicht geladen werden.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-play-page">
      <div className="quiz-play-wrapper">
        <PageHero
          eyebrow={isFinalExam ? "Abschlussprüfung" : "Quiz"}
          title={quiz.title}
        />

        <div className="quiz-play-topbar">
          <div className="quiz-play-pill">
            <span>Fragen</span>
            <span className="quiz-play-pill-count">{totalQuestions}</span>
          </div>

          <button
            type="button"
            className="quiz-play-arrow-btn"
            onClick={scrollToBottom}
            title="Nach unten"
            aria-label="Nach unten scrollen"
          >
            ↓
          </button>
        </div>

        <div className="quiz-play-header-card">
          <h1 className="quiz-play-title">{quiz.title}</h1>

          {quiz.description && (
            <p className="quiz-play-description">{quiz.description}</p>
          )}

          <div className="quiz-play-meta-row">
            <div className="quiz-play-meta-pill blue">
              <span>⏱ Zeitlimit</span>
              <strong>{timeLimitLabel}</strong>
            </div>

            <div className="quiz-play-meta-pill red">
              <span>🎯 Bestehensquote</span>
              <strong>{passingPercentageLabel}</strong>
            </div>

            <div className="quiz-play-meta-pill green">
              <span>✅ Beantwortet</span>
              <strong>
                {answeredCount} / {totalQuestions}
              </strong>
            </div>

            <div className="quiz-play-meta-pill yellow">
              <span>🧪 Aktueller Versuch</span>
              <strong>{currentAttemptNumber}</strong>
            </div>

            <div className="quiz-play-meta-pill gray">
              <span>Letztes Ergebnis</span>
              <strong>{lastPercentage}</strong>
            </div>

            <div className="quiz-play-meta-pill gray">
              <span>Bestes Ergebnis</span>
              <strong>{bestPercentage}</strong>
            </div>
          </div>
        </div>

        <div className="quiz-play-question-list">
          {quiz.questions?.map((q, index) => (
            <div key={q.id} className="quiz-play-question-card">
              <div className="quiz-play-question-head">
                <div className="quiz-play-question-number">{index + 1}</div>

                <div className="quiz-play-question-info">
                  <h3 className="quiz-play-question-title">{q.text}</h3>

                  <p className="quiz-play-question-hint">
                    {q.multipleChoice
                      ? "Mehrfachauswahl möglich"
                      : "Eine Antwort auswählen"}
                  </p>
                </div>
              </div>

              <div className="quiz-play-answer-list">
                {q.answers?.map((a, answerIndex) => {
                  const letter = String.fromCharCode(65 + answerIndex);
                  const selectedAnswers = answers[q.id] || [];
                  const checked = selectedAnswers.includes(a.id);

                  return (
                    <label
                      key={a.id}
                      className={`quiz-play-answer-option ${
                        checked ? "selected" : ""
                      }`}
                    >
                      <input
                        type={q.multipleChoice ? "checkbox" : "radio"}
                        name={`question-${q.id}`}
                        checked={checked}
                        onChange={() =>
                          handleSelect(q.id, a.id, q.multipleChoice)
                        }
                      />

                      <div className="quiz-play-answer-content">
                        <span className="quiz-play-answer-letter">
                          {letter})
                        </span>

                        <span className="quiz-play-answer-text">{a.text}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="quiz-play-actions">
          <button
            type="button"
            className="quiz-play-arrow-btn"
            onClick={scrollToTop}
            title="Nach oben"
            aria-label="Nach oben scrollen"
          >
            ↑
          </button>

          <button
            type="button"
            className="quiz-play-btn primary"
            onClick={handleFinish}
            disabled={!attemptId}
          >
            {isFinalExam ? "Abschlussprüfung abschließen" : "Quiz abschließen"}

          </button>

          <button
              type="button"
              className="quiz-play-btn secondary"
              onClick={() => navigate(returnTo, { replace: true })}
            >
              {isFinalExam ? "Abschlussprüfung verlassen" : "Quiz verlassen"}
            </button>
        </div>
      </div>
    </div>
  );
}