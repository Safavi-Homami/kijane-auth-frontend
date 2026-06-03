import { useEffect, useMemo, useState } from "react";

const EDITABLE_ROLES = ["STUDENT", "TRAINER", "ADMIN"];
const BASE_ROLE = "USER";

function normalizeRoleName(role) {
  if (!role) return "";
  if (typeof role === "string") return role;
  if (typeof role === "object" && role.name) return role.name;
  return "";
}

function UserRoleEditor({ user, onSave, onClose, saving = false }) {
  const currentRoleNames = useMemo(() => {
    return (user?.roles || []).map(normalizeRoleName).filter(Boolean);
  }, [user]);

  const [selectedRoles, setSelectedRoles] = useState([]);

  useEffect(() => {
    const visibleRoles = EDITABLE_ROLES.filter((role) =>
      currentRoleNames.includes(role)
    );

    setSelectedRoles(visibleRoles);
  }, [currentRoleNames]);

  if (!user) return null;

  const displayName =
    user.fullName ||
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    user.username ||
    user.email ||
    "Benutzer";

  const displayEmail = user.email || user.username || "";

  const hasInternalUserRole = currentRoleNames.includes(BASE_ROLE);

  const handleToggleRole = (role) => {
    setSelectedRoles((prev) => {
      if (prev.includes(role)) {
        return prev.filter((r) => r !== role);
      }

      return [...prev, role];
    });
  };

  const handleSubmit = () => {
    const orderedRoles = EDITABLE_ROLES.filter((role) =>
      selectedRoles.includes(role)
    );

    onSave(user, orderedRoles);
  };

  return (
    <div className="ul-modal">
      <div className="ul-modal-card role-editor-card">
        <div className="ul-modal-head">
          <strong>Rollen bearbeiten</strong>

          <button
            type="button"
            className="btn btn-icon"
            onClick={onClose}
            disabled={saving}
            aria-label="Schließen"
          >
            ✕
          </button>
        </div>

        <div className="role-editor-user-info">
          <strong>{displayName}</strong>
          {displayEmail && <span>{displayEmail}</span>}
        </div>

        <div className="role-editor-current">
          Aktuelle Version-1-Rollen:{" "}
          <strong>
            {selectedRoles.length > 0
              ? selectedRoles.join(", ")
              : "Keine sichtbare Version-1-Rolle"}
          </strong>
        </div>

        <div className="role-editor-note">
          Die interne Basisrolle <strong>USER</strong>{" "}
          {hasInternalUserRole
            ? "ist vorhanden und bleibt erhalten."
            : "wird beim Speichern automatisch ergänzt."}
        </div>

        <div className="role-editor-list">
          {EDITABLE_ROLES.map((role) => (
            <label key={role} className="role-editor-row">
              <input
                type="checkbox"
                checked={selectedRoles.includes(role)}
                onChange={() => handleToggleRole(role)}
                disabled={saving}
              />
              <span>{role}</span>
            </label>
          ))}
        </div>

        <div className="role-editor-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Speichern…" : "Speichern"}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={saving}
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserRoleEditor;