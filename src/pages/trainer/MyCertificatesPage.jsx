import { useEffect, useMemo, useState } from "react";
import api from "../../api";
import CertificateCard from "./CertificateCard";
import "./Certificates.css";
import { useNavigate, useLocation } from "react-router-dom";
import PageHero from "../../components/PageHero";

export default function MyCertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const stateCourseId = location.state?.courseId || null;
  const stateReturnTo = location.state?.returnTo || null;
  const stateReturnLabel =
    location.state?.returnLabel || "← Zurück zum Ergebnis";

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    const loadCertificates = async () => {
      try {
        setLoading(true);
        setError("");

        /*
         * Wichtig:
         * Wenn wir von der Abschlussprüfung-ResultPage kommen,
         * wird das Kurszertifikat hier zuerst erzeugt/gesichert.
         *
         * Dadurch zeigt /certificates/my danach sofort 1 Zertifikat.
         */
        if (stateCourseId) {
          await api.post(`/certificates/course/${stateCourseId}/ensure`);
        }

        const res = await api.get("/certificates/my");
        setCertificates(res.data || []);
      } catch (err) {
        console.error("Zertifikate konnten nicht geladen werden:", err);
        setError("Zertifikate konnten nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    };

    loadCertificates();
  }, [stateCourseId]);

  const cameFromResultPage =
  !!location.state?.fromQuizId ||
  !!location.state?.quizId ||
  !!stateReturnTo;

const resultQuizId = useMemo(() => {
  if (location.state?.fromQuizId) {
    return location.state.fromQuizId;
  }

  if (location.state?.quizId) {
    return location.state.quizId;
  }

  return null;
}, [location.state]);

const resultReturnTarget = useMemo(() => {
  if (stateReturnTo) {
    return stateReturnTo;
  }

  if (resultQuizId) {
    return `/quiz/${resultQuizId}/result`;
  }

  return null;
}, [stateReturnTo, resultQuizId]);



  if (loading) {
    return (
      <div className="certificates-page">
        <div className="certificates-wrapper">
          <div className="certificates-message-card">
            Lade Zertifikate...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="certificates-page">
        <div className="certificates-wrapper">
          <div className="certificates-message-card error">
            <h3>⚠️ Fehler</h3>
            <p>{error}</p>

            <button
              type="button"
              className="certificates-btn primary"
              onClick={() => navigate("/courses")}
            >
              Zurück zu Kursen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="certificates-page">
      <div className="certificates-wrapper">
        <PageHero eyebrow="Zertifikate" title="Meine Zertifikate" />

        <div className="certificates-top-actions">
          <button
            type="button"
            onClick={() => {
              if (!resultReturnTarget) return;

              navigate(resultReturnTarget, {
                state: {
                  isFinalExam: location.state?.isFinalExam === true,
                  courseId: location.state?.courseId || null,
                  returnTo: location.state?.courseReturnTo || "/courses",
                },
              });
            }}
            className={`certificates-btn ${
              resultReturnTarget ? "primary" : "disabled"
            }`}
            disabled={!resultReturnTarget}
          >
            {stateReturnLabel}
          </button>

          <button
            type="button"
            onClick={() => navigate("/courses")}
            className="certificates-btn secondary"
          >
            ← Zurück zu Kursen
          </button>
        </div>

        <div className="certificates-main-card">
          <div className="certificates-section-header">
            <div>
              <p className="certificates-kicker">Lernfortschritt</p>
              <h2>Erworbene Zertifikate</h2>
            </div>

            <div className="certificates-count-pill">
              <span>Zertifikate</span>
              <strong>{certificates.length}</strong>
            </div>
          </div>

          {certificates.length === 0 ? (
            <div className="certificates-empty-card">
              <div className="certificates-empty-icon">🎓</div>

              <h3>Noch keine Zertifikate vorhanden</h3>

              <p>
                Sobald du eine Abschlussprüfung bestehst und ein Zertifikat
                verfügbar ist, erscheint es hier.
              </p>

              <button
                type="button"
                className="certificates-btn primary"
                onClick={() => navigate("/courses")}
              >
                Kurse ansehen
              </button>
            </div>
          ) : (
            <div className="certificates-list">
              {certificates.map((cert) => (
                <CertificateCard key={cert.id} certificate={cert} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}