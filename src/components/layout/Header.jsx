// src/components/layout/Header.jsx
import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LogOutIcon,
  UserIcon,
  KeyRoundIcon,
  HomeIcon,
  BookOpen,
  ShieldIcon,
  BadgeCheckIcon,
  ChevronDown,
  LogIn,
  UserPlus
} from "lucide-react";
import { useUser } from "../../context/UserContext";
import "../../styles/Header.css";
import logo from '../../assets/logo.svg';

const Header = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const roles = user?.roles || [];

  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef();

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  // Schließe das Dropdown, wenn außerhalb geklickt wird
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="app-header">
      <div className="header-left">
        <header className="app-header">
          <img src={logo} alt="Kiyan Edu Center Logo" style={{ height: 48 }} />
        </header>
        <NavLink to="/" className="header-nav-link">
          <HomeIcon size={18} /> <span>Home</span>
        </NavLink>

        <NavLink to="/courses" className="header-nav-link">
          <BookOpen size={18} /> <span>Kurse</span>
        </NavLink>

        {roles.includes("TRAINER") && (
          <NavLink to="/trainer" className="header-nav-link">
            <BadgeCheckIcon size={18} /> <span>Trainerbereich</span>
          </NavLink>
        )}

        {roles.includes("ADMIN") && (
          <NavLink to="/admin" className="header-nav-link">
            <ShieldIcon size={18} /> <span>Admin-Dashboard</span>
          </NavLink>
        )}
      </div>

      <div className="header-right" ref={dropdownRef}>
        {!user && (
          <>
            <NavLink to="/login" className="header-nav-link">
              <LogIn size={18} /> <span>Login</span>
            </NavLink>
            {/* Registrieren im Demo-Modus blockiert */}
            <NavLink to="/demo-info" className="header-nav-link">
              <UserPlus size={18} /> <span>Registrieren</span>
            </NavLink>
          </>
        )}

        {user && (
          <>
            <div
              className="header-user-dropdown"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <UserIcon size={18} />
              <span>{user?.username || "Benutzer"}</span>
              <ChevronDown size={16} />
            </div>

            {menuOpen && (
              <div className="user-dropdown-menu">
                <NavLink to="/admin/settings/profile" className="dropdown-item">
                  <UserIcon size={16} /> Profil
                </NavLink>
                <NavLink to="/change-password" className="dropdown-item">
                  <KeyRoundIcon size={16} /> Passwort ändern
                </NavLink>
                <button className="dropdown-item" onClick={handleLogout}>
                  <LogOutIcon size={16} /> Logout
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
