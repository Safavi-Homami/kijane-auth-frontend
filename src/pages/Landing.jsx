import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Logo als Inline-SVG-Komponente
const KiyanLogo = () => (
  <svg width="520" height="180" viewBox="0 0 520 180" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="90" cy="90" r="90" fill="#FF8900"/>
  <text x="2" y="115" fontFamily="Georgia, serif" fontWeight="bold" fontSize="74">
    <tspan fill="black">clavi</tspan><tspan fill="white">simo</tspan>
  </text>
  <text x="155" y="155" fontFamily="Arial, Helvetica, sans-serif" fontWeight="bold" fontSize="33" fill="white" letterSpacing="2"></text>
</svg>

);



export default function Landing() {
  return (
    <div className="min-h-screen bg-neutral-300">
      <div className="w-full min-h-screen px-0">

        {/* Logo zentral oben */}
        <div className="flex justify-center mb-8">
          <KiyanLogo />
        </div>

        {/* Hero */}
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              Auth & 2FA –
              <span className="block underline decoration-4 decoration-yellow-400">
                unterrichts-tauglich
              </span>{" "}
              heute.
              <br />
              <span className="text-orange-500">Produktionsreif bis Ende September.</span>
            </h1>
            <p className="mt-4 text-slate-700">
              Zeig in Minuten Registrierung, Login, E-Mail-Verifizierung,
              Passwort-Reset und optional 2FA. Klare Screens, Validierungen
              und saubere Fehler.
            </p>

            <div className="flex gap-3 mt-6">
              <Button asChild>
                <Link to="/register">Zur Live-Demo</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/courses">Roadmap September</Link>
              </Button>
            </div>

            <p className="mt-4 text-sm text-slate-500">⏱️ Pitch-Dauer: 6–8 Minuten</p>
          </div>

          {/* Kurz-Flow */}
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Live-Flow (Kurzan­sicht)</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700 space-y-2">
              <div>✉️ Registrierung mit E-Mail-Verifizierung</div>
              <div>🔑 Login + Refresh-Token Rotation</div>
              <div>🛠 Passwort vergessen / ändern</div>
              <div>🧭 Rollenbasierte Navigation</div>
            </CardContent>
          </Card>
        </div>

        {/* Was du live zeigst */}
        <h2 className="text-xl md:text-2xl font-semibold mt-12 mb-4">Was du live zeigst</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardContent className="pt-4">Rollen & Rechte (RBAC)</CardContent></Card>
          <Card><CardContent className="pt-4">2FA vorbereitet (TOTP/QR)</CardContent></Card>
          <Card><CardContent className="pt-4">E-Mail-Flows end-to-end</CardContent></Card>
          <Card><CardContent className="pt-4">JWT stabil (401/403)</CardContent></Card>
        </div>

        {/* Ablauf */}
        <h2 className="text-xl md:text-2xl font-semibold mt-12 mb-4">Ablauf in 4 Schritten</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardContent className="pt-4 text-center">1. Registrieren</CardContent></Card>
          <Card><CardContent className="pt-4 text-center">2. Bestätigen</CardContent></Card>
          <Card><CardContent className="pt-4 text-center">3. Login</CardContent></Card>
          <Card><CardContent className="pt-4 text-center">4. Optional 2FA</CardContent></Card>
        </div>

        {/* CTA Box */}
        <Card className="rounded-2xl shadow-sm mt-12">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Starte die Lern-Demo</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4 items-center">
            <div className="text-sm text-slate-700 space-y-1">
              <div>✓ <b>demo@kijane.app</b> / Demo123!</div>
              <div>✓ <b>trainer@kijane.app</b> / Demo123!</div>
              <div>✓ <b>admin@kijane.app</b> / Demo123!</div>
            </div>
            <div className="text-center">
              <Button asChild className="w-full md:w-auto">
                <Link to="/register">Registrieren</Link>
              </Button>
              <p className="text-xs text-slate-500 mt-2">2FA-QR wird in der Demo auf Wunsch angezeigt</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer-Links */}
        <div className="flex gap-6 text-sm text-slate-500 mt-10">
          <Link to="/impressum">Impressum</Link>
          <Link to="/privacy">Datenschutz</Link>
          <Link to="/docs">Doku</Link>
        </div>
      </div>
    </div>
  );
}
