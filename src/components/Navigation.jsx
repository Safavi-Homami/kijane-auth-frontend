import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navigation.css";
import { useUser } from "../context/UserContext";
import { removeToken } from "../tokenUtils";

export default function Navigation() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useUser();

  const [loggingOut, setLoggingOut] = useState(false);

  const token = sessionStorage.getItem("token");

  // WICHTIG: nicht nur Token! -> wenn user null ist, UI sofort “ausgeloggt”
  const isLoggedIn = !!token && !!user?.username;

  const roles = user?.roles ?? [];

  const hasRole = (role) =>
    Array.isArray(roles) &&
    (roles.includes(role) || roles.includes(`ROLE_${role}`));

 

  const handleLogout = async () => {
    if (loggingOut) return; // verhindert 2-Klick-Problem
    setLoggingOut(true);

    try {
      if (typeof logout === "function") {
        logout(); // UserContext logout -> token weg + user null
      } else {
        

        removeToken();
        setUser?.(null);
      }
    } finally {
      setLoggingOut(false);
      setUser(null);
      navigate("/login", {
        replace: true,
        state: {
          flash: { type: "success", message: "Du wurdest ausgeloggt." },
        },
      });
    }
  };

  useEffect(() => {
    

  }, [user]);

 useEffect(() => {
  const token = sessionStorage.getItem("token");

  if (!token && user === null) {
    console.warn("🚨 No token → redirect to login");
    navigate("/login", { replace: true });
  }
}, [user]);

 useEffect(() => {
  
}, [token, user, isLoggedIn]);


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
