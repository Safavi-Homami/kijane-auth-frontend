import { useEffect, useMemo, useState } from "react";
import api, { adminApi, courseAccessApi } from "../../api";
import "./CourseAccessManagement.css";

export default function CourseAccessManagement() {
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [accesses, setAccesses] = useState([]);

  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedCourse = useMemo(
    () => courses.find((c) => String(c.id) === String(selectedCourseId)),
    [courses, selectedCourseId]
  );

  const activeAccessUserIds = useMemo(() => {
    return new Set(
      accesses
        .filter((a) => a.active === true)
        .map((a) => Number(a.userId))
    );
  }, [accesses]);

  const availableUsers = useMemo(() => {
    return users.filter((user) => {
      if (!user?.id) return false;

      // Bereits aktive Freigaben sollen nicht erneut angeboten werden.
      // Inaktive Freigaben bleiben auswählbar, damit sie wieder aktiviert werden können.
      if (activeAccessUserIds.has(Number(user.id))) return false;

      return true;
    });
  }, [users, activeAccessUserIds]);

  const extractErrorMessage = (err, fallback) => {
    return String(
      err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data ||
        fallback
    );
  };

  const loadInitialData = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const [coursesRes, usersRes] = await Promise.all([
        api.get("/courses"),
        adminApi.listUsers({ q: "", role: "" }),
      ]);

      setCourses(coursesRes.data || []);

      // robust: falls adminApi.listUsers entweder Page-Objekt oder Array liefert
      if (Array.isArray(usersRes)) {
        setUsers(usersRes);
      } else {
        setUsers(usersRes?.content || []);
      }
    } catch (err) {
      console.error("Initialdaten konnten nicht geladen werden!");
      setError("Kurse oder Benutzer konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  };

  const loadAccessesForCourse = async (courseId) => {
    if (!courseId) {
      setAccesses([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await courseAccessApi.listByCourse(courseId);
      setAccesses(data || []);
    } catch (err) {
      console.error("Kursfreigaben konnten nicht geladen werden!");
      setError("Kursfreigaben konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    setMessage("");
    setError("");
    setSelectedUserId("");
    loadAccessesForCourse(selectedCourseId);
  }, [selectedCourseId]);

  const handleGrant = async () => {
    setMessage("");
    setError("");

    if (!selectedCourseId || !selectedUserId) {
      setError("Bitte Kurs und Benutzer auswählen.");
      return;
    }

    try {
      await courseAccessApi.grant({
        courseId: Number(selectedCourseId),
        userId: Number(selectedUserId),
      });

      setMessage("Kursfreigabe wurde erstellt oder aktiviert.");
      setSelectedUserId("");
      await loadAccessesForCourse(selectedCourseId);
    } catch (err) {
      console.error("Freigabe fehlgeschlagen");
      setError(
        extractErrorMessage(
          err,
          "Kursfreigabe konnte nicht erstellt oder aktiviert werden."
        )
      );
    }
  };

  const handleReactivate = async (userId) => {
    setMessage("");
    setError("");

    if (!selectedCourseId || !userId) {
      setError("Kurs oder Benutzer fehlt.");
      return;
    }

    try {
      await courseAccessApi.grant({
        courseId: Number(selectedCourseId),
        userId: Number(userId),
      });

      setMessage("Kursfreigabe wurde aktiviert.");
      setSelectedUserId("");
      await loadAccessesForCourse(selectedCourseId);
    } catch (err) {
      console.error("Freigabe aktivieren fehlgeschlagen");
      setError(
        extractErrorMessage(err, "Kursfreigabe konnte nicht aktiviert werden.")
      );
    }
  };

  const handleRevoke = async (accessId) => {
    setMessage("");
    setError("");

    try {
      await courseAccessApi.revoke(accessId);
      setMessage("Kursfreigabe wurde deaktiviert.");
      await loadAccessesForCourse(selectedCourseId);
    } catch (err) {
      console.error("Freigabe deaktivieren fehlgeschlagen");
      setError(
        extractErrorMessage(err, "Kursfreigabe konnte nicht deaktiviert werden.")
      );
    }
  };

  return (
    <div className="course-access-page">
      <div className="course-access-header">
        <div>
          <p className="course-access-eyebrow">Admin</p>
          <h2>Kursfreigaben verwalten</h2>
          <p>
            Weise einzelnen Benutzern Kurse zu. Aktive Freigaben sind die
            Grundlage für <strong>canLearn</strong>.
          </p>
        </div>
      </div>

      {message && <div className="course-access-success">{message}</div>}
      {error && <div className="course-access-error">{error}</div>}

      <div className="course-access-grid">
        <section className="course-access-card">
          <h3>1. Kurs auswählen</h3>

          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            disabled={loading}
          >
            <option value="">-- Kurs auswählen --</option>

            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>

          {selectedCourse && (
            <div className="course-access-course-info">
              <strong>{selectedCourse.title}</strong>
              <span>
                Sichtbar: {selectedCourse.visible ? "Ja" : "Nein"} · ID:{" "}
                {selectedCourse.id}
              </span>
            </div>
          )}
        </section>

        <section className="course-access-card">
          <h3>2. Benutzer freigeben</h3>

          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            disabled={!selectedCourseId || loading}
          >
            <option value="">-- Benutzer auswählen --</option>

            {availableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.fullName || user.username} ({user.username})
              </option>
            ))}
          </select>

          <button
            className="course-access-primary"
            onClick={handleGrant}
            disabled={!selectedCourseId || !selectedUserId || loading}
          >
            Benutzer für Kurs freigeben
          </button>
        </section>
      </div>

      <section className="course-access-card course-access-list">
        <h3>Aktuelle Freigaben</h3>

        {!selectedCourseId && (
          <p className="course-access-muted">
            Bitte zuerst einen Kurs auswählen.
          </p>
        )}

        {selectedCourseId && loading && (
          <p className="course-access-muted">Lade Freigaben…</p>
        )}

        {selectedCourseId && !loading && accesses.length === 0 && (
          <p className="course-access-muted">
            Für diesen Kurs gibt es noch keine Freigaben.
          </p>
        )}

        {selectedCourseId && accesses.length > 0 && (
          <table className="course-access-table">
            <thead>
              <tr>
                <th>Kurs</th>
                <th>Benutzer</th>
                <th>Status</th>
                <th>Freigegeben von</th>
                <th>Datum</th>
                <th>Aktion</th>
              </tr>
            </thead>

            <tbody>
              {accesses.map((access) => (
                <tr key={access.id}>
                  <td>
                    <strong>
                      {access.courseTitle || selectedCourse?.title || "-"}
                    </strong>
                    <br />
                    <span>ID: {access.courseId || selectedCourseId}</span>
                  </td>

                  <td>
                    <strong>{access.fullName || access.username}</strong>
                    <br />
                    <span>{access.username}</span>
                  </td>

                  <td>
                    {access.active ? (
                      <span className="badge-active">Aktiv</span>
                    ) : (
                      <span className="badge-inactive">Inaktiv</span>
                    )}
                  </td>

                  <td>{access.grantedByUsername || "-"}</td>

                  <td>
                    {access.grantedAt
                      ? new Date(access.grantedAt).toLocaleString("de-DE")
                      : "-"}
                  </td>

                  <td>
                    {access.active ? (
                      <button
                        className="course-access-danger"
                        onClick={() => handleRevoke(access.id)}
                        disabled={loading}
                      >
                        Deaktivieren
                      </button>
                    ) : (
                      <button
                        className="course-access-primary"
                        onClick={() => handleReactivate(access.userId)}
                        disabled={loading}
                      >
                        Aktivieren
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <div className="course-access-note">
        Hinweis: Der strenge Kursfreigabe-Modus ist aktiv. Lernzugriff entsteht
        nur durch eine aktive Admin-Freigabe.
      </div>
    </div>
  );
}