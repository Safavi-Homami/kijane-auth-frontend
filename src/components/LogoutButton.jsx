import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navigation.css";
import { useUser } from "../context/UserContext";
import { removeToken } from "../tokenUtils";

export default function Navigation() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useUser();

  const [loggingOut, setLoggingOut] = useState(false);

  // ✅ TOKEN REAKTIV MACHEN (wichtiger Fix!)
  const [token, setToken] = useState(() => sessionStorage.getItem("token"));

  useEffect(() => {
    const handler = () => {
      setToken(sessionStorage.getItem("token"));
    };

    window.addEventListener("storage", handler);
    window.addEventListener("auth-changed", handler);

    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("auth-changed", handler);
    };
  }, []);

  // Navigation erkennt Logout sofort
  const isLoggedIn = !!token && !!user?.username;

  const roles = user?.roles ?? [];

  const hasRole = (role) =>
    Array.isArray(roles) &&
    (roles.includes(role) || roles.includes(`ROLE_${role}`));

  const showTrainerArea = useMemo(() => {
    return !!user?.roles?.some(
      (role) => role === "ROLE_TRAINER" || role === "ROLE_ADMIN"
    );
  }, [user]);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);

    try {
      if (typeof logout === "function") {
        logout();
      } else {
          

        removeToken();
        setUser?.(null);
      }
    } finally {
      // 🔥 sicherstellen, dass UI neu rendert
      sessionStorage.removeItem("token");
      localStorage.removeItem("token");

      setUser(null);

      // Navigation neu triggern
      window.dispatchEvent(new Event("auth-changed"));

      navigate("/login", {
        replace: true,
        state: {
          flash: { type: "success", message: "Du wurdest ausgeloggt." },
        },
      });

      setLoggingOut(false);
    }
  };

  return (
    <header className="navigation-header">
      <nav className="navigation">
        <div className="nav-left">
          <Link to="/" className="nav-logo">
            clavisimo
          </Link>

          <Link to="/" className="nav-link">
            Home
          </Link>

          <Link to="/courses" className="nav-link">
            Kurse
          </Link>

         
        </div>

        <div className="nav-right">
          {!isLoggedIn ? (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-link">
                Registrieren
              </Link>
            </>
          ) : (
            <>
              <span className="nav-user">
                {user?.username || user?.email}
              </span>

              <button
                className="nav-logout-btn"
                onClick={handleLogout}
                disabled={loggingOut}
                title={loggingOut ? "Logout..." : "Logout"}
              >
                {loggingOut ? "Logout..." : "Logout"}
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
