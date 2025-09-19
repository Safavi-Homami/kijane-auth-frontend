import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../context/useUser";

export default function Navigation() {
  const { user } = useUser();
  const location = useLocation();

  const isLoggedIn = !!user;
  const isTrainer = !!user?.roles?.includes("TRAINER");


  // Zeige einen kompakten 2FA‑Reset-Link nur dann, wenn es sinnvoll ist:
  // 1) Der Server hat uns gerade in den 2FA-Flow geschickt (twoFaRequired = true), ODER
  // 2) Wir befinden uns bereits auf einer 2FA-Seite/Route.
  const onTwoFaRoute =
    location.pathname.startsWith("/confirm-2fa") ||
    location.pathname.startsWith("/reset-2fa");
  const showMiniTwoFaReset = user?.twoFaRequired === true || onTwoFaRoute;

  return (
  <nav className="topnav">
    {/* 
    <div className="left">
      <Link to="/">🏠 Home</Link> 
      <Link to="/courses">📚 Kurse</Link> 

      <div className="left">
        {isTrainer && <Link to="/trainer">🛠️ Trainerbereich</Link>}
        {user?.roles?.includes("ADMIN") && (
          <>
            <Link to="/admin">🧭 Admin-Dashboard</Link>
            <Link to="/admin/users">👥 Benutzer</Link>              
          </>
        )}
      </div>
    </div>
    */}

    <div className="right">
      {isLoggedIn ? (
        <>
          {/* <span style={{ marginRight: 12 }}>👤 {user.username}</span> */} 
          {/* <Link to="/change-password">🔑 Passwort ändern</Link> */}
          {showMiniTwoFaReset && (            
            <Link to="/reset-2fa" style={{ marginLeft: 12 }}>
              🔄 2FA zurücksetzen
            </Link>
          )}
          {/* <LogoutButton /> */}
        </>
      ) : (
        <>
         
        </>
      )}
    </div>
  </nav>
);

}
