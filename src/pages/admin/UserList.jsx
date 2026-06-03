import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import api, { adminApi } from "../../api";
import "./UserList.css";
import UserRoleEditor from "./UserRoleEditor";
import TwoFaStatus from "./TwoFaStatus";

const VERSION_1_ROLES = ["STUDENT", "TRAINER", "ADMIN"];
const BASE_ROLE = "USER";

/** Mini-Toast ohne Library */
const Toast = ({ type = "info", message, onClose }) => {
  if (!message) return null;

  return (
    <div className={`toast ${type}`} onClick={onClose} role="alert">
      {message}
    </div>
  );
};

function normalizeRoleName(role) {
  if (!role) return "";
  if (typeof role === "string") return role;
  if (typeof role === "object" && role.name) return role.name;
  return "";
}

function getRoleNames(user) {
  return (user?.roles || []).map(normalizeRoleName).filter(Boolean);
}

function getDisplayName(user) {
  return (
    user?.fullName ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    user?.username ||
    user?.email ||
    "Benutzer"
  );
}

function formatRolesForVersion1(user) {
  const roleNames = getRoleNames(user);

  const visibleRoles = VERSION_1_ROLES.filter((role) =>
    roleNames.includes(role)
  );

  const result = [...visibleRoles];

  if (roleNames.includes(BASE_ROLE)) {
    result.push("USER (intern)");
  } else {
    result.push("USER (wird beim Speichern ergänzt)");
  }

  return result.join(", ");
}

async function updateUserRolesFallback(userId, finalRoles) {
  const payloads = [
    { roleNames: finalRoles },
    { roles: finalRoles },
    finalRoles,
  ];

  let lastError = null;

  for (const payload of payloads) {
    try {
      return await api.put(`/admin/users/${userId}/roles`, payload);
    } catch (err) {
      lastError = err;

      const status = err?.response?.status;

      // 404 bedeutet: Endpoint anders benannt. Dann nicht weiter mit gleicher URL testen.
      if (status === 404) {
        throw err;
      }

      // Bei DTO-/Body-Format-Problemen versuchen wir das nächste Payload-Format.
      if (![400, 415].includes(status)) {
        throw err;
      }
    }
  }

  throw lastError;
}

const UserList = () => {
  const location = useLocation();

  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [roleSaving, setRoleSaving] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState({ type: "info", message: "" });

  const toastTimerRef = useRef(null);

  const allRoles = useMemo(() => VERSION_1_ROLES, []);

  // URL-Filter: ?status=active / locked / unverified | ?filter=2fa
  const [status, setStatus] = useState(null);
  const [filter, setFilter] = useState(null);

  const showToast = useCallback((type, message, ms = 2400) => {
    setToast({ type, message });

    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = window.setTimeout(() => {
      setToast({ type: "info", message: "" });
    }, ms);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    setStatus(params.get("status"));
    setFilter(params.get("filter"));
    setRole(params.get("role") || "");
    setQ(params.get("q") || "");
  }, [location.search]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);

    try {
      const response = await adminApi.listUsers({ q, role });
      const payload = response?.data ?? response;
      const content = payload?.content ?? payload?.data?.content ?? payload;

      setUsers(Array.isArray(content) ? content : []);
    } catch (err) {
      console.error("Fehler beim Laden der Benutzer", err);

      const msg =
        err?.response?.status === 401
          ? "Sitzung abgelaufen. Bitte neu einloggen."
          : "Benutzer konnten nicht geladen werden.";

      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  }, [q, role, showToast]);

  // Debounce für Suche und Rollenfilter
  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => window.clearTimeout(timer);
  }, [fetchUsers, status, filter]);

  /** Filterlogik nur im Frontend */
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (filter === "2fa") return user.twoFactorEnabled === true;
      if (status === "active") return user.enabled === true;
      if (status === "locked") return user.enabled === false;
      if (status === "unverified") return user.accountActivated === false;
      return true;
    });
  }, [users, filter, status]);

  const handleSaveRoles = async (user, selectedVersion1Roles) => {
    const cleanVersion1Roles = (selectedVersion1Roles || []).filter((role) =>
      VERSION_1_ROLES.includes(role)
    );

    // USER bleibt in Version 1 immer als interne Basisrolle erhalten.
    const finalRoles = Array.from(new Set([BASE_ROLE, ...cleanVersion1Roles]));

    setRoleSaving(true);

    try {
      if (typeof adminApi.updateUserRoles === "function") {
        await adminApi.updateUserRoles(user.id, finalRoles);
      } else if (typeof adminApi.updateRoles === "function") {
        await adminApi.updateRoles(user.id, finalRoles);
      } else if (typeof adminApi.setUserRoles === "function") {
        await adminApi.setUserRoles(user.id, finalRoles);
      } else {
        await updateUserRolesFallback(user.id, finalRoles);
      }

      showToast("success", "Rollen wurden aktualisiert.");
      setSelectedUser(null);
      await fetchUsers();
    } catch (err) {
      console.error("Fehler beim Speichern der Rollen", err);

      const msg =
        err?.response?.status === 403
          ? "Keine Berechtigung für diese Rollenänderung."
          : err?.response?.status === 404
          ? "Rollen-Endpoint wurde nicht gefunden. Dann müssen wir api.js oder den Admin-Controller prüfen."
          : "Rollen konnten nicht gespeichert werden.";

      showToast("error", msg, 3500);
    } finally {
      setRoleSaving(false);
    }
  };

  return (
    <div className="userlist-wrap">
      <Toast
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ type: "info", message: "" })}
      />

      <h2 className="userlist-title">Benutzerliste</h2>

      <div className="userlist-filters">
        <input
          className="ul-input"
          placeholder="Suche nach Name oder E-Mail"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <select
          className="ul-select"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">Alle Version-1-Rollen</option>
          {allRoles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="ul-loading">Lade Benutzer…</p>
      ) : (
        <div className="ul-card">
          <table className="user-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>E-Mail</th>
                <th>Rollen</th>
                <th>2FA</th>
                <th>Aktionen</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td data-label="Name">{getDisplayName(u)}</td>
                  <td data-label="E-Mail">{u.username || u.email}</td>
                  <td data-label="Rollen">{formatRolesForVersion1(u)}</td>
                  <td data-label="2FA">
                    <TwoFaStatus
                      user={u}
                      onUpdated={fetchUsers}
                      onNotify={showToast}
                    />
                  </td>
                  <td data-label="Aktionen">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setSelectedUser(u)}
                      disabled={loading || roleSaving}
                    >
                      Rollen ändern
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && filteredUsers.length === 0 && (
            <p className="ul-empty">Keine Benutzer gefunden.</p>
          )}
        </div>
      )}

      {selectedUser && (
        <UserRoleEditor
          user={selectedUser}
          saving={roleSaving}
          onClose={() => setSelectedUser(null)}
          onSave={handleSaveRoles}
        />
      )}
    </div>
  );
};

export default UserList;