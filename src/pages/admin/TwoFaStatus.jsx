// src/pages/admin/TwoFaStatus.jsx
import { useEffect, useState } from "react";
import api from "../../api";

const getToken = () =>
  sessionStorage.getItem("token") ||
  sessionStorage.getItem("authToken") ||
  localStorage.getItem("token") ||
  localStorage.getItem("authToken");

const TwoFaStatus = ({ user, onUpdated, onNotify }) => {
  // 'active' | 'inactive' | 'reset'
  const [choice, setChoice] = useState(
    user.twoFactorEnabled ? "active" : "inactive"
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setChoice(user.twoFactorEnabled ? "active" : "inactive");
  }, [user.twoFactorEnabled]);

  const save = async () => {
    const actionMap = { active: "ENABLE", inactive: "DISABLE", reset: "RESET" };
    const action = actionMap[choice];
    if (!action) return;

    const token = getToken();

    try {
      setSaving(true);
      await api.post(
        `/admin/v1/users/${user.id}/2fa`,
        { action }, // <-- DTO gem. Backend
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      );
      onUpdated?.();
      onNotify?.(
        "success",
        choice === "active"
          ? "2FA aktiviert."
          : choice === "inactive"
          ? "2FA deaktiviert."
          : "2FA zurückgesetzt."
      );
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (err?.response?.status === 401
          ? "Sitzung abgelaufen. Bitte neu einloggen."
          : "2FA-Änderung fehlgeschlagen.");
      onNotify?.("error", msg);
      console.error("2FA-Update fehlgeschlagen:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="twofa-radio-wrap">
      <div className="twofa-line">
        <label className="rb">
          <input
            type="radio"
            name={`twofa-${user.id}`}
            value="active"
            checked={choice === "active"}
            onChange={() => setChoice("active")}
          />
          <span>Aktiv</span>
        </label>

        <label className="rb">
          <input
            type="radio"
            name={`twofa-${user.id}`}
            value="inactive"
            checked={choice === "inactive"}
            onChange={() => setChoice("inactive")}
          />
          <span>Nicht aktiv</span>
        </label>

        <label className="rb">
          <input
            type="radio"
            name={`twofa-${user.id}`}
            value="reset"
            checked={choice === "reset"}
            onChange={() => setChoice("reset")}
          />
          <span>Reset</span>
        </label>
      </div>

      <button className="btn btn-primary" onClick={save} disabled={saving}>
        {saving ? "Speichere…" : "Speichern"}
      </button>
    </div>
  );
};

export default TwoFaStatus;
