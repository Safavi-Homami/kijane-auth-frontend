import { useEffect, useState, useRef} from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../api";
import "./Course.css";

import PageHero from "../../components/PageHero"; 

export default function QuizEditorPage() {
const { quizId } = useParams();
const navigate = useNavigate();

const location = useLocation();

const sectionId = location.state?.sectionId;
const lectureId = location.state?.lectureId;

const finalExamManagement = location.state?.finalExamManagement === true;
const returnTo = location.state?.returnTo;

const storedReturnTo = sessionStorage.getItem(`quiz-return-to-${quizId}`);

const fallbackLectureReturnTo =
  sectionId && lectureId
    ? `/sections/${sectionId}/lectures/${lectureId}/resources`
    : null;

const quizReturnTo =
  returnTo ||
  storedReturnTo ||
  fallbackLectureReturnTo ||
  "/courses";

const quizCourseId =
  location.state?.courseId ||
  sessionStorage.getItem(`quiz-course-id-${quizId}`);

const lectureTitle = finalExamManagement
  ? "Abschlussprüfung"
  : location.state?.lectureTitle || "Lecture";

const editInputRef = useRef(null);

const quizTopRef = useRef(null);
const questionsListRef = useRef(null);

const [quiz, setQuiz] = useState(null);
const [questions, setQuestions] = useState([]);

const [newQuestionText, setNewQuestionText] = useState("");

const [isAddingQuestion, setIsAddingQuestion] = useState(false);
const newQuestionInputRef = useRef(null);

const [questionError, setQuestionError] = useState("");
const [answerError, setAnswerError] = useState("");

const [activeAnswerQuestionId, setActiveAnswerQuestionId] = useState(null);
const [answerDraft, setAnswerDraft] = useState("");

const [editingAnswerId, setEditingAnswerId] = useState(null);
const [editingAnswerText, setEditingAnswerText] = useState("");

const [editingQuestionId, setEditingQuestionId] = useState(null);
const [editingQuestionText, setEditingQuestionText] = useState("");
const editQuestionRef = useRef(null);

const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const [expandedQuestionId, setExpandedQuestionId] = useState(null);

const [validationError, setValidationError] = useState(null);

const sectionName = location.state?.sectionName || "Kapitel";
const courseTitle = location.state?.courseTitle || "Kurs";

const formatQuizTimeLimit = (value) => {
  const minutes = Number(value ?? 0);

  if (!Number.isFinite(minutes) || minutes <= 0) {
    return "Kein Zeitlimit";
  }

  if (minutes === 1) {
    return "1 Minute";
  }

  return `${minutes} Minuten`;
};

// =========================
// QUIZ VALIDATION
// =========================

const validateQuizStructure = () => {

  if (!questions || questions.length === 0) {
    return "Das Quiz enthält keine Fragen.";
  }

  for (const question of questions) {

    if (!question.answers || question.answers.length < 2) {
        return `Frage "${question.text}" braucht mindestens zwei Antworten.`;
      }
      

    const correctAnswers = question.answers.filter(a => a.correct);

    if (correctAnswers.length === 0) {
      return `Frage "${question.text}" hat keine richtige Antwort markiert.`;
    }

    if (!question.multipleChoice && correctAnswers.length > 1) {
      return `Single-Choice Frage "${question.text}" hat mehrere richtige Antworten.`;
    }
  }

  return null;
};


const reloadQuestions = async () => {
  try {
    const res = await api.get(`/quizzes/${quizId}/questions`);

    const sorted = res.data.map(q => ({
      ...q,
      answers: q.answers
        ? [...q.answers].sort((a, b) => a.orderIndex - b.orderIndex)
        : []
    }));

    setQuestions(sorted);

  } catch (err) {
    console.error("Reload fehlgeschlagen", err);
  }
};

useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setActiveAnswerQuestionId(null);
      setAnswerDraft("");
      setAnswerError("");

      setIsAddingQuestion(false);
      setNewQuestionText("");
      setQuestionError("");

      setEditingAnswerId(null);
      setEditingAnswerText("");

      setEditingQuestionId(null);
      setEditingQuestionText("");
    }
  };

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, []);

 useEffect(() => {

}, [questions]);

useEffect(() => {
  
}, [quiz]);


