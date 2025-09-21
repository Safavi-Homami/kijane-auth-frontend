import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


// Logo als Inline-SVG-Komponente
const KiyanLogo = () => (
  <svg
    width="320"
    height="120"
    viewBox="0 0 520 180"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="90" cy="90" r="90" fill="#FF8900" />
    <text
      x="2"
      y="115"
      fontFamily="Georgia, serif"
      fontWeight="bold"
      fontSize="74"
    >
      <tspan fill="black">clavi</tspan>
      <tspan fill="white" stroke="black" strokeWidth="2">simo</tspan>
    </text>
  </svg>
);

// Vorlesefunktion
const speakText = (text) => {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "de-DE"; // deutsche Stimme
  synth.speak(utterance);
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="w-full min-h-screen px-4 md:px-8 py-6">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <KiyanLogo />
        </div>

        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
            Clavisimo –
            <span className="block text-orange-600">Education & Startup Tools</span>
          </h1>
          <p className="mt-4 text-slate-700 text-lg">
            Praxisnahe IT-Kurse ab November und moderne Authentifizierungs-Module
            für Startups. Zwei Bereiche, ein Ziel: Lernen. Anwenden. Durchstarten.
          </p>

          {/* Vorlese-Button */}
          <div className="mt-4">
            <button
              onClick={() =>
                speakText("Willkommen bei Clavisimo – Education und Startup Tools")
              }
              className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition"
            >
              🔊 Vorlesen
            </button>
          </div>

          <div className="flex gap-3 mt-6 justify-center flex-wrap">
            {/* Registrieren deaktiviert im Demo-Modus */}
            <Button asChild className="whitespace-nowrap px-6">
              <Link to="/demo-info">Registrieren</Link>
            </Button>


            {/* Roadmap-Link bleibt aktiv */}
            <Button asChild variant="secondary" className="whitespace-nowrap px-6">
              <Link to="/courses">Mehr erfahren</Link>
            </Button>
          </div>
        </div>

        {/* Zwei Hauptbereiche */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* EDU-Bereich */}
          <Card className="rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-orange-600">
                🎓 Clavissimo EDU
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-700">
              <p>
                Ab <b>November 2025</b> starten unsere ersten praxisorientierten Wochenend-Kurse. 
                Ab dem <b>15. Oktober</b> finden Sie hier alle Details zu Terminen, Orten und Kosten.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Java Backend Basics</li>
                <li>Fortgeschrittenes Java</li>
                <li>Spring Boot / JPA / Auth / Security</li>
              </ul>
              <p>
                Vorteile: Lernen mit realistischen Projekten, 
                aktuelle Technologien & praxisnaher Wissenstransfer.
              </p>
              <p className="text-sm text-slate-500">
                Hinweis: Alle Angaben noch vorläufig. Konkrete Infos ab 15. Oktober.
              </p>
              <div className="flex justify-between items-center pt-2">
                <p className="text-sm">
                  📧 Fragen oder Interesse? <b>edu@clavissimo.com</b>
                </p>
                <button
                  onClick={() =>
                    speakText(
                      "Clavissimo EDU – Ab November praxisorientierte Wochenend-Kurse. Java Backend Basics, Fortgeschrittenes Java und Spring Boot mit Security."
                    )
                  }
                  className="px-3 py-1 rounded bg-orange-500 text-white text-sm hover:bg-orange-600"
                >
                  🔊 Vorlesen
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Startup-Tools */}
          <Card className="rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-orange-600">
                🚀 Startup Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-700">
              <p>
                Startups können ab sofort unsere <b>leicht erweiterbaren Tools</b> testen. 
                Ab <b>1. November</b> folgen hier weitere Infos und kurze Demo-Videos.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Benutzerverwaltung & Rollen</li>
                <li>Login mit JWT & Zwei-Faktor-Auth</li>
                <li>Passwort-Reset & E-Mail-Verifizierung</li>
                <li>Admin-Dashboard für User-Management</li>
              </ul>
              <div className="bg-neutral-50 rounded-lg p-3 text-sm shadow-sm">
                <p className="font-semibold mb-2">🔑 Demo-Zugang:</p>
                <p>Student → fred.student@example.com / Demo123#</p>
                <p>Trainer → sebastian.trainer@example.com / Demo123#</p>
              </div>
              <p className="text-sm text-slate-500">
                Hinweis: Weitere Details und Videos ab 1. November hier auf dieser Seite.
              </p>
              <div className="flex justify-between items-center pt-2">
                <p className="text-sm">
                  📧 Interesse geweckt? <b>info@clavissimo.com</b>
                </p>
                <button
                  onClick={() =>
                    speakText(
                      "Startup Tools – ab sofort testbar. Benutzerverwaltung, Rollen, Login mit Zwei Faktor Authentifizierung, Passwort Reset und Admin Dashboard."
                    )
                  }
                  className="px-3 py-1 rounded bg-orange-500 text-white text-sm hover:bg-orange-600"
                >
                  🔊 Vorlesen
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t pt-6 text-center text-sm text-slate-500">
          <div className="space-y-2">
            <p>Kontakt:</p>
            <p>📧 info@clavissimo.com</p>
            <p>📧 edu@clavissimo.com</p>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <Link to="/impressum">Impressum</Link>
            <Link to="/privacy">Datenschutz</Link>
            <Link to="/docs">Doku</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
