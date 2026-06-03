import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api, { getCurrentUser } from "../api";
import { useUser } from "../context/useUser";
import { setAuthToken } from "../tokenUtils";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useUser();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ "from" sicher berechnen (niemals zurück nach /login navigieren)
  const from = useMemo(() => {
    const rawFrom = location.state?.from?.pathname;
    const blocked = ["/login", "/register", "/confirm-2fa"];
    return rawFrom && !blocked.includes(rawFrom) ? rawFrom : "/courses";
  }, [location.state]);

  // Eingaben beim ersten Mount cleanen
  useEffect(() => {
    setUsername("");
    setPassword("");
    setError(null);
  }, []);

  // ✅ Logout/Info-Message als Toast, nicht im Formular
  // ✅ "from" im state behalten, aber info entfernen
  useEffect(() => {
    if (location.state?.info) {
      toast.success(location.state.info);

      const keepFrom = location.state?.from ? { from: location.state.from } : undefined;
      navigate(location.pathname, { replace: true, state: keepFrom });
    }
  }, [location.state, navigate, location.pathname]);

  // ✅ Wenn schon eingeloggt → raus aus /login
  // ✅ Wenn pending2fa aktiv → auf /confirm-2fa
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const pending2fa = sessionStorage.getItem("pending2fa");

    if (!token && pending2fa === "1") {
      navigate("/confirm-2fa?new=1", {
        replace: true,
        state: { username, from: { pathname: from } },
      });
      return;
    }

    if (token && pending2fa !== "1") {
      navigate("/courses", { replace: true });
    }
  }, [navigate, from]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/auth/login", { username, password });
      const data = response?.data ?? {};

      const requiresTwoFactor =
        data.requiresTwoFactor ?? data.twoFaRequired ?? data.twoFactorRequired ?? false;

      // --- 2FA Fall ---
      if (requiresTwoFactor) {
        sessionStorage.setItem("pending2fa", "1");
        sessionStorage.setItem("requiresTwoFactor", "true");

        navigate("/confirm-2fa?new=1", {
          replace: true,
          state: {
            username,
            from: { pathname: from },
            newCodeSent: !!data.newCodeSent,
          },
        });
        return;
      }

      // --- Normaler Login ---
      const token = data.token ?? data.accessToken ?? data.jwt ?? null;
      if (!token) {
        setError(data?.message || "Login fehlgeschlagen (Kein Token erhalten).");
        return;
      }

      sessionStorage.removeItem("pending2fa");
      sessionStorage.removeItem("requiresTwoFactor");

      setAuthToken(token);

      const user = await getCurrentUser();
      setUser(user);

      navigate(from, { replace: true });
    } catch (err) {
      const serverMessage = err?.response?.data?.message;
      if (serverMessage && serverMessage.includes("gesperrt bis")) {
        setError(serverMessage);
      } else {
        setError("Login fehlgeschlagen. Benutzername oder Passwort ist falsch.");
      }
      console.error("Login-Fehler!");
    } finally {
      setLoading(false);
    }
  };

 return (
  <div className="auth-page-bg login-wrapper">
    <div className="auth-page-zoom">
      <div className="login-card">
        <h2 className="login-title">Login</h2>

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
              role="button"
              tabIndex={0}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button type="submit" className="form-button" disabled={loading}>
            {loading ? "..." : "Einloggen"}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}

        <Link to="/forgot-password" className="form-link">
          Passwort vergessen?
        </Link>

        <div className="form-footer">
          Noch kein Konto? <Link to="/register">Jetzt registrieren</Link>
        </div>
      </div>
    </div>
    </div>
  );
}

export default LoginPage;
