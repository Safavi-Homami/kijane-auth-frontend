import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api";
import "./Certificates.css";

export default function VerifyCertificate() {

  const { certificateNumber } = useParams();

  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    const verify = async () => {
      try {
        const res = await api.get(`/certificates/verify/${certificateNumber}`);
        setCertificate(res.data);
      } catch (err) {
        setError("Zertifikat nicht gefunden oder ungültig.");
      } finally {
        setLoading(false);
      }
    };

    verify();

  }, [certificateNumber]);

  if (loading) return <div className="page-container">Prüfe Zertifikat...</div>;
  if (error) return <div className="page-container error">{error}</div>;

  return (
    <div className="page-container">
      <div className="content-card">
        <h2>Certificate Verified ✅</h2>
        <p><strong>Certificate Number:</strong> {certificate.certificateNumber}</p>
        <p><strong>Score:</strong> {certificate.percentage}%</p>
        <p><strong>Issued:</strong> {certificate.issuedAt}</p>
      </div>
    </div>
  );
}