// src/pages/admin/ForgotPassword.jsx  (Pfad wie bei dir)
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@api";
import "./ForgotPassword.css"; // bleibt erhalten

// ✅ shadcn/ui für Look & Feel (nur Optik)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(""); // bleibt, auch wenn wir direkt navigieren
  const [error, setError] = useState("");

  // Alte Session-Daten beim Aufruf dieser Seite löschen (deine Logik)
  useEffect(() => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("pending2fa"); // falls du das nutzt
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Wir sind im öffentlichen Flow – sicherheitshalber Token entfernen (deine Logik)
    sessionStorage.removeItem("token");
    setMessage("");
    setError("");

    try {
      await api.post("/auth/forgot-password", { email });
      // Bestätigung + Zielseite unverändert (deine Logik)
      navigate("/reset-password-code", { state: { email, justSent: true } });
    } catch (err) {
      console.error("Fehler beim Zurücksetzen:", err);
      setError("Fehler beim Zurücksetzen des Passworts.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 flex items-start md:items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl text-center">🔒 Passwort vergessen</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-slate-600 text-center">
              Gib deine E-Mail ein. Du erhältst einen Code/Link zum Zurücksetzen.
            </p>

            <div>
              <label className="text-sm text-slate-600 flex items-center gap-2 mb-1">
                <Mail className="w-4 h-4" /> E-Mail-Adresse
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="z. B. max@example.com"
              />
            </div>

            {message && (
              <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-2">
                {message}
              </div>
            )}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full">Passwort zurücksetzen</Button>

            <div className="text-center text-sm text-slate-600 space-y-2 mt-2">
              <div>
                Direkter Einstieg:{" "}
                <Link className="text-slate-900 underline" to="/reset-password-code">
                  Passwort mit Code zurücksetzen
                </Link>
              </div>
              <div>
                Probleme mit 2FA?{" "}
                <Link className="text-slate-900 underline" to="/reset-2fa">
                  Hier zurücksetzen
                </Link>
              </div>
              <div>
                Zurück zum{" "}
                <Link className="text-slate-900 underline" to="/login">
                  Login
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
