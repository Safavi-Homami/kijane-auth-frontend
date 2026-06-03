import { useEffect, useState } from "react";
import api from "../../api";  

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get("/quiz-attempts/history");
      setHistory(response.data);
    } catch (err) {
      console.error("History error:", err);
      setError("Fehler beim Laden der Historie.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>⏳ Lade Historie...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  if (history.length === 0)
    return <p>Du hast noch keine Quiz-Versuche abgeschlossen.</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>📊 Meine Quiz-Historie</h2>

      {history.map((attempt) => (
        <div
          key={attempt.attemptId}
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "1rem",
            backgroundColor: attempt.best ? "#f0f9ff" : "#fff"
          }}
        >
          <h3>
            {attempt.quizTitle}{" "}
            {attempt.best && <span style={{ color: "green" }}>🏆 Best</span>}
          </h3>

          <p>
            Versuch #{attempt.attemptNumber} – {attempt.percentage}% –{" "}
            {attempt.passed ? "✅ Bestanden" : "❌ Nicht bestanden"}
          </p>

          <p>
            Beendet am:{" "}
            {attempt.finishedAt
              ? new Date(attempt.finishedAt).toLocaleString()
              : "-"}
          </p>

          {attempt.passed && (
            <button
              onClick={() =>
                window.open(
                  `/api/certificates/${attempt.attemptId}`,
                  "_blank"
                )
              }
            >
              🎓 Zertifikat herunterladen
            </button>
          )}
        </div>
      ))}
    </div>
  );
}