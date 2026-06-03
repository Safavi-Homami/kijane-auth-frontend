import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiPublic } from "../api";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "@/styles/FormStyles.css";

// ✅ Neu: shadcn/ui für das Layout (nur Optik)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ResetPasswordWithCode() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ✅ E-Mail/Hint aus /forgot-password übernehmen (deine Logik)
  useEffect(() => {
    if (location.state?.email) setEmail(location.state.email);
    if (location.state?.justSent) {
      setMessage("Ein Code wurde an deine E-Mail gesendet.");
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email || !code) {
      setError("Bitte E-Mail und Bestätigungscode eingeben.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    try {
      await apiPublic.post("/reset/reset-password/code", { email, code, newPassword });

      setMessage("✅ Passwort erfolgreich geändert. Weiterleitung …");
      setTimeout(() => {
        navigate("/login", {
          state: { info: "Passwort wurde erfolgreich zurückgesetzt. Bitte melde dich an." },
        });
      }, 1200);
    } catch (err) {
      console.error("❌ Fehler beim Zurücksetzen mit Code:", err);
      if (err.response?.status === 400) {
        setError("Ungültiger oder abgelaufener Code.");
      } else {
        setError("Ein Fehler ist aufgetreten. Bitte erneut versuchen.");
      }
    }
  };

  // ✅ Code erneut senden (deine Logik)
  const handleResend = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!email) {
      setError("Bitte zuerst deine E-Mail eingeben.");
      return;
    }
    try {
      await apiPublic.post("/auth/forgot-password", { email });
      setMessage("Neuer Code wurde gesendet.");
    } catch {
      setError("Code konnte nicht erneut gesendet werden.");
    }
  };

  return (
  <div className="auth-page-bg auth-form-page reset-password-code-auth-page">
    <div className="auth-page-zoom">
      <div className="reset-password-code-wrapper">
        <Card className="w-full max-w-xl rounded-2xl shadow-sm reset-password-code-card">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl text-center">
            🔐 Passwort mit Code zurücksetzen
          </CardTitle>
        </CardHeader>

        <CardContent>
          {message && (
            <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-2">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
            <div>
              <label className="text-sm text-slate-600 mb-1 block">E-Mail-Adresse</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="z. B. demo@kijane.app"
                required
              />
            </div>

            <div>
              <label className="text-sm text-slate-600 mb-1 block">Bestätigungscode</label>
              <Input
                type="text"
                value={code}
                inputMode="numeric"
                onChange={(e) => setCode(e.target.value)}
                placeholder="6-stelliger Code"
                required
              />
              <div className="mt-2">
                {/* Original-Link beibehalten */}
                <a href="#" onClick={handleResend} className="text-sm text-slate-900 underline">
                  Code erneut senden
                </a>
              </div>
            </div>

           {/* Neues Passwort */}
            <div className="form-group">
              <label htmlFor="new-password" className="form-label">
                Neues Passwort
              </label>
              <div className="password-wrapper">
                <input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mind. 8 Zeichen"
                  required
                  className="form-input"
                />
                <span
                  onClick={() => setShowNewPassword((v) => !v)}
                  className="password-toggle"
                  title={showNewPassword ? "verbergen" : "anzeigen"}
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <p className="form-hint">
                🔒 Passwort muss mindestens 8 Zeichen lang sein, mit einem Großbuchstaben und einem Sonderzeichen.
              </p>
            </div>

            {/* Passwort bestätigen */}
            <div className="form-group">
              <label htmlFor="confirm-password" className="form-label">
                Passwort bestätigen
              </label>
              <div className="password-wrapper">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Passwort erneut eingeben"
                  required
                  className="form-input"
                />
                <span
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="password-toggle"
                  title={showConfirmPassword ? "verbergen" : "anzeigen"}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            <Button type="submit" className="w-full">
              Passwort ändern
            </Button>

            <div className="text-center text-sm text-slate-600">
              <Link className="text-slate-900 underline" to="/login">
                Zurück zum Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
    </div>
    </div>
  );
}
