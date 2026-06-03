import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api";
import "../trainer/Course.css";

export default function VerifyCertificatePage() {
  const navigate = useNavigate();
  const { certificateNumber: certificateNumberFromUrl } = useParams();

  const [certificateNumber, setCertificateNumber] = useState(
    certificateNumberFromUrl || ""
  );
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const formatDate = (value) => {
    if (!value) return "-";

    try {
      return new Date(value).toLocaleDateString("de-DE");
    } catch {
      return value;
    }
  };

  const verifyCertificate = async (number) => {
    if (!number?.trim()) return;

    try {
      setLoading(true);

      const res = await api.get(
        `/certificates/verify/${number.trim()}`
      );

      setResult(res.data);
    } catch (err) {
      console.error("Verify error:", err);
      setResult({ valid: false });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = () => {
    verifyCertificate(certificateNumber);
  };

  // ✅ Wenn die Seite über /verify/:certificateNumber geöffnet wird,
  // automatisch prüfen
  useEffect(() => {
    if (certificateNumberFromUrl) {
      verifyCertificate(certificateNumberFromUrl);
    }
  }, [certificateNumberFromUrl]);

  return (
    <div className="verify-container">
      <div style={{ marginBottom: "20px", display: "flex", gap: "12px" }}>
        <button
          type="button"
          className="secondary-btn"
          onClick={() => navigate(-1)}
        >
          ← Zurück
        </button>

        <button
          type="button"
          className="secondary-btn"
          onClick={() => navigate("/courses")}
        >
          Kurse ansehen
        </button>
      </div>

      <h2>🔒 Zertifikat prüfen</h2>

      <input
        type="text"
        placeholder="Zertifikatsnummer eingeben"
        value={certificateNumber}
        onChange={(e) => setCertificateNumber(e.target.value)}
      />

      <button onClick={handleVerify} disabled={loading}>
        {loading ? "Prüfe..." : "Prüfen"}
      </button>

      {result && (
        <div
          className={`verify-result ${
            result.valid ? "valid" : "invalid"
          }`}
        >
          {result.valid ? (
            <>
              <h3>✅ Zertifikat gültig</h3>
              <p>
                <strong>Name:</strong> {result.username}
              </p>
              <p>
                <strong>Kurs:</strong> {result.quizTitle}
              </p>
              <p>
                <strong>Ergebnis:</strong> {result.percentage}%
              </p>
              <p>
                <strong>Ausgestellt am:</strong>{" "}
                {formatDate(result.issuedAt)}
              </p>
            </>
          ) : (
            <h3>❌ Ungültige Zertifikatsnummer</h3>
          )}
        </div>
      )}
    </div>
  );
}