import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import api, { adminApi } from "../../api";
import "./UserList.css";
import UserRoleEditor from "./UserRoleEditor";
import TwoFaStatus from "./TwoFaStatus";

/** Mini-Toast ohne Library */
const Toast = ({ type = "info", message, onClose }) => {
  if (!message) return null;
  return (
    <div className={`toast ${type}`} onClick={onClose} role="alert">
      {message}
    </div>
  );
};

const UserList = () => {
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState({ type: "info", message: "" });

  const allRoles = useMemo(
    () => ["ADMIN", "USER", "TRAINER", "MANAGER", "EDITOR", "AUTHOR"],
    []
  );

  // URL-Filter: ?status=active / locked / unverified | ?filter=2fa
  const [status, setStatus] = useState(null);
  const [filter, setFilter] = useState(null);

  useEffect(() => {
  const params = new URLSearchParams(location.search);
  const newStatus = params.get("status");
  const newFilter = params.get("filter");
  const newRole = params.get("role") || "";
  const newQ = params.get("q") || "";

  setStatus(newStatus);
  setFilter(newFilter);
  setRole(newRole);
  setQ(newQ);
}, [location.search]);

  const showToast = (type, message, ms = 2200) => {
    setToast({ type, message });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(
      () => setToast({ type: "info", message: "" }),
      ms
    );
  };

  // Debounce für Suche
  useEffect(() => {
  const t = setTimeout(() => {
    fetchUsers();
  }, 300);
  return () => clearTimeout(t);
}, [q, role, status, filter]); // Jetzt reagiert auch auf Status und Filter!

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminApi.listUsers({ q, role });
      setUsers(response.content ?? response?.data?.content ?? []);
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
  };

  /** Filterlogik nur im Frontend (2FA oder Status) */
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (filter === "2fa") return user.twoFactorEnabled === true;
      if (status === "active") return user.enabled === true;
      if (status === "locked") return user.enabled === false;
      if (status === "unverified") return user.accountActivated === false;
      return true;
    });
  }, [users, filter, status]);

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
          <option value="">Alle Rollen</option>
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
        <>
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
                    <td>{u.fullName}</td>
                    <td>{u.username}</td>
                    <td>{(u.roles || []).join(", ")}</td>
                    <td>
                      <TwoFaStatus
                        user={u}
                        onUpdated={fetchUsers}
                        onNotify={showToast}
                      />
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setSelectedUser(u)}
                        disabled={loading}
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
        </>
      )}

      {selectedUser && (
        <div className="ul-modal">
          <div className="ul-modal-card">
            <div className="ul-modal-head">
              <strong>Rollen bearbeiten</strong>
              <button
                className="btn btn-icon"
                onClick={() => setSelectedUser(null)}
                aria-label="Schließen"
              >
                ✕
              </button>
            </div>

            <p className="ul-muted">
              Aktuelle Rollen: {(selectedUser.roles || []).join(", ")}
            </p>

            <UserRoleEditor
              user={selectedUser}
              onClose={() => setSelectedUser(null)}
              onSave={() => {
                fetchUsers();
                setSelectedUser(null);
              }}
              onNotify={showToast}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;

/*
import { useEffect, useMemo, useState } from "react";
import api, { adminApi } from "../../api";

import "./userlist.css";
import { useLocation } from "react-router-dom";
import UserRoleEditor from "./UserRoleEditor";
import TwoFaStatus from "./TwoFaStatus";

const Toast = ({ type = "info", message, onClose }) => {
  if (!message) return null;
  return (
    <div className={`toast ${type}`} onClick={onClose} role="alert">
      {message}
    </div>
  );
};

const UserList = () => {
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get("role");
    const statusParam = params.get("status");
    const filterParam = params.get("filter");
    const queryParam = params.get("q");

    // Nur falls vorhanden überschreiben (nicht leeren)
    if (roleParam) setRole(roleParam);
    if (queryParam) setQ(queryParam);
    // Optional: Status und Filter können später verwendet werden
  }, [location.search]);

  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  const allRoles = useMemo(
    () => ["ADMIN", "USER", "TRAINER", "MANAGER", "EDITOR", "AUTHOR"],
    []
  );

  // kleines Debounce für Suche
  useEffect(() => {
    const t = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, role]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminApi.listUsers({ q, role });
      setUsers(response.content ?? response?.data?.content ?? []);
    } catch (err) {
      console.error("Fehler beim Laden der Benutzer", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="userlist-wrap">
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
          <option value="">Alle Rollen</option>
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
        <>
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
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.fullName}</td>
                    <td>{u.username}</td>
                    <td>{(u.roles || []).join(", ")}</td>
                    <td>
                      <TwoFaStatus user={u} onUpdated={fetchUsers} />
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setSelectedUser(u)}
                        disabled={loading}
                      >
                        Rollen ändern
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!loading && users.length === 0 && (
              <p className="ul-empty">Keine Benutzer gefunden.</p>
            )}
          </div>
        </>
      )}

      {selectedUser && (
        <div className="ul-modal">
          <div className="ul-modal-card">
            <div className="ul-modal-head">
              <strong>Rollen bearbeiten</strong>
              <button
                className="btn btn-icon"
                onClick={() => setSelectedUser(null)}
                aria-label="Schließen"
              >
                ✕
              </button>
            </div>

            <p className="ul-muted">
              Aktuelle Rollen: {(selectedUser.roles || []).join(", ")}
            </p>

            <UserRoleEditor
              user={selectedUser}
              onClose={() => setSelectedUser(null)}
              onSave={() => {
                fetchUsers();
                setSelectedUser(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;



/*
import { useEffect, useMemo, useState } from "react";
import api, { adminApi } from "../../api";

import "./userlist.css";
import UserRoleEditor from "./UserRoleEditor";
import TwoFaStatus from "./TwoFaStatus";

const Toast = ({ type = "info", message, onClose }) => {
  if (!message) return null;
  return (
    <div className={`toast ${type}`} onClick={onClose} role="alert">
      {message}
    </div>
  );
};

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  const allRoles = useMemo(
    () => ["ADMIN", "USER", "TRAINER", "MANAGER", "EDITOR", "AUTHOR"],
    []
  );

  // kleines Debounce für Suche
  useEffect(() => {
    const t = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, role]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminApi.listUsers({ q, role });
      setUsers(response.content ?? response?.data?.content ?? []);
    } catch (err) {
      console.error("Fehler beim Laden der Benutzer", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="userlist-wrap">
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
          <option value="">Alle Rollen</option>
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
        <>
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
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.fullName}</td>
                    <td>{u.username}</td>
                    <td>{(u.roles || []).join(", ")}</td>
                    <td>
                      <TwoFaStatus user={u} onUpdated={fetchUsers} />
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setSelectedUser(u)}
                        disabled={loading}
                      >
                        Rollen ändern
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!loading && users.length === 0 && (
              <p className="ul-empty">Keine Benutzer gefunden.</p>
            )}
          </div>
        </>
      )}

      {selectedUser && (
        <div className="ul-modal">
          <div className="ul-modal-card">
            <div className="ul-modal-head">
              <strong>Rollen bearbeiten</strong>
              <button
                className="btn btn-icon"
                onClick={() => setSelectedUser(null)}
                aria-label="Schließen"
              >
                ✕
              </button>
            </div>

            <p className="ul-muted">
              Aktuelle Rollen: {(selectedUser.roles || []).join(", ")}
            </p>

            <UserRoleEditor
              user={selectedUser}
              onClose={() => setSelectedUser(null)}
              onSave={() => {
                fetchUsers();
                setSelectedUser(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
*/