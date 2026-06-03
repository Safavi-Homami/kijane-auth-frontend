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


const HeaderClavisimoLogo = () => (
  <svg
    viewBox="0 0 680 190"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Clavisimo Logo"
    style={{ height: 45, width: 190, display: "block" }}
  >
    <defs>
      <linearGradient id="hdrClvCircleGradient" x1="24" y1="26" x2="144" y2="154">
        <stop stopColor="#ffb15a" />
        <stop offset="0.48" stopColor="#fb923c" />
        <stop offset="1" stopColor="#f97316" />
      </linearGradient>
      <linearGradient id="hdrClvKeyGradient" x1="162" y1="42" x2="560" y2="72">
        <stop stopColor="#ffffff" />
        <stop offset="1" stopColor="#cbd5e1" />
      </linearGradient>
    </defs>

    <circle cx="86" cy="96" r="58" fill="url(#hdrClvCircleGradient)" />
    <circle cx="86" cy="96" r="68" stroke="rgba(249,115,22,0.28)" strokeWidth="10" />
    <circle cx="86" cy="96" r="50" stroke="rgba(15,23,42,0.45)" strokeWidth="3" />

    <text
      x="86"
      y="122"
      textAnchor="middle"
      fontFamily="Georgia, serif"
      fontWeight="bold"
      fontSize="82"
      fill="#111827"
    >
      C
    </text>

    <g
      stroke="url(#hdrClvKeyGradient)"
      strokeWidth="7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="178" cy="52" r="19" fill="none" />
      <line x1="197" y1="52" x2="566" y2="52" />
    </g>

    <text
      x="145"
      y="125"
      fontFamily="Georgia, serif"
      fontWeight="bold"
      fontSize="78"
    >
      <tspan fill="#f8fafc">lavi</tspan>
      <tspan fill="#fb923c">simo</tspan>
    </text>
  </svg>
);

const Header = () => {
  const navigate = useNavigate();
const { user, logout } = useUser(); 
  const roles = user?.roles || [];

  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef();

  const handleLogout = () => {
    sessionStorage.clear();
    logout();
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
      
          <HeaderClavisimoLogo />
        
        <NavLink to="/" className="header-nav-link">
          <HomeIcon size={18} /> <span>Home</span>
        </NavLink>

        <NavLink to="/courses" className="header-nav-link">
          <BookOpen size={18} /> <span>Kurse</span>
        </NavLink>

       
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
            <NavLink to="/register" className="header-nav-link">
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
