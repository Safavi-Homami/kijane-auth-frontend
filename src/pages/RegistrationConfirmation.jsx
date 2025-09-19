import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendActivationCode } from "@/api";

export default function RegistrationConfirmation() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [email, setEmail] = useState(state?.email || "");
  const [msg, setMsg] = useState(
    email ? `Wir haben dir einen Aktivierungscode an ${email} gesendet.` : ""
  );
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Optional: nach 1.8s einen sanften Hinweis anzeigen/ändern
    const t = setTimeout(() => {
      if (!msg) setMsg("Bitte prüfe dein Postfach und auch den Spam-Ordner.");
    }, 1800);
    return () => clearTimeout(t);
  }, [msg]);

  async function resend() {
    setErr(""); setMsg(""); setBusy(true);
    try {
      const target = email?.trim().toLowerCase();
      if (!target) {
        setErr("Bitte E-Mail angeben.");
        setBusy(false);
        return;
      }
      await sendActivationCode(target);
      setMsg(`Neuer Code wurde an ${target} gesendet.`);
    } catch (e) {
      console.error(e);
      setErr("Senden fehlgeschlagen. Bitte später erneut versuchen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 flex items-start md:items-center justify-center px-4 py-10">
      <Card className="w-full max-w-xl rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl text-center">
            📧 Bestätige deine E-Mail
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 text-center">
            Wir haben dir einen Aktivierungscode gesendet. Gib ihn im nächsten Schritt ein.
          </p>

          {msg && (
            <div className="mt-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-2">
              {msg}
            </div>
          )}
          {err && (
            <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
              {err}
            </div>
          )}

          <div className="mt-6 space-y-3">
            <label className="text-sm text-slate-600">E-Mail</label>
            <Input
              type="email"
              value={email}
              placeholder="z. B. demo@kijane.app"
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="flex items-center gap-2">
              <Button onClick={resend} variant="secondary" disabled={busy}>
                {busy ? "Sende…" : "Code erneut senden"}
              </Button>

              {/* Weiter zum Code-Eingabeschritt.
                 Wenn du statt einer separaten Route Step 4 im Multi-Step nutzt,
                 kannst du alternativ nach /register navigieren. */}
              <Button asChild>
                <Link to="/register/activate" state={{ email }}>
                  Code eingeben
                </Link>
              </Button>
            </div>

            <div className="text-center text-sm text-slate-600">
              Falsch registriert?{" "}
              <Link to="/register" className="underline text-slate-900">
                Zur Registrierung
              </Link>
            </div>
          </div>

          <div className="text-xs text-slate-500 text-center mt-4">
            Tipp: Schau auch im Spam-Ordner nach. Manchmal dauert die E-Mail ein paar Minuten.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
