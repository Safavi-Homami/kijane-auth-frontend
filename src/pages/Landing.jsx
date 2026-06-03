import { useEffect } from "react";
import { Link } from "react-router-dom";
import "./Landing.css";

const DEMO_ACCOUNTS = [
  {
    role: "Trainer-Demo",
    email: "sebastian.trainer@example.com",
    password: "Demo123#",
    description: "Traineransicht, Kursverwaltung, Ressourcen, Quiz und Blueprint-Import testen.",
  },
  {
    role: "Student-Demo",
    email: "fred.student@example.com",
    password: "Demo123#",
    description: "Lernansicht, Kursfortschritt, Quiz und Zertifikatsbereich kennenlernen.",
  },
];

const VIDEO_ITEMS = [
  {
    title: "Clavisimo AUTH Demo",
    type: "video",
    src: "/videos/clavisimo-auth-demo.webm",
    accent: "auth",
    text: "Vorhandenes Demo-Video für Login-, Rollen- und Authentifizierungsfunktionen.",
  },
  {
    title: "Trainer-Workflow",
    type: "placeholder",
    accent: "edu",
    text: "Platzhalter für ein kurzes Video: Kurs erstellen, Inhalte strukturieren, Quiz anlegen.",
  },
  {
    title: "Student-Workflow",
    type: "placeholder",
    accent: "edu",
    text: "Platzhalter für ein kurzes Video: Kurs öffnen, lernen, Fortschritt sehen.",
  },
  {
    title: "Blueprint-/KI-Import",
    type: "placeholder",
    accent: "beta",
    text: "Platzhalter für ein kurzes Video: Prompt erstellen, JSON prüfen, Kurs importieren.",
  },
];

const ClavisimoLogo = () => (
  <svg
    className="clv-logo"
    viewBox="0 0 680 190"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Clavisimo Logo"
  >
    <defs>
      <linearGradient id="clvCircleGradient" x1="24" y1="26" x2="144" y2="154">
        <stop stopColor="#ffb15a" />
        <stop offset="0.48" stopColor="#fb923c" />
        <stop offset="1" stopColor="#f97316" />
      </linearGradient>
      <linearGradient id="clvKeyGradient" x1="162" y1="42" x2="560" y2="72">
        <stop stopColor="#ffffff" />
        <stop offset="1" stopColor="#cbd5e1" />
      </linearGradient>
      <filter id="clvSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#f97316" floodOpacity="0.24" />
      </filter>
    </defs>

    {/* Markenanker: C im Schlüsselkopf */}
    <circle cx="86" cy="96" r="58" fill="url(#clvCircleGradient)" filter="url(#clvSoftGlow)" />
    <circle cx="86" cy="96" r="68" stroke="rgba(249,115,22,0.28)" strokeWidth="10" />
    <circle cx="86" cy="96" r="50" stroke="rgba(15,23,42,0.45)" strokeWidth="3" />

    <text
      x="86"
      y="122"
      textAnchor="middle"
      fontFamily="Georgia, serif"
      fontWeight="bold"
      fontSize="82"
      fill="#111827"
    >
      C
    </text>

    {/* Eleganter Schlüssel über lavisimo */}
    <g
      stroke="url(#clvKeyGradient)"
      strokeWidth="7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="178" cy="52" r="19" fill="none" />
      <line x1="197" y1="52" x2="566" y2="52" />
    </g>

    {/* Exakt: C + lavisimo, kein zweites c */}
    <text
      x="145"
      y="125"
      fontFamily="Georgia, serif"
      fontWeight="bold"
      fontSize="78"
    >
      <tspan fill="#f8fafc">lavi</tspan>
      <tspan fill="#fb923c">simo</tspan>
    </text>

    <text
      x="150"
      y="156"
      fontFamily="Arial, Helvetica, sans-serif"
      fontSize="15"
      fontWeight="700"
      fill="#cbd5e1"
      letterSpacing="0.8"
    >
      Sicherheit · Wissen · Schlüssel zum Erfolg
    </text>
  </svg>
);

