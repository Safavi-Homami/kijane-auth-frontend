import { Link } from "react-router-dom";
import "./Landing.css"; // eigene CSS-Datei

// Logo als Inline-SVG-Komponente
const KiyanLogo = () => (
  <svg
    className="logo"
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
      <tspan fill="#FF8900">simo</tspan>
    </text>
  </svg>
);

export default function Landing() {
  return (
    <div className="landing-container">

      {/* Hero Section */}
      <section className="hero-section">
        <div className="logo-wrapper">
          <KiyanLogo />
        </div>

        <h1 className="hero-title">
          Clavisimo – Security, Knowledge, Key to Success
        </h1>
        <p className="hero-subtitle">
          Clavisimo steht für Sicherheit, Wissen und praxisnahe Weiterbildung.
          Zwei Bereiche bilden das Fundament: praxisorientierte IT-Kurse und
          moderne Authentifizierungs-Module für Startups.
        </p>

        <div className="card-grid">
          {/* EDU Teaser */}
          <div className="teaser-card edu-card">
            <h2 className="card-title edu-title">Clavisimo EDU Port</h2>
            <p className="card-text">
              Zugang zu praxisnahen IT-Kursen von Herrn Hossein Safavi-Homami.
              Genauere Planungen zu Terminen und Kosten werden ab Oktober
              veröffentlicht.
            </p>
            <div className="card-link">
              {/* Link angepasst auf edu-more */}
              <a href="#edu-more">More about EDU →</a>
            </div>
          </div>

          {/* AUTH Teaser */}
          <div className="teaser-card auth-card">
            <h2 className="card-title auth-title">Clavisimo AUTH Start</h2>
            <p className="card-text">
              Authentication & Authorization for Startups – sichere Logins,
              Zwei-Faktor-Authentifizierung und Rollenverwaltung leicht
              integriert.
            </p>
            <div className="card-link">
              {/* Link angepasst auf auth-more */}
              <a href="#auth-more">More about AUTH →</a>
            </div>
          </div>
        </div>

        <div className="hero-buttons">
          {/* Registrieren-Button bleibt im Demo-Modus blockiert */}
          <Link to="/demo-info" className="btn btn-orange">
            Registrieren
          </Link>
          <Link to="#videos" className="btn btn-gray">
            Demo Videos
          </Link>
        </div>
      </section>

      {/* EDU Detail Section */}
      <section id="edu" className="detail-section edu-detail">
        <h2 className="detail-title edu-title">Clavisimo EDU Port</h2>
        <p className="detail-text">
          Unter <b>Kurse</b> finden Sie ab November 2025 praxisnahe IT-Seminare von
          Herrn <b>Hossein Safavi-Homami</b>. Die genauen Planungen zu Terminen, Umfang
          und Kosten werden noch veröffentlicht. Der Fokus liegt auf realistischen
          Projektbeispielen und sofort anwendbarem Wissen.
        </p>

        {/* Quick actions */}
        <div className="btn-row">
          <Link to="/courses" className="btn btn-orange">See Courses</Link>
          <a href="#edu-more" className="btn btn-gray">More about EDU</a>
        </div>
      </section>

      {/* EDU – More (dynamic section) */}
      <section id="edu-more" className="detail-section edu-more">
        <div className="info-grid">
          {/* Differentiator */}
          <div className="info-card edu-card">
            <h3 className="info-title">EDU Highlights</h3>
            <ul className="bullet">
              <li><b>Praxis statt Folien:</b> Live-Coding an einem realistischen Mini-Projekt.</li>
              <li><b>Klarer Tech-Stack:</b> Java & Spring Boot mit modernen Patterns.</li>
              <li><b>Transfer in den Job:</b> Aufgaben, die in echten Projekten vorkommen.</li>
              <li><b>Kleine Gruppen:</b> Raum für Fragen, Code-Reviews & individuelle Tipps.</li>
            </ul>
          </div>

          {/* Topics (selection) */}
          <div className="info-card edu-card">
            <h3 className="info-title">Course Topics (Selection)</h3>
            <div className="tags">
              <span>Java Basics → REST</span>
              <span>Spring Boot Layers</span>
              <span>JPA / Hibernate</span>
              <span>Validation</span>
              <span>DTO & Mapping</span>
              <span>JWT Security</span>
              <span>2FA Basics</span>
              <span>Error Handling</span>
              <span>Testing (Unit/API)</span>
            </div>
            <p className="note">
              Hinweis: Dies ist eine Auswahl. Inhalte werden im Kurs gemeinsam priorisiert.
            </p>
          </div>

          {/* Participant input */}
          <div className="info-card edu-card">
            <h3 className="info-title">Participant Input</h3>
            <p>
              Teilnehmende können gewünschte Schwerpunkte (z. B. mehr Zeit für JPA,
              Security oder Testing) vorschlagen. Bitte senden Sie Ihre Wünsche
              <b> spätestens 1 Monat vor Kursbeginn</b> an <b>edu@clavisimo.com</b>.
              Die Vorschläge sind <b>unverbindlich für beide Seiten</b>; wir bemühen
              uns um eine faire Gewichtung im Kurs.
            </p>
          </div>
        </div>
      </section>

      {/* AUTH Detail Section */}
      <section id="auth" className="detail-section auth-detail">
        <h2 className="detail-title auth-title">Clavisimo AUTH Start</h2>
        <p className="detail-text">
          Clavisimo AUTH Start ist eine modulare Lösung für Startups. Authentication &
          Authorization leicht gemacht – inklusive <b>JWT Login</b>, 
          <b> Zwei-Faktor-Authentifizierung</b>, <b>Passwort-Reset</b> und 
          <b> Admin-Dashboard</b> zur Benutzerverwaltung.
        </p>

        {/* Quick actions */}
        <div className="btn-row">
          <Link to="/demo-info" className="btn btn-blue">Learn More</Link>
          <a href="#auth-more" className="btn btn-gray">More about AUTH</a>
        </div>
      </section>

      {/* AUTH – More (dynamic section) */}
      <section id="auth-more" className="detail-section auth-more">
        <div className="info-grid">
          {/* Why startups */}
          <div className="info-card auth-card">
            <h3 className="info-title">Why Startups?</h3>
            <ul className="bullet">
              <li><b>Code-nah & erweiterbar:</b> volle Kontrolle statt „Black-Box“.</li>
              <li><b>Schneller Start:</b> fertige Flows (Login, 2FA, Reset) sofort nutzbar.</li>
              <li><b>Stack-Fit:</b> ideal für Java/Spring-Backends – ohne Vendor-Lock-in.</li>
              <li><b>Didaktik inklusive:</b> klare Beispiele, die Teams verstehen & anpassen.</li>
            </ul>
            <p className="note">
              Vergleich zu Managed Auth (Auth0, Firebase Auth, Cognito): unser Ansatz
              ist <b>selbst hostbar & anpassbar</b>. Dafür fehlen aktuell noch
              einige „Enterprise-Komfortfunktionen“ (z. B. SSO-Provider-Vielfalt) – in
              Planung, priorisiert nach Bedarf.
            </p>
          </div>

          {/* Use cases */}
          <div className="info-card auth-card">
            <h3 className="info-title">Use Cases (Selection)</h3>
            <ul className="bullet">
              <li>User Registration & Account Activation</li>
              <li>Email Verification & Resend Verification</li>
              <li>Login with JWT (Access/Refresh)</li>
              <li>Two-Factor Authentication (2FA)</li>
              <li>Password Reset (via Code/Token)</li>
              <li>Roles & Permissions (User/Admin/Trainer)</li>
              <li>Admin Dashboard for User Management</li>
            </ul>
            <p className="note">Alle Flows sind in der Demo lauffähig; Feinschliff laufend.</p>
          </div>

          {/* Support & Postman */}
          <div className="info-card auth-card">
            <h3 className="info-title">Support & Customization</h3>
            <p>
              Anpassungen, Schulungen oder Teil-Erweiterungen sind <b>verhandelbar</b>.
              Wir machen <b>keine fixen Zusagen</b> zu Terminen oder Umfang, bevor
              Anforderungen gemeinsam geklärt sind. Ziel ist eine pragmatische Lösung,
              die zu Ihrem Projekt passt.
            </p>
            <p className="note">
              Postman-Collections zu den wichtigsten Endpunkten werden bereitgestellt
              (<b>in Planung</b>), um Integrationen schneller zu testen.
            </p>
          </div>
        </div>
      </section>

      {/* Demo Videos Section */}
      <section id="videos" className="videos-section">
        <h2 className="videos-title">Demo Videos</h2>

        <div className="card-grid">
          {/* EDU Videos */}
          <div className="teaser-card edu-card">
            <h3 className="card-title edu-title">EDU Demos</h3>
            <div className="video-placeholder">[ EDU Video Placeholder ]</div>
          </div>

          {/* AUTH Videos */}
          <div className="teaser-card auth-card">
            <h3 className="card-title auth-title">AUTH Demos</h3>
            <div className="video-placeholder">[ AUTH Video Placeholder ]</div>
          </div>
        </div>

        {/* Demo Accounts */}
        <div className="demo-accounts">
          <h3 className="accounts-title">Demo Accounts</h3>
          <ul>
            <li>
              <b>Student:</b> fred.student@example.com / <code>Demo123#</code>
            </li>
            <li>
              <b>Trainer:</b> sebastian.trainer@example.com / <code>Demo123#</code>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
