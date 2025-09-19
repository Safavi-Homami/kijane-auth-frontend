// src/pages/admin/UserRoleEditor.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../../api";

const ALL_ROLES = ["ADMIN", "USER", "TRAINER", "MANAGER", "EDITOR", "AUTHOR"];

const UserRoleEditor = ({ user, onClose, onSave, onNotify }) => {
  const initial = useMemo(() => user?.roles || [], [user]);
  const [selected, setSelected] = useState(initial);
  const [saving, setSaving] = useState(false);

  useEffect(() => setSelected(initial), [initial]);

  const toggle = (role) => {
    setSelected((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const getToken = () =>
  sessionStorage.getItem("token") ||
  sessionStorage.getItem("authToken") ||
  localStorage.getItem("token") ||
  localStorage.getItem("authToken");

const save = async () => {
  const token = getToken();

  try {
    setSaving(true);
    await api.put(
      `/admin/v1/users/${user.id}/roles`,
      { roles: selected },                   // <<==== DTO!
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    );
    onNotify?.("success", "Rollen gespeichert.");
    onSave?.();
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      (err?.response?.status === 401
        ? "Sitzung abgelaufen. Bitte neu einloggen."
        : "Fehler beim Speichern der Rollen.");
    onNotify?.("error", msg);
    console.error("Rollen speichern fehlgeschlagen:", err);
  } finally {
    setSaving(false);
  }
};

  return (
    <div>
      <p className="ul-muted">
        Aktuelle Rollen: {(user?.roles || []).join(", ")}
      </p>

      <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
        {ALL_ROLES.map((r) => (
          <label key={r} className="role-checkbox">
            <input
              type="checkbox"
              checked={selected.includes(r)}
              onChange={() => toggle(r)}
            />
            <span>{r}</span>
          </label>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? "Speichere…" : "Speichern"}
        </button>
        <button className="btn btn-secondary" onClick={onClose} disabled={saving}>
          Abbrechen
        </button>
      </div>
    </div>
  );
};

export default UserRoleEditor;
