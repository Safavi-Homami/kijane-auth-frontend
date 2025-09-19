// src/pages/ConfirmTwoFa.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate, Link, useSearchParams } from "react-router-dom";
import api, { getCurrentUser } from "../api";
import { useUser } from "../context/useUser";
import { setToken, setAuthToken } from "../tokenUtils";

function ConfirmTwoFa() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [twoFaCode, setTwoFaCode] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);


  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const from = location.state?.from?.pathname || "/courses";
  const { setUser } = useUser();

  // robuster Hinweis-Mechanismus
  const fromState = location.state?.newCodeSent === true;
  const fromQuery = params.get("new") === "1";
  const fromStorage = sessionStorage.getItem("twofa.new") === "1";

  const showNewCodeHint = useMemo(
    () => fromState || fromQuery || fromStorage,
    [fromState, fromQuery, fromStorage]
  );

  useEffect(() => {
    if (fromState) sessionStorage.setItem("twofa.new", "1");
    const t = setTimeout(() => sessionStorage.removeItem("twofa.new"), 30000);
    return () => clearTimeout(t);
  }, [fromState]);

  useEffect(() => {
    if (location.state?.username) {
      setUsername(location.state.username);
    }
  }, [location.state]);



  useEffect(() => {
  const pending2fa = sessionStorage.getItem("pending2fa");
  const token = sessionStorage.getItem("token");
  const requires2fa = sessionStorage.getItem("requiresTwoFactor") === "true";

  if (token || pending2fa !== "1" || !requires2fa) {
    console.warn("Redirecting to /login: Bedingungen nicht erfüllt", {
      token,
      pending2fa,
      requires2fa,
    });
    navigate("/login");
  }
}, []);

console.log("Confirm2FA gestartet mit:", {
  token: sessionStorage.getItem("token"),
  pending2fa: sessionStorage.getItem("pending2fa"),
  requiresTwoFactor: sessionStorage.getItem("requiresTwoFactor"),
});


  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const response = await api.post("/auth/confirm-2fa", {
      username,
      password,
      twoFaCode,
      code: twoFaCode,
    });

    const data = response?.data ?? {};
    const token = data.token;
    if (!token) {
      setError(data?.message || "2FA-Bestätigung fehlgeschlagen (Kein Token erhalten).");
      return;
    }

    setToken(token);
    sessionStorage.setItem("token", token);
    setAuthToken(token);

    // Benutzer + Rollen holen
    sessionStorage.removeItem("requiresTwoFactor");
  sessionStorage.removeItem("pending2fa");
  sessionStorage.removeItem("twofa.new");

  // Benutzer laden und setzen
  try {
    const user = await getCurrentUser();
    setUser(user);
  } catch (err) {
    console.error("Fehler beim Laden des Benutzers nach 2FA:", err);
    setError("Login erfolgreich, aber Benutzer konnte nicht geladen werden.");
    return;
  }

  // Navigation zur Zielseite
  navigate(from || "/courses", { replace: true });

  } catch (err) {
  console.error("Login-Fehler:", err);
  const message = err?.response?.data?.message;

  if (message?.toLowerCase().includes("abgelaufen")) {
    setError("⏱️ Dein 2FA-Code ist abgelaufen. Bitte melde dich neu an.");
    sessionStorage.removeItem("pending2fa");
    sessionStorage.removeItem("requiresTwoFactor");
    sessionStorage.removeItem("twofa.new");
    return;
  }

  setError("Login fehlgeschlagen. Bitte überprüfe Passwort und 2FA-Code.");
}
};


  return (
    <div className="form-container">
      <h2>Login (2FA)</h2>

      {showNewCodeHint && (
        <div
          role="status"
          aria-live="polite"
          className="my-3 rounded-lg border p-3"
          style={{ background: "#eff6ff", color: "#1e3a8a", borderColor: "#93c5fd" }}
        >
          Ein neuer 2FA‑Code wurde an deine E‑Mail gesendet. Bitte gib ihn unten ein.
        </div>
      )}

      <form onSubmit={handleLogin}>
        <label>
          Benutzername:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled
          />
        </label>

        <label>
          Passwort:
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
              title={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>
        </label>

        <label>
          2FA-Code:
          <input
            type="text"
            value={twoFaCode}
            onChange={(e) => setTwoFaCode(e.target.value.trim())}
            placeholder="z. B. 123456"
          />
        </label>

        <button type="submit">Einloggen</button>
        {error && <p className="error">{error}</p>}
      </form>

     <div style={{ marginTop: "10px" }}>
      <button onClick={() => {
        sessionStorage.clear(); // optional, aber empfehlenswert
        navigate("/login");
      }}>
        Logout
      </button>
    </div>


    </div>
  );
}

export default ConfirmTwoFa;
