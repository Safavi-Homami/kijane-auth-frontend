import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DemoInfo() {
  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center px-4 py-10">
      <Card className="max-w-lg w-full rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-orange-600 text-center">
            🚫 Registrierung deaktiviert
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-slate-700 text-center">
          <p>
            In dieser Demo ist die Registrierung deaktiviert.  
            Bitte nutzen Sie die folgenden Test-Accounts:
          </p>

          <div className="bg-neutral-50 rounded-lg p-4 text-left text-sm shadow-sm">
            <p>👨‍🎓 Student → <b>fred.student@example.com</b> / Demo123#</p>
            <p>👨‍🏫 Trainer → <b>sebastian.trainer@example.com</b> / Demo123#</p>
          </div>

          <p className="text-sm text-slate-500">
            Hinweis: E-Mail-Funktionen laufen über Mailtrap, deshalb keine echten Registrierungen möglich.
          </p>

          <div className="flex justify-center gap-4 mt-6">
            <Button asChild>
              <Link to="/">Zurück zur Startseite</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/courses">Mehr erfahren</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
