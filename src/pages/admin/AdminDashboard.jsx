import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, ShieldCheck, Lock, Users } from "lucide-react";
import { adminSecureApi } from "../../api";
import "./AdminDashboard.css";



const DashboardCard = ({ title, value, icon, onClick }) => (
  <div className="dashboard-card clickable" onClick={onClick}>
    <div className="icon">{icon}</div>
    <div className="title">{title}</div>
    <div className="value">{value}</div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    adminSecureApi
      .get("/dashboard/stats")
      .then((response) => setStats(response.data))
      .catch((error) => {
        console.error("Fehler beim Laden der Dashboard-Daten", error);
        setError("Fehler beim Laden der Statistiken");
      });
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!stats) return <p>Dashboard wird geladen...</p>;

  return (
    <div className="admin-dashboard">
      <h2 className="dashboard-title">
        <LayoutDashboard size={28} style={{ marginRight: 10, verticalAlign: "middle" }} />
        Admin-Dashboard
     </h2>
      <div className="dashboard-grid">
        <DashboardCard
          title="Gesamtbenutzer"
          value={stats.totalUsers}
          icon={<Users size={28} />}
          onClick={() => navigate("/admin/users")}
        />
        <DashboardCard
          title="2FA aktiviert"
          value={stats.twoFactorUsers}
          icon={<ShieldCheck size={28} />}
          onClick={() => navigate("/admin/users?filter=2fa")}
        />
        <DashboardCard
          title="Gesperrt"
          value={stats.lockedUsers}
          icon={<Lock size={28} />}
          onClick={() => navigate("/admin/users?status=locked")}
        />
      </div>

      <div className="dashboard-section">
       <h3>
        <Users size={22} style={{ marginRight: 8, verticalAlign: "middle" }} />
        Benutzer nach Rolle
      </h3>

        <div className="roles-grid">
          {Object.entries(stats.usersPerRole).map(([role, count]) => (
            <div
              key={role}
              className="role-card"
              onClick={() => navigate(`/admin/users?role=${role}`)}
            >
              <span className="role-name">{role}</span>
              <span className="role-count">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


/*
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminSecureApi } from "../../api";
import "./AdminDashboard.css";

const DashboardCard = ({ title, value, icon, onClick }) => (
  <div className="dashboard-card clickable" onClick={onClick}>
    <div className="icon">{icon}</div>
    <div className="title">{title}</div>
    <div className="value">{value}</div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    adminSecureApi
      .get("/dashboard/stats")
      .then((response) => setStats(response.data))
      .catch((error) => {
        console.error("Fehler beim Laden der Dashboard-Daten", error);
        setError("Fehler beim Laden der Statistiken");
      });
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!stats) return <p>Dashboard wird geladen...</p>;

  return (
    <div className="admin-dashboard">
      <h2 className="dashboard-title">📊 Admin-Dashboard</h2>

      <div className="dashboard-grid">
        <DashboardCard title="👥 Gesamtbenutzer" value={stats.totalUsers} onClick={() => navigate("/admin/users")} />
        <DashboardCard title="🔐 2FA aktiviert" value={stats.twoFactorUsers} onClick={() => navigate("/admin/users?filter=2fa")} />
        <DashboardCard title="⛔ Gesperrt" value={stats.lockedUsers} onClick={() => navigate("/admin/users?status=locked")} />
      </div>

      <div className="dashboard-section">
        <h3>👤 Benutzer nach Rolle</h3>
        <div className="roles-grid">
          {Object.entries(stats.usersPerRole).map(([role, count]) => (
            <div key={role} className="role-card" onClick={() => navigate(`/admin/users?role=${role}`)}>
              <span className="role-name">{role}</span>
              <span className="role-count">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
*/

/*
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminSecureApi } from "../../api";
import "./AdminDashboard.css";

const DashboardCard = ({ title, value, icon, onClick }) => (
  <div className="dashboard-card clickable" onClick={onClick}>
    <div className="icon">{icon}</div>
    <div className="title">{title}</div>
    <div className="value">{value}</div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    adminSecureApi
      .get("/dashboard/stats")
      .then((response) => setStats(response.data))
      .catch((error) => {
        console.error("Fehler beim Laden der Dashboard-Daten", error);
        setError("Fehler beim Laden der Statistiken");
      });
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!stats) return <p>Dashboard wird geladen...</p>;

  return (
    <div className="admin-dashboard">
      <h2 className="dashboard-title">📊 Admin-Dashboard</h2>

      <div className="dashboard-grid">
        <DashboardCard title="Gesamtbenutzer" value={stats.totalUsers} icon="👥" onClick={() => navigate("/admin/users")} />
        <DashboardCard title="2FA aktiviert" value={stats.twoFactorUsers} icon="🔐" onClick={() => navigate("/admin/users?filter=2fa")} />
        <DashboardCard title="Gesperrt" value={stats.lockedUsers} icon="⛔" onClick={() => navigate("/admin/users?status=locked")} />
      </div>

      <div className="dashboard-section">
        <h3>Benutzer pro Rolle</h3>
        <div className="roles-grid">
          {Object.entries(stats.usersPerRole).map(([role, count]) => (
            <div key={role} className="role-card" onClick={() => navigate(`/admin/users?role=${role}`)}>
              <span className="role-name">{role}</span>
              <span className="role-count">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
*/