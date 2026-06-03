// src/pages/student/QuizAttemptDetailPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import PageHero from "../../components/PageHero";
import "./QuizAttemptDetailPage.css";

export default function QuizAttemptDetailPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    const loadDetails = async () => {
      try {
        const res = await api.get(`/quiz-attempts/${attemptId}`);
        setData(res.data);
      } catch (err) {
        console.error("Details konnten nicht geladen werden:", err);
        setError("Details konnten nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [attemptId]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  if (loading) {
    return (
      <div className="attempt-detail-page">
        <div className="attempt-detail-wrapper">
          <div className="attempt-detail-message-card">
            Lade Detailanalyse...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="attempt-detail-page">
        <div className="attempt-detail-wrapper">
          <div className="attempt-detail-message-card error">
            <h3>⚠ Fehler</h3>
            <p>{error}</p>

            <button
              type="button"
              className="attempt-detail-btn primary"
              onClick={() => navigate(-1)}
            >
              Zurück
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const totalQuestions = data.questions?.length || 0;

  return (
    <div className="attempt-detail-page">
      <div className="attempt-detail-wrapper">
        <PageHero eyebrow="Detailanalyse" title={data.quizTitle} />

        {/* TOP BAR */}
        <div className="attempt-detail-topbar">
          <div className="attempt-detail-pill">
            <span>Fragen</span>
            <span className="attempt-detail-pill-count">{totalQuestions}</span>
          </div>

          <button
            type="button"
            className="attempt-detail-arrow-btn"
            onClick={scrollToBottom}
            aria-label="Nach unten scrollen"
            title="Nach unten"
          >
            ↓
          </button>
        </div>

        {/* SUMMARY */}
        <div
          className={`attempt-summary-card ${
            data.passed ? "passed" : "failed"
          }`}
        >
          <div className="attempt-summary-header">
            <div
              className={`attempt-summary-icon ${
                data.passed ? "passed" : "failed"
              }`}
            >
              {data.passed ? "✓" : "✕"}
            </div>

            <div className="attempt-summary-text">
              <p className="attempt-summary-kicker">Quiz-Auswertung</p>

              <h2>{data.passed ? "Bestanden" : "Nicht bestanden"}</h2>

              <p>
                {data.passed
                  ? "Sehr gut! Hier siehst du die Detailanalyse deiner Antworten."
                  : "Hier siehst du genau, welche Antworten richtig oder falsch waren."}
              </p>
            </div>
          </div>

          <div className="attempt-score-box">
            <div
              className={`attempt-score-value ${
                data.passed ? "passed" : "failed"
              }`}
            >
              {Number(data.percentage ?? 0).toFixed(2)}%
            </div>

            <div
              className={`attempt-score-badge ${
                data.passed ? "passed" : "failed"
              }`}
            >
              {data.passed ? "✔ BESTANDEN" : "✘ NICHT BESTANDEN"}
            </div>
          </div>
        </div>

        {/* QUESTIONS */}
        <div className="attempt-question-list">
          {data.questions.map((q, index) => {
            const correctLetters = q.answers
              .map((a, i) =>
                a.correctAnswer ? String.fromCharCode(65 + i) : null
              )
              .filter(Boolean);

            const selectedLetters = q.answers
              .map((a, i) => (a.selected ? String.fromCharCode(65 + i) : null))
              .filter(Boolean);

            return (
              <div
                key={q.questionId}
                className={`attempt-question-card ${
                  q.correct ? "correct" : "wrong"
                }`}
              >
                <div className="attempt-question-header">
                  <div className="attempt-question-number">{index + 1}</div>

                  <div className="attempt-question-title-wrap">
                    <h3 className="attempt-question-title">
                      {q.questionText}
                    </h3>

                    <div
                      className={`attempt-question-badge ${
                        q.correct ? "correct" : "wrong"
                      }`}
                    >
                      {q.correct ? "✔ Richtig" : "✘ Falsch"}
                    </div>
                  </div>
                </div>

                <div className="attempt-answer-list">
                  {q.answers.map((a, answerIndex) => {
                    const letter = String.fromCharCode(65 + answerIndex);

                    let className = "attempt-answer-card";

                    if (a.correctAnswer && a.selected) {
                      className += " correct-selected";
                    } else if (a.correctAnswer && !a.selected) {
                      className += " correct-missed";
                    } else if (!a.correctAnswer && a.selected) {
                      className += " wrong-selected";
                    }

                    return (
                      <div key={a.answerId} className={className}>
                        <div className="attempt-answer-main">
                          <span className="attempt-answer-letter">
                            {letter})
                          </span>

                          <span className="attempt-answer-text">
                            {a.text}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="attempt-question-footer">
                  <div className="attempt-question-info-card">
                    <span className="label">Richtige Antwort(en):</span>
                    <strong>
                      {correctLetters.length > 0
                        ? correctLetters.join(", ")
                        : "-"}
                    </strong>
                  </div>

                  <div className="attempt-question-info-card">
                    <span className="label">Deine Auswahl:</span>
                    <strong>
                      {selectedLetters.length > 0
                        ? selectedLetters.join(", ")
                        : "Keine Auswahl"}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM ARROW */}
        <div className="attempt-detail-bottom-arrow">
          <button
            type="button"
            className="attempt-detail-arrow-btn"
            onClick={scrollToTop}
            aria-label="Nach oben scrollen"
            title="Nach oben"
          >
            ↑
          </button>
        </div>

        {/* ACTION */}
        <div className="attempt-detail-actions">
          <button
            type="button"
            className="attempt-detail-btn primary"
            onClick={() => navigate(-1)}
          >
            Zurück
          </button>
        </div>
      </div>
    </div>
  );
}