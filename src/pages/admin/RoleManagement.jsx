import React, { useEffect, useState } from "react";
import "./RoleManagement.css";
import api from "../../api";

function RoleManagement() {
  const [users, setUsers] = useState([]);
  const [selectedUsername, setSelectedUsername] = useState("");
  const [newRole, setNewRole] = useState("");

  // Benutzer vom Backend Laden
  useEffect(() => {
    api
      .get("/admin/users")
      .then((res) => setUsers(res.data))
      .catch((err) => {
        console.error("❌ Fehler beim Laden der Benutzer:", err);
        alert("❌ Fehler beim Laden der Benutzer");
      });
  }, []);

  // Rollenwechsel absenden
  const handleSubmit = () => {
    if (!selectedUsername || !newRole) {
      alert("Bitte Benutzer und neue Rolle auswählen");
      return;
    }

    api
      .post("/admin/change-role", {
        username: selectedUsername,
        newRole: newRole,
      })
      .then(() => alert("✅ Rolle erfolgreich geändert!"))
      .catch((err) => {
        console.error("❌ Fehler beim Ändern der Rolle:", err);
        alert("❌ Fehler beim Ändern der Rolle");
      });
  };

  return (
    <div className="role-management">
      <h2>🔐 Rollenverwaltung (Admin)</h2>

      <label>👤 Benutzer wählen:</label>
      <select
        value={selectedUsername}
        onChange={(e) => setSelectedUsername(e.target.value)}
      >
        <option value="">-- Bitte wählen --</option>
        {users.map((user) => (
          <option key={user.username} value={user.username}>
            {user.username}
          </option>
        ))}
      </select>

      <br /><br />

      <label>🛠️ Neue Rolle wählen:</label>
      <select
        value={newRole}
        onChange={(e) => setNewRole(e.target.value)}
      >
        <option value="">-- Bitte wählen --</option>
        <option value="ADMIN">ADMIN</option>
        <option value="TRAINER">TRAINER</option>
        <option value="USER">USER</option>
        <option value="MANAGER">MANAGER</option>
        <option value="EDITOR">EDITOR</option>
        <option value="AUTHOR">AUTHOR</option>
      </select>

      <br /><br />

      <button onClick={handleSubmit}>✅ Rolle ändern</button>
    </div>
  );
}

export default RoleManagement;
