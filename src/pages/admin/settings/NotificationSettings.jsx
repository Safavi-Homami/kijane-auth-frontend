import React from "react";
import { Bell, MailCheck, AlertTriangle, Megaphone } from "lucide-react";
import "./Einstellungen.css";

const NotificationSettings = () => {
  return (
    <div className="settings-container">
      <h2><Bell size={20} /> Benachrichtigungseinstellungen</h2>
      <p>Steuere, welche E-Mail-Benachrichtigungen du erhalten möchtest.</p>

      <form className="settings-form">
        <label>
          <MailCheck size={16} /> Newsletter:
          <input type="checkbox" />
        </label>
        <label>
          <Megaphone size={16} /> Systemupdates:
          <input type="checkbox" />
        </label>
        <label>
          <AlertTriangle size={16} /> Sicherheitswarnungen:
          <input type="checkbox" />
        </label>
        <button type="submit">Einstellungen speichern</button>
      </form>
    </div>
  );
};

export default NotificationSettings;
