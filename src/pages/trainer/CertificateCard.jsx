import { useNavigate } from "react-router-dom";
import api from "../../api";
import { useEffect, useState } from "react";

export default function CertificateCard({ certificate }) {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const percentage = Number(certificate?.percentage ?? 0);
  const isHighScore = percentage >= 90;

  const displayTitle =
  certificate?.courseTitle ||
  certificate?.quizTitle ||
  "Unbekannter Kurs";

  const issuedDate = certificate?.issuedAt
    ? new Date(certificate.issuedAt).toLocaleDateString("de-DE")
    : "Kein Datum";

  const formatPercent = (value) => {
    if (value === null || value === undefined) return "-";
    return `${Number(value).toFixed(0)}%`;
  };

  const handleDownload = async () => {
  if (!certificate?.id) {
    alert("Zertifikat konnte nicht gefunden werden.");
    return;
  }

  try {
    const response = await api.get(
      `/certificates/${certificate.id}/download`,
      { responseType: "blob" }
    );

    const url = window.URL.createObjectURL(
      new Blob([response.data], { type: "application/pdf" })
    );

    const link = document.createElement("a");

    link.href = url;
    link.setAttribute(
      "download",
      `kurszertifikat-${displayTitle}.pdf`
    );

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Download fehlgeschlagen:", err);
    alert("PDF konnte nicht heruntergeladen werden.");
  }
};

  const handleVerify = () => {
    if (!certificate?.certificateNumber) {
      alert("Keine Zertifikatsnummer vorhanden.");
      return;
    }

    navigate(`/verify/${certificate.certificateNumber}`);
  };

  useEffect(() => {
    if (!certificate?.quizId) {
      setLoadingStats(false);
      return;
    }

    const loadStats = async () => {
      try {
        setLoadingStats(true);

        const res = await api.get(
          `/quizzes/${certificate.quizId}/play/attempt-status`
        );

        setStats(res.data);
      } catch (err) {
        console.error("Statistik konnte nicht geladen werden:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    loadStats();
  }, [certificate?.quizId]);

  return (
    <div className={`certificate-card ${isHighScore ? "gold" : ""}`}>
      <div className="certificate-header">
        <div>
          <p className="certificate-kicker">Bestandener Kurs-Abschluss</p>

            <div className="certificate-title">
              🎓 {displayTitle}
            </div>
        </div>

        {isHighScore && (
          <span className="certificate-highscore-badge">
            High Score
          </span>
        )}
      </div>

      <div className="certificate-meta">
        <p>
          <span>Score</span>
          <strong>{formatPercent(percentage)}</strong>
        </p>

        <p>
          <span>Ausgestellt</span>
          <strong>{issuedDate}</strong>
        </p>

        {certificate?.certificateNumber && (
          <p>
            <span>Zertifikat-Nr.</span>
            <strong>{certificate.certificateNumber}</strong>
          </p>
        )}
      </div>

      {loadingStats && (
        <div className="certificate-stats-box loading">
          Lade Statistik...
        </div>
      )}

      {!loadingStats && stats && (
        <div className="certificate-stats-box">
         
          <div className="certificate-stat-item">
            <span>📊 Bester Versuch</span>
            <strong>{formatPercent(stats.bestPercentage)}</strong>
          </div>

          <div className="certificate-stat-item">
            <span>🕓 Letzter Versuch</span>
            <strong>{formatPercent(stats.lastPercentage)}</strong>
          </div>

         
          <div className="certificate-stat-item">
            <span>🔁 Gesamtversuche</span>
            <strong>{stats.totalAttempts ?? "-"}</strong>
          </div>

          {stats.lastPercentage < stats.bestPercentage && (
            <div className="certificate-stats-note">
              Dein letzter Versuch war niedriger als dein Bestwert.
            </div>
          )}
        </div>
      )}

      <div className="certificate-actions">
        <button type="button" onClick={handleDownload}>
          PDF herunterladen
        </button>

        <button type="button" onClick={handleVerify}>
          Zertifikat prüfen
        </button>
      </div>
    </div>
  );
}