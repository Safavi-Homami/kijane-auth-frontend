import React from "react";
import { Lock, ShieldCheck, Smartphone } from "lucide-react";
import "./Einstellungen.css";

const SecuritySettings = () => {
  return (
    <div className="settings-container">
      <h2><ShieldCheck size={20} /> Sicherheitseinstellungen</h2>
      <p>Verwalte dein Passwort und die Zwei-Faktor-Authentifizierung.</p>

      <div className="settings-group">
        <h4><Lock size={16} /> Passwort ändern</h4>
        <button>Passwort ändern</button>
      </div>

      <div className="settings-group">
        <h4><Smartphone size={16} /> Zwei-Faktor-Authentifizierung</h4>
        <label className="toggle-label">
          2FA aktivieren:
          <input type="checkbox" />
        </label>
      </div>
    </div>
  );
};

export default SecuritySettings;
