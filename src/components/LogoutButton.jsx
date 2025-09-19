import React from "react";
import { useNavigate } from "react-router-dom";
import { removeToken } from "../tokenUtils";
import { useUser } from "../context/useUser";

function LogoutButton() {
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleLogout = () => {

    removeToken();

        // 🔐 Hier alle relevanten Session-Daten löschen
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("requiresTwoFactor");
    sessionStorage.removeItem("pending2fa");
    sessionStorage.removeItem("twofa.new");

    setUser(null);
    navigate("/login", {
      state: { reset: true }, // Leert Felder bei Login erneut
    });
  };

  return (
    <button onClick={handleLogout} style={{ margin: "10px", padding: "8px 16px" }}>
      Logout
    </button>
  );
}

export default LogoutButton;