useEffect(() => {
  if (editingQuestionId && editQuestionRef.current) {
    editQuestionRef.current.focus();
  }
}, [editingQuestionId]);

useEffect(() => {
  if (editingAnswerId && editInputRef.current) {
    editInputRef.current.focus();
  }
}, [editingAnswerId]);

useEffect(() => {
  const error = validateQuizStructure();
  setValidationError(error);
}, [questions]);

useEffect(() => {
  if (isAddingQuestion && newQuestionInputRef.current) {
    newQuestionInputRef.current.focus();
  }
}, [isAddingQuestion]);

  
  // =========================
  // LOAD QUIZ + QUESTIONS
  // =========================
  useEffect(() => {
    if (!quizId) return;

        // 🧹 RESET STATE
      setQuiz(null);
      setQuestions([]);
      setActiveAnswerQuestionId(null);
      setAnswerDraft("");
      setAnswerError("");
      setNewQuestionText("");
      setQuestionError("");
      setIsAddingQuestion(false);

      setError("");
      setValidationError(null);

    const loadQuiz = async () => {
      try {
        setLoading(true);

        const quizRes = await api.get(`/quizzes/${quizId}`);
        setQuiz(quizRes.data);
        
        const questionRes = await api.get(`/quizzes/${quizId}/questions`);

        const sortedQuestions = questionRes.data.map(q => ({
          ...q,
          answers: q.answers
            ? [...q.answers].sort((a, b) => a.orderIndex - b.orderIndex)
            : []
        }));
        setQuestions(sortedQuestions);
      } catch (err) {
        console.error(err);
        setError("Quiz konnte nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [quizId]);

  // =========================
  // CORRECT
  // =========================
 
  const handleToggleCorrect = async (questionId, answerId) => {
  try {
    await api.put(
      `/quizzes/questions/${questionId}/answers/${answerId}/toggle-correct`
    );

    await reloadQuestions();

  } catch (err) {
    console.error("Correct konnte nicht gesetzt werden", err);
  }
};


const handleMultipleChoiceChange = async (questionId, value) => {
  try {
    await api.put(
      `/quizzes/questions/${questionId}/multiple-choice?value=${value}`
    );

    await reloadQuestions();

  } catch (err) {
    console.error("MultipleChoice konnte nicht geändert werden", err);
  }
};

 // =========================
  // ADD ANSWER
  // =========================
 
  const handleAddAnswer = async (questionId) => {
  if (!answerDraft.trim()) {
    setAnswerError("Bitte Antwort eingeben.");
    return;
  }

  setAnswerError("");

  try {
    await api.post(
      `/quizzes/questions/${questionId}/answers`,
      {
        text: answerDraft,
        correct: false
      }
    );

    await reloadQuestions();

    setAnswerDraft("");
    setActiveAnswerQuestionId(null);

  } catch (err) {
    console.error("Fehler beim Speichern", err);
  }
};
const toggleQuestion = (questionId) => {
  setExpandedQuestionId(prev =>
    prev === questionId ? null : questionId
  );
};

 

const handleMoveAnswerUp = async (questionId, answerId) => {
  try {
    await api.put(
      `/quizzes/questions/${questionId}/answers/${answerId}/move-up`
    );

    await reloadQuestions();   // 🔥 zentraler reload

  } catch (err) {
    console.error("Antwort konnte nicht nach oben verschoben werden", err);
  }
};

const handleMoveAnswerDown = async (questionId, answerId) => {
  try {
    await api.put(
      `/quizzes/questions/${questionId}/answers/${answerId}/move-down`
    );

       await reloadQuestions();

  } catch (err) {
    console.error("Antwort konnte nicht nach unten verschoben werden", err);
  }
};

const handleUpdateAnswer = async (questionId, answerId) => {
  if (!editingAnswerText.trim()) return;

  try {
    await api.put(
      `/quizzes/questions/${questionId}/answers/${answerId}`,
      { text: editingAnswerText }
    );

    await reloadQuestions();

    setEditingAnswerId(null);
    setEditingAnswerText("");

  } catch (err) {
    console.error("Antwort konnte nicht aktualisiert werden", err);
  }
};


const handleUpdateQuestion = async (questionId) => {
  if (!editingQuestionText.trim()) return;

  try {
    await api.put(
      `/quizzes/${quizId}/questions/${questionId}`,
      { text: editingQuestionText }
    );

    await reloadQuestions();

    setEditingQuestionId(null);
    setEditingQuestionText("");

  } catch (err) {
    console.error("Frage konnte nicht aktualisiert werden", err);
  }
};

  // =========================
  // ADD QUESTION
  // =========================
 const handleAddQuestion = async () => {
  if (!newQuestionText.trim()) {
    setQuestionError("Bitte Fragetext eingeben.");
    return;
  }

  try {
    await api.post(`/quizzes/${quizId}/questions`, {
      text: newQuestionText.trim(),
    });

    await reloadQuestions();

    setNewQuestionText("");
    setQuestionError("");
    setIsAddingQuestion(false);

  } catch (err) {
    console.error(err);
    setQuestionError("Frage konnte nicht gespeichert werden.");
  }
};

  // =========================
// MOVE QUESTION
// =========================

const handleMoveUp = async (questionId) => {
  try {
    await api.put(`/quizzes/${quizId}/questions/${questionId}/move-up`);
    await reloadQuestions();
  } catch (err) {
    console.error(err);
    setError("Reihenfolge konnte nicht geändert werden.");
  }
};

const handleMoveDown = async (questionId) => {
  try {
    await api.put(`/quizzes/${quizId}/questions/${questionId}/move-down`);
    await reloadQuestions();
  } catch (err) {
    console.error(err);
    setError("Reihenfolge konnte nicht geändert werden.");
  }
};
// =========================
// DELETE ANSWER
// =========================
const handleDeleteAnswer = async (questionId, answerId) => {

  const confirmDelete = window.confirm(
    "Möchtest du diese Antwort wirklich löschen?"
  );

  if (!confirmDelete) return;

  try {
    await api.delete(
      `/quizzes/questions/${questionId}/answers/${answerId}`
    );

    await reloadQuestions();   // 🔥 einzig relevante Zeile

  } catch (err) {
    console.error("Antwort konnte nicht gelöscht werden", err);
  }
};

const scrollToQuestionsList = () => {
  if (!questionsListRef.current) return;

  const yOffset = -120;
  const y =
    questionsListRef.current.getBoundingClientRect().top +
    window.pageYOffset +
    yOffset;

  window.scrollTo({
    top: y,
    behavior: "smooth",
  });
};

const scrollToQuizTop = () => {
  if (!quizTopRef.current) return;

  const yOffset = -120;
  const y =
    quizTopRef.current.getBoundingClientRect().top +
    window.pageYOffset +
    yOffset;

  window.scrollTo({
    top: y,
    behavior: "smooth",
  });
};


// =========================
// DELETE QUESTION
// =========================
const handleDeleteQuestion = async (questionId) => {

  const confirmDelete = window.confirm(
    "Möchtest du diese Frage wirklich löschen?"
  );

  if (!confirmDelete) return;

  try {
    await api.delete(`/quizzes/${quizId}/questions/${questionId}`);

    await reloadQuestions();

    if (expandedQuestionId === questionId) {
      setExpandedQuestionId(null);
    }

    } catch (err) {
      console.error("Frage konnte nicht gelöscht werden", err);
      alert("Frage konnte nicht gelöscht werden.");
    }

    };

if (loading) return <div className="page-container">Lade Quiz...</div>;

if (error) {
  return <div className="page-container error">{error}</div>;
}

const isCourseFinalExam = Boolean(quiz?.courseFinalExam);

const backButtonLabel = finalExamManagement
  ? "← Zurück zum Curriculum"
  : "← Zurück zur Lecture";

const handleTestQuiz = () => {
  sessionStorage.setItem(
    `quiz-return-to-${quizId}`,
    quizReturnTo
  );

  if (quizCourseId) {
    sessionStorage.setItem(
      `quiz-course-id-${quizId}`,
      String(quizCourseId)
    );
  }

  if (isCourseFinalExam) {
    sessionStorage.setItem(
      `quiz-is-final-exam-${quizId}`,
      "true"
    );
  } else {
    sessionStorage.removeItem(`quiz-is-final-exam-${quizId}`);
  }

  navigate(`/quiz/${quizId}/start`, {
    state: {
      returnTo: quizReturnTo,
      isFinalExam: isCourseFinalExam,
      courseId: quizCourseId,
      quizResourceId: quizId,
      source: "quiz-editor-test",
    },
  });
};

const handleBackNavigation = () => {
  navigate(quizReturnTo, { replace: true });
};

return (

    <div className="page-container" ref={quizTopRef}>
    <div className="content-card">

      <PageHero
          eyebrow={
            finalExamManagement
              ? `${courseTitle} → Abschlussprüfung → Quiz`
              : `${courseTitle} → ${sectionName} → ${lectureTitle} → Quiz`
          }
          title={quiz ? quiz.title : "Quiz Editor"}
        />

      {validationError && (
        <div className="error-box" style={{ marginTop: "-20px", marginBottom: "20px" }}>
          ⚠️ {validationError}
        </div>
      )}

        {/* Zurück Button oben */}
       {quiz && (
          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            marginBottom: "20px"
          }}>

           <button
              className="secondary-btn"
              onClick={handleBackNavigation}
            >
              {backButtonLabel}
            </button>

            <button
                className="primary-btn"
                disabled={validationError !== null}
                onClick={handleTestQuiz}
              >
                🧪 Quiz testen
              </button>

          </div>
        )}
       {/* Quiz Meta */}
          {quiz && (
            <div className="quiz-meta quiz-editor-meta-card">
              <div>
                <h3>{quiz.title}</h3>
                <p>{quiz.description}</p>

                <div className="quiz-meta-row">
                  <span>⏱ Zeitlimit: {formatQuizTimeLimit(quiz.timeLimitMinutes)}</span>
                  <span>🎯 Bestehensquote: {quiz.passingPercentage}%</span>
                </div>
              </div>

             {isCourseFinalExam ? (
  <div className="certificate-toggle">
    🏅 Abschlussprüfung
    <span style={{ marginLeft: "8px" }}>
      Zertifikat wird über Kursabschluss + bestandene Abschlussprüfung geprüft.
    </span>
  </div>
) : (
  <div className="certificate-toggle">
    📝 Selbsttest
    <span style={{ marginLeft: "8px" }}>
      Kein Zertifikat für normale Kapitel-Quizze.
    </span>
  </div>
)}
            </div>
          )}

        <hr />

        <div className="quiz-section-title">
            <div className="quiz-section-title-actions">
              <span className="quiz-section-badge">
                Fragen
                <span className="quiz-section-count">{questions.length}</span>
              </span>

              <button
                type="button"
                className="quiz-scroll-btn"
                title="Zur Fragenliste springen"
                onClick={scrollToQuestionsList}
              >
                ↓
              </button>
            </div>
          </div>

        {/* ============================= */}
        {/*  NEUER QUESTION BLOCK         */}
        {/* ============================= */}

        <div className="question-container" ref={questionsListRef}>

          {questions.length === 0 && (
            <p className="muted-text">Noch keine Fragen vorhanden.</p>
          )}

         {questions.map((q) => (
          <div key={q.id} className="question-card">

            {/* ================= HEADER ================= */}
            <div
              className="question-header"
              style={{ cursor: "pointer" }}
            >

              <div className="question-number">
                {q.orderIndex}
              </div>

            {editingQuestionId === q.id ? (
          <div className="question-edit-wrapper">

            <textarea
              ref={editQuestionRef}
              value={editingQuestionText}
              onChange={(e) => setEditingQuestionText(e.target.value)}
              className="answer-edit-input"
              rows={4}
            />

            <div className="answer-edit-buttons">
              <button
                className="icon-btn primary"
               disabled={
                !editingQuestionText.trim() ||
                editingQuestionText.trim() === q.text?.trim()
              }               
              
              onClick={() => handleUpdateQuestion(q.id)}
              >
                💾
              </button>

              <button
                className="icon-btn"
                onClick={() => {
                  setEditingQuestionId(null);
                  setEditingQuestionText("");
                }}
              >
                ✖
              </button>
            </div>

          </div>
        ) : (
          <div className="question-title long-text">
            {q.text}

            {(!q.answers ||
              q.answers.length < 2 ||
              q.answers.filter((a) => a.correct).length === 0 ||
              (!q.multipleChoice && q.answers.filter((a) => a.correct).length > 1)
            ) && (
              <span
                title="Diese Frage ist unvollständig: mindestens 2 Antworten und 1 richtige Antwort erforderlich."
                style={{ marginLeft: "10px", color: "red", cursor: "help" }}
              >
                ⚠️
              </span>
            )}
          </div>
                  )}
                  
      <div className="question-actions">

        <button
          className="icon-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleMoveUp(q.id);
          }}
          disabled={q.orderIndex === 1}
        >
          ↑
        </button>

        <button
          className="icon-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleMoveDown(q.id);
          }}
          disabled={q.orderIndex === questions.length}
        >
          ↓
        </button>

     <button
        className="icon-btn edit"
        onClick={(e) => {
          e.stopPropagation();
          setEditingQuestionId(q.id);
          setEditingQuestionText(q.text);
        }}
      >
        ✏
      </button>

        <button
          className="icon-btn danger"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteQuestion(q.id);
          }}
        >
          🗑
        </button>

      </div>

      <div className="accordion-arrow"
         onClick={() => toggleQuestion(q.id)}
      >
        {expandedQuestionId === q.id ? "▼" : "▶"}
      </div>

    </div>

    {/* ================= CONTENT ================= */}
    {expandedQuestionId === q.id && (
      <div className="question-content">

        {/* ===== Single / Multiple ===== */}
        <div style={{ marginTop: "8px" }}>
         <label style={{ marginRight: "15px" }}>
            <input
              type="radio"
              name={`choiceType-${q.id}`}
              value="single"
              checked={q.multipleChoice === false}
              onChange={() => handleMultipleChoiceChange(q.id, false)}
            />
            Single Choice
          </label>

          <label>
            <input
              type="radio"
              name={`choiceType-${q.id}`}
              value="multiple"
              checked={q.multipleChoice === true}
              onChange={() => handleMultipleChoiceChange(q.id, true)}
            />
            Multiple Choice
          </label>
         </div>

        {/* ===== Answers ===== */}
       {q.answers && q.answers.length > 0 ? (
            q.answers.map((a, index) => {
              const isChanged =
                editingAnswerId === a.id &&
                editingAnswerText.trim() !== a.text.trim();

              return (
              <div
                key={a.id}
                className={`answer-row ${a.correct ? "correct-answer" : ""} ${editingAnswerId === a.id ? "editing" : ""}`}
              >
                 {editingAnswerId === a.id ? (
                    <div className="answer-edit-wrapper">

                    <textarea
                      ref={editInputRef}
                      value={editingAnswerText}
                      onChange={(e) => setEditingAnswerText(e.target.value)}
                      className="answer-edit-input"
                      rows={3}
                    />

                      <div className="answer-edit-buttons">
                        <button
                          className="icon-btn primary"
                          disabled={!isChanged}
                          onClick={() =>
                            handleUpdateAnswer(q.id, a.id)
                          }
                        >
                          💾
                        </button>

                        <button
                          className="icon-btn"
                          onClick={() => {
                            setEditingAnswerId(null);
                            setEditingAnswerText("");
                          }}
                        >
                          ✖
                        </button>
                      </div>

                    </div>
             ) : (
                <div className="answer-content">
                 <span
                  onClick={() => handleToggleCorrect(q.id, a.id)}
                  className="answer-text"
                >
                  {q.multipleChoice
                    ? a.correct ? "☑ " : "☐ "
                    : a.correct ? "🔘 " : "⚪ "}

                  <strong>
                    {String.fromCharCode(65 + index)}){" "}
                  </strong>

                  {a.text}
                </span>
                              
                </div>
              )}

              {editingAnswerId !== a.id && (
                <>
                      <div className="answer-actions">
                        <button
                          className="icon-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveAnswerUp(q.id, a.id);
                          }}
                        >
                          ↑
                        </button>

                        <button
                          className="icon-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveAnswerDown(q.id, a.id);
                          }}
                        >
                          ↓
                        </button>

                        <button
                          className="icon-btn edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingAnswerId(a.id);
                            setEditingAnswerText(a.text);
                          }}
                        >
                          ✏
                        </button>

                        <button
                          className="icon-btn danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAnswer(q.id, a.id);
                          }}
                        >
                          🗑
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          ) : (
            <p className="muted-text">
              Keine Antworten vorhanden
            </p>
          )}

                  {/* ===== Add Answer ===== */}
                  {activeAnswerQuestionId === q.id ? (
                    <div className="answer-input-row">
                    <textarea
                        placeholder="Antwort eingeben..."
                        value={answerDraft}
                        onChange={(e) => {
                          setAnswerDraft(e.target.value);
                          setAnswerError("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();

                            if (answerDraft.trim()) {
                              handleAddAnswer(q.id);
                            }
                          }

                          if (e.key === "Escape") {
                            e.preventDefault();
                            setActiveAnswerQuestionId(null);
                            setAnswerDraft("");
                            setAnswerError("");
                          }
                        }}
                        rows={3}
                        className="answer-edit-input"
                      />

                      {answerError && (
                        <div className="inline-error">{answerError}</div>
                      )}

                      <div className="answer-input-actions">
                        <button
                          className="save-answer-btn"
                          disabled={!answerDraft.trim()}
                          onClick={() => handleAddAnswer(q.id)}
                        >
                          💾 Speichern
                        </button>

                        <button
                          className="secondary-btn"
                          onClick={() => {
                            setActiveAnswerQuestionId(null);
                            setAnswerDraft("");
                            setAnswerError("");
                          }}
                        >
                          ✖ Abbrechen
                        </button>
                      </div>
                    </div>
                  ) : (
                 <div className="answer-add-actions">

                    <button
                      className="secondary-btn add-answer-btn"
                      onClick={() => setActiveAnswerQuestionId(q.id)}
                    >
                      ➕ Antwort hinzufügen
                    </button>

                    <button
                      className="answer-close-btn"
                      title="Frage schließen"
                      onClick={() => setExpandedQuestionId(null)}
                    >
                      ✕
                    </button>

                  </div>
                  )}

                </div>
              )}

            </div>
          ))}
                  </div>

                  {/* Add Question + Scroll Up */}
                    <div className="quiz-bottom-actions">

                      {!isAddingQuestion ? (
                        <div className="quiz-bottom-actions-inner">
                          <button
                            className="primary-btn quiz-add-question-main"
                            onClick={() => {
                              setIsAddingQuestion(true);
                              setQuestionError("");
                            }}
                          >
                            ➕ {questions.length === 0 ? "Erste Frage hinzufügen" : "Frage hinzufügen"}
                          </button>

                          <button
                            type="button"
                            className="quiz-scroll-btn"
                            title="Nach oben springen"
                            onClick={scrollToQuizTop}
                          >
                            ↑
                          </button>
                        </div>
                      ) : (
                        <div className="question-add question-add-wide">
                          <div className="question-add-form">

                            <h4 style={{ marginBottom: "10px" }}>
                              Neue Frage erstellen
                            </h4>

                            <textarea
                              ref={newQuestionInputRef}
                              placeholder="Frage eingeben..."
                              value={newQuestionText}
                              onChange={(e) => {
                                setNewQuestionText(e.target.value);
                                setQuestionError("");
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();

                                  if (newQuestionText.trim()) {
                                    handleAddQuestion();
                                  }
                                }

                                if (e.key === "Escape") {
                                  e.preventDefault();
                                  setIsAddingQuestion(false);
                                  setNewQuestionText("");
                                  setQuestionError("");
                                }
                              }}
                              rows={3}
                              className="answer-edit-input"
                            />

                            {questionError && (
                              <div className="inline-error">{questionError}</div>
                            )}

                            <div className="question-add-form-actions">
                              <button
                                className="secondary-btn"
                                onClick={() => {
                                  setIsAddingQuestion(false);
                                  setNewQuestionText("");
                                  setQuestionError("");
                                }}
                              >
                                Abbrechen
                              </button>

                              <button
                                className="primary-btn"
                                disabled={!newQuestionText.trim()}
                                onClick={handleAddQuestion}
                              >
                                💾 Frage speichern
                              </button>
                            </div>

                          </div>
                        </div>
                      )}

                    </div>
                 </div>  

              </div>
            );
          }
