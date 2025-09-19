import { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ActivationSuccess() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email || "";

  useEffect(() => {
    // sanfter Auto-Redirect nach 1.6s – inkl. Flash-Nachricht
    const t = setTimeout(() => {
      navigate("/login", {
        replace: true,
        state: { info: "Dein Konto ist aktiviert. Bitte melde dich an." },
      });
    }, 1600);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 flex items-start md:items-center justify-center px-4 py-10">
      <Card className="w-full max-w-xl rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl text-center">
            ✅ E-Mail bestätigt – Account aktiviert
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 text-center">
            {email ? <>Danke, <b>{email}</b>! </> : null}
            Deine Registrierung ist abgeschlossen. Du wirst gleich zum Login weitergeleitet…
          </p>

          <div className="flex items-center justify-center mt-6">
            <Button asChild>
              <Link to="/login">Jetzt einloggen</Link>
            </Button>
          </div>

          <p className="text-xs text-slate-500 text-center mt-3">
            Tipp: Falls die Weiterleitung nicht klappt, klicke auf „Jetzt einloggen“.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
