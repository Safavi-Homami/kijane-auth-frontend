import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api, { getCurrentUser } from "../api";
import { useUser } from "../context/useUser";
import { setToken, setAuthToken } from "../tokenUtils";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useUser();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);


  const [error, setError] = useState(null);

  // Flash-Text aus location.state sicher übernehmen
  const [flash, setFlash] = useState(() => location.state?.info ?? "");

  useEffect(() => {
  setUsername("");
  setPassword("");
  setError(null); // optional, aber hilfreich
}, []);

  const from = location.state?.from?.pathname || "/courses";

  // ✅ NEU: Umleiten, wenn bereits eingeloggt (und keine 2FA offen)
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const pending2fa = sessionStorage.getItem("pending2fa");

    if (token && !pending2fa) {
      navigate("/courses", { replace: true });
    }
  }, [navigate]);

  // Bestehender useEffect für Flash-Meldung

  useEffect(() => {
    if (location.state?.info) {
      setFlash(location.state.info);
      // state leeren, damit nach Reload keine Fehlzugriffe passieren
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);


  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const pending2fa = sessionStorage.getItem("pending2fa");

    // Wenn bereits eingeloggt UND kein pending 2FA => sofort weiterleiten
    if (token && !pending2fa) {
      navigate("/courses", { replace: true });
    }

    // Wenn 2FA noch offen => auf 2FA-Seite leiten
    if (!token && pending2fa === "1") {
      navigate("/confirm-2fa", {
        state: {
          username,
          from: { pathname: "/courses" },
          newCodeSent: true,
        },
      });
    }
  }, []);

  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const response = await api.post("/auth/login", { username, password });
    const data = response?.data ?? {};

    const requiresTwoFactor =
      data.requiresTwoFactor ?? data.twoFaRequired ?? data.twoFactorRequired ?? false;

    if (requiresTwoFactor) {
      // Vorher sicher löschen (optional)
      sessionStorage.removeItem("requiresTwoFactor");
      sessionStorage.removeItem("pending2fa");

      // Jetzt korrekt setzen
      sessionStorage.setItem("requiresTwoFactor", "true");
      sessionStorage.setItem("pending2fa", "1");

      sessionStorage.setItem("twofa.new", "1");

      navigate("/confirm-2fa?new=1", {
        state: {
          username,
          from: { pathname: from || "/courses" },
          newCodeSent: !!data.newCodeSent,
        },
      });

      return;
    }


    const token = data.token ?? data.accessToken ?? data.jwt ?? null;
    if (!token) {
      setError(data?.message || "Login fehlgeschlagen (Kein Token erhalten).");
      return;
    }

    setToken(token);
    setAuthToken(token);

    // Benutzer + Rollen holen
    try {
      const user = await getCurrentUser();
      setUser(user);
    } catch (userErr) {
      console.error("Konnte Benutzer nach Login nicht laden:", userErr);
      setError("Login ok, aber Benutzer konnte nicht geladen werden.");
      return;
    }

    setError(null);
    navigate(from || "/courses", { replace: true });
  } catch (err) {
    const serverMessage = err?.response?.data?.message;
    if (serverMessage && serverMessage.includes("gesperrt bis")) {
      setError(serverMessage); // Account-Lockout-Meldung direkt anzeigen
    } else {
      setError("Login fehlgeschlagen. Benutzername oder Passwort ist falsch.");
    }
    console.error("Login-Fehler:", err);
  }
};


  return (
  <div className="login-wrapper">
    <div className="login-card">
      <h2 className="login-title">Login</h2>

      {flash && <p className="success-msg">{flash}</p>}

      <form onSubmit={handleLogin} autoComplete="off">
        <label htmlFor="username">Benutzername:</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="off"
          className="form-input"
        />

        <label htmlFor="password">Passwort:</label>
        <div className="password-wrapper">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="off"
            className="form-input"
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="password-toggle"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button type="submit" className="form-button">Einloggen</button>
      </form>

      {error && <p className="error-message">{error}</p>}

      <Link to="/forgot-password" className="form-link">Passwort vergessen?</Link>
      <div className="form-footer">
        Noch kein Konto? <Link to="/register">Jetzt registrieren</Link>
      </div>
    </div>
  </div>
);
}
export default LoginPage;

  /*
  // 🔒 Fallback-Redirect-Logik für bestimmte Browser oder Edge-Cases
  // Hinweis: Aktuell nicht notwendig, aber für spätere Stabilitätschecks vorbereitet.
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const pending2fa = sessionStorage.getItem("pending2fa");

    if (token && !pending2fa) {
      navigate("/courses", { replace: true });
    }

    if (!token && pending2fa === "1") {
      navigate("/confirm-2fa", {
        state: {
          username,
          from: { pathname: "/courses" },
          newCodeSent: true,
        },
      });
    }
  }, []);
  */