export default function Landing() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo({
        top: 90,
        left: 0,
        behavior: "auto",
      });
    }, 80);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="clv-landing">
      <section className="clv-hero" id="top">
        <div className="clv-hero-bg" aria-hidden="true" />

        <div className="clv-shell clv-hero-grid">
          <div className="clv-hero-content">
            <div className="clv-logo-wrap">
              <ClavisimoLogo />
            </div>

            <div className="clv-kicker">Beta / Testphase · betreute Intranet-Lösung</div>

            <h1>
              Clavisimo als Demo testen. Produktiv als eigene Intranet-Lösung
              betreiben.
            </h1>

            <p className="clv-lead">
              Clavisimo verbindet Lernplattform, Kursverwaltung, Quiz,
              Zertifikate, Blueprint-/KI-Kursimport und Authentifizierungs-Module.
              Die öffentliche Demo dient nur zum Kennenlernen. Für echte Nutzung
              wird eine separate betreute Intranet-Installation eingerichtet.
            </p>

            <div className="clv-hero-actions">
              <a href="#demo" className="clv-btn clv-btn-primary">
                Demo-Zugang ansehen
              </a>
              <Link to="/login" className="clv-btn clv-btn-secondary">
                Zur Demo-Anmeldung
              </Link>
              <a href="mailto:info@clavisimo.com" className="clv-btn clv-btn-ghost">
                Anfrage per E-Mail
              </a>
            </div>

            <div className="clv-safe-note">
              Keine offene Registrierung. Keine öffentlichen User-Kurse. Keine
              produktiven Kundendaten in der Demo.
            </div>
          </div>

          <aside className="clv-hero-card">
            <div className="clv-status-pill">Aktueller Status</div>
            <h2>Öffentliche Demo & individuelle Intranet-Version</h2>
            <p>
              Die Demo zeigt den aktuellen Entwicklungsstand. Termine, Preise und
              produktive Nutzung werden erst nach individueller Absprache festgelegt.
            </p>
            <ul>
              <li>Demo ohne Registrierung</li>
              <li>feste Trainer-/Student-Accounts</li>
              <li>eigene Sandbox nur für ernsthafte Interessenten</li>
              <li>Setup, Support und Customizing auf Anfrage</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="clv-section clv-section-light" id="demo">
        <div className="clv-shell">
          <div className="clv-section-heading">
            <span className="clv-kicker">Demo ohne Registrierung</span>
            <h2>Clavisimo kennenlernen, ohne echte Daten einzugeben</h2>
            <p>
              Die Demo-Accounts sind fest vorbereitet. Bitte keine echten
              personenbezogenen Daten, Kundendaten oder produktiven Kursinhalte in
              der Demo speichern.
            </p>
          </div>

          <div className="clv-demo-grid">
            {DEMO_ACCOUNTS.map((account) => (
              <article key={account.email} className="clv-demo-card">
                <h3>{account.role}</h3>
                <p>{account.description}</p>

                <div className="clv-credential">
                  <span>E-Mail</span>
                  <code>{account.email}</code>
                </div>

                <div className="clv-credential">
                  <span>Passwort</span>
                  <code>{account.password}</code>
                </div>
              </article>
            ))}
          </div>

          <div className="clv-demo-actions">
            <Link to="/login" className="clv-btn clv-btn-primary">
              Demo-Anmeldung öffnen
            </Link>
            <Link to="/courses" className="clv-btn clv-btn-secondary">
              Kursbereich ansehen
            </Link>
          </div>

          <div className="clv-warning-box">
            <strong>Demo-Hinweis:</strong> Die öffentliche Demo ist keine
            produktive Plattform. Inhalte können zurückgesetzt werden. Für Institute,
            Trainer oder Unternehmen wird bei Interesse eine getrennte Intranet- oder
            Sandbox-Instanz vorbereitet.
          </div>
        </div>
      </section>

      <section className="clv-section clv-section-dark" id="products">
        <div className="clv-shell">
          <div className="clv-section-heading clv-section-heading-invert">
            <span className="clv-kicker">Module & Produkte</span>
            <h2>Aktuelle Clavisimo-Bausteine</h2>
            <p>
              Die folgenden Bereiche sind als Produktbausteine gedacht. Es gibt
              derzeit noch keinen fixen Termin für eine echte produktive Version.
            </p>
          </div>

          <div className="clv-product-grid">
            <article className="clv-product-card clv-product-edu">
              <div className="clv-card-icon">🎓</div>
              <h3>Clavisimo EDU Port</h3>
              <p>
                Lernplattform für Kurse, Kapitel, Lectures, Ressourcen, Quizze,
                Fortschritt und Zertifikate.
              </p>
              <ul>
                <li>Trainer- und Student-Ansicht</li>
                <li>Kursstruktur mit Ressourcen</li>
                <li>Quiz- und Zertifikatsfluss</li>
              </ul>
              <a href="#edu-more">Mehr zu EDU →</a>
            </article>

            <article className="clv-product-card clv-product-auth">
              <div className="clv-card-icon">🔐</div>
              <h3>Clavisimo AUTH Start</h3>
              <p>
                Authentifizierungsmodul für Java/Spring-Projekte mit Login,
                Rollenverwaltung, 2FA und Passwort-Reset.
              </p>
              <ul>
                <li>JWT Login</li>
                <li>2FA-Grundstruktur</li>
                <li>Admin- und Rollenverwaltung</li>
              </ul>
              <a href="#auth-more">Mehr zu AUTH →</a>
            </article>

            <article className="clv-product-card clv-product-beta">
              <div className="clv-card-icon">🧠</div>
              <h3>Blueprint-/KI-Kursimport</h3>
              <p>
                Kursentwürfe können über strukturierte JSON-Blueprints vorbereitet,
                geprüft und importiert werden.
              </p>
              <ul>
                <li>Prompt-Erstellung</li>
                <li>JSON-Vorschau und Validierung</li>
                <li>Import als Trainer-Werkzeug</li>
              </ul>
              <Link to="/course-blueprint-import">Zum Blueprint-Import →</Link>
            </article>

            <article className="clv-product-card clv-product-intranet">
              <div className="clv-card-icon">🏢</div>
              <h3>Clavisimo Intranet</h3>
              <p>
                Betreute Installation für Trainer, Institute oder kleine Unternehmen
                mit eigener Umgebung.
              </p>
              <ul>
                <li>eigene Datenbank</li>
                <li>Branding und Rollen</li>
                <li>Setup, Support und Customizing</li>
              </ul>
              <a href="mailto:info@clavisimo.com">Intranet anfragen →</a>
            </article>
          </div>
        </div>
      </section>

      <section className="clv-section clv-section-light" id="edu-more">
        <div className="clv-shell">
          <div className="clv-section-heading">
            <span className="clv-kicker">EDU Port</span>
            <h2>Für praxisnahe IT-Kurse und interne Schulungen</h2>
            <p>
              Der Fokus liegt auf backendnahen Lerninhalten, realistischen
              Projektbeispielen und kontrollierten Lernpfaden.
            </p>
          </div>

          <div className="clv-info-grid">
            <article className="clv-info-card">
              <h3>EDU Highlights</h3>
              <ul>
                <li>Praxis statt reine Folien</li>
                <li>Java, Spring Boot, Security und Datenbankthemen</li>
                <li>Kursstruktur mit Kapiteln, Lectures und Ressourcen</li>
                <li>Quizze, Kursfortschritt und Zertifikate</li>
              </ul>
            </article>

            <article className="clv-info-card">
              <h3>Mögliche Kursbereiche</h3>
              <div className="clv-tags">
                <span>Java Basics</span>
                <span>Spring Boot</span>
                <span>JPA / Hibernate</span>
                <span>JWT Security</span>
                <span>2FA</span>
                <span>SQL</span>
                <span>Blueprint-Import</span>
                <span>Zertifikate</span>
              </div>
            </article>

            <article className="clv-info-card">
              <h3>Für wen?</h3>
              <p>
                Trainer, kleine Institute, interne Schulungsteams, Bootcamps und
                Unternehmen, die eine kontrollierte Lernplattform ohne offene
                öffentliche Plattform benötigen.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="clv-section clv-section-soft-blue" id="auth-more">
        <div className="clv-shell">
          <div className="clv-section-heading">
            <span className="clv-kicker">AUTH Start</span>
            <h2>Auth-System als anpassbarer Baustein</h2>
            <p>
              Clavisimo AUTH Start ist als modulare Grundlage für Login,
              Rollenverwaltung und Sicherheitsflüsse gedacht.
            </p>
          </div>

          <div className="clv-info-grid">
            <article className="clv-info-card">
              <h3>Use Cases</h3>
              <ul>
                <li>Login mit JWT</li>
                <li>Registrierung und E-Mail-Verifizierung</li>
                <li>Passwort vergessen / Passwort ändern</li>
                <li>2FA-Grundfluss</li>
                <li>Admin-Dashboard für Userverwaltung</li>
              </ul>
            </article>

            <article className="clv-info-card">
              <h3>Warum interessant?</h3>
              <p>
                Für Projekte, die keinen vollständigen externen Auth-Dienst nutzen
                wollen und stattdessen eine verständliche, anpassbare Spring/React-
                Grundlage benötigen.
              </p>
            </article>

            <article className="clv-info-card">
              <h3>Hinweis</h3>
              <p>
                AUTH Start ist aktuell ein Entwicklungs- und Demonstrationsbereich.
                Produktive Nutzung nur nach technischer Prüfung, Absprache und
                sicherer Konfiguration.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="clv-section clv-section-video" id="videos">
        <div className="clv-shell">
          <div className="clv-section-heading">
            <span className="clv-kicker">Demo-Videos</span>
            <h2>Platz für vorhandene und neue Demo-Videos</h2>
            <p>
              Hier können bestehende Videos weiterverwendet und neue Kurzvideos
              für Trainer-, Student- und Blueprint-Workflows ergänzt werden.
            </p>
          </div>

          <div className="clv-video-grid">
            {VIDEO_ITEMS.map((video) => (
              <article
                key={video.title}
                className={`clv-video-card clv-video-${video.accent}`}
              >
                <h3>{video.title}</h3>

                {video.type === "video" ? (
                  <video controls className="clv-video">
                    <source src={video.src} type="video/webm" />
                    Ihr Browser unterstützt dieses Videoformat nicht.
                  </video>
                ) : (
                  <div className="clv-video-placeholder">
                    <span>Video-Platzhalter</span>
                  </div>
                )}

                <p>{video.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="clv-section clv-section-dark" id="intranet">
        <div className="clv-shell clv-intranet-grid">
          <div>
            <span className="clv-kicker">Angebot</span>
            <h2>Betreute Intranet-Lösung statt offene Plattform</h2>
            <p>
              Für produktive Nutzung wird Clavisimo nicht als offene öffentliche
              Plattform angeboten, sondern als getrennte Intranet- oder Sandbox-
              Umgebung mit klarer Daten- und Rollenstruktur.
            </p>
          </div>

          <div className="clv-offer-list">
            <div>
              <strong>Setup</strong>
              <span>Installation, Datenbank, Demo-Daten, Rollen und Grundkonfiguration.</span>
            </div>
            <div>
              <strong>Support</strong>
              <span>Technische Betreuung, Fehleranalyse, kleinere Anpassungen.</span>
            </div>
            <div>
              <strong>Customizing</strong>
              <span>Branding, Zertifikate, Dashboards, Rollen, Kursstruktur und Workflows.</span>
            </div>
            <div>
              <strong>Sandbox</strong>
              <span>Eigene Testumgebung für ernsthafte Interessenten nach Absprache.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="clv-section clv-section-contact" id="kontakt">
        <div className="clv-shell">
          <div className="clv-contact-card">
            <span className="clv-kicker">Kontakt ohne Formular</span>
            <h2>Interesse an einer betreuten Clavisimo-Version?</h2>
            <p>
              Für Fragen, Pilotprojekte, Setup, Intranet-Versionen oder individuelle
              Anpassungen ist eine freiwillige Kontaktaufnahme per E-Mail möglich.
              Es gibt auf dieser Landing Page bewusst kein Kontaktformular und keine
              Newsletter-Anmeldung.
            </p>

            <div className="clv-contact-actions">
              <a href="mailto:info@clavisimo.com" className="clv-btn clv-btn-primary">
                info@clavisimo.com
              </a>
              <a href="mailto:edu@clavisimo.com" className="clv-btn clv-btn-secondary">
                edu@clavisimo.com
              </a>
            </div>

            <p className="clv-small-note">
              Bitte senden Sie keine sensiblen Daten per E-Mail. Eine produktive
              Nutzung erfolgt nur nach individueller technischer und organisatorischer
              Abstimmung.
            </p>
          </div>
        </div>
      </section>

      <footer className="clv-footer">
        <div className="clv-shell clv-footer-grid">
          <div>
            <strong>Clavisimo</strong>
            <p>Sicherheit, Wissen, Schlüssel zum Erfolg.</p>
          </div>

          <nav className="clv-footer-links" aria-label="Landing Navigation">
            <a href="#demo">Demo</a>
            <a href="#products">Module</a>
            <a href="#videos">Videos</a>
            <a href="#impressum">Impressum</a>
            <a href="#datenschutz">Datenschutz</a>
          </nav>
        </div>

        <div className="clv-shell clv-legal-grid">
          <section id="impressum" className="clv-legal-card">
            <h3>Impressum</h3>
            <p>
              <strong>Betreiber:</strong> Hossein Safavi-Homami / Clavisimo
            </p>
            <p>
              <strong>E-Mail:</strong>{" "}
              <a href="mailto:info@clavisimo.com">info@clavisimo.com</a>
            </p>
            <p>
              <strong>Hinweis:</strong> Bitte vor Veröffentlichung vollständige
              Anbieterangaben, Anschrift und rechtlich erforderliche Informationen
              ergänzen.
            </p>
          </section>

          <section id="datenschutz" className="clv-legal-card">
            <h3>Datenschutz-Kurzinfo</h3>
            <p>
              Diese Landing Page ist als risikoarme Demo-Seite ohne Registrierung,
              ohne Kontaktformular, ohne Newsletter-Anmeldung und ohne öffentliche
              User-Uploads geplant.
            </p>
            <p>
              Bei freiwilliger Kontaktaufnahme per E-Mail werden die übermittelten
              Angaben nur zur Bearbeitung der Anfrage verwendet. Bitte vor
              Veröffentlichung eine vollständige Datenschutzerklärung ergänzen.
            </p>
          </section>

          <section className="clv-legal-card">
            <h3>Beta-/Demo-Hinweis</h3>
            <p>
              Clavisimo befindet sich in einer Test- bzw. Beta-Phase. Die Demo dient
              der unverbindlichen Vorstellung. Es gibt aktuell keine fixen Termine
              für eine produktive Standardversion.
            </p>
          </section>
        </div>
      </footer>
    </main>
  );
}
