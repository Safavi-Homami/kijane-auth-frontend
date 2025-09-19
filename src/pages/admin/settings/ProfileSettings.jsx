import React from "react";
import { User, Mail, Palette, Globe } from "lucide-react";
import "./Einstellungen.css";

const ProfilSettings = () => {
  return (
    <div className="settings-container">
      <h2><User size={20} /> Profil-Einstellungen</h2>
      <p>Bearbeite deinen Namen, deine E-Mail oder wechsle zur Dunkelmodus-Ansicht.</p>

      <form className="settings-form">
        <label>
          Vorname:
          <input type="text" placeholder="Vorname" />
        </label>
        <label>
          Nachname:
          <input type="text" placeholder="Nachname" />
        </label>
        <label>
          <Mail size={16} /> E-Mail:
          <input type="email" placeholder="name@example.com" />
        </label>
        <label>
          <Globe size={16} /> Sprache:
          <select>
            <option>Deutsch</option>
            <option>English</option>
          </select>
        </label>
        <label className="toggle-label">
          <Palette size={16} /> Dunkelmodus:
          <input type="checkbox" />
        </label>
        <button type="submit">Speichern</button>
      </form>
    </div>
  );
};

export default ProfilSettings;
