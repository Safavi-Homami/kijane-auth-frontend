// src/context/UserContext.jsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";


import { getToken, setToken, removeToken, login as apiLogin, getCurrentUser,   applyStoredTokenToApi
 } from "../api";

 import { parseJwt } from "../api";

// WICHTIG: named export, damit andere Dateien { UserContext } importieren können
export const UserContext = createContext(null);

// WICHTIG: named export, damit Header.jsx { useUser } importieren kann
export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser muss innerhalb von <UserProvider> verwendet werden.");
  }
  return ctx;
}

function clearAuthSession() {
  // token + 2FA flags sauber entfernen (so wie du es eh willst)
  try {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("requiresTwoFactor");
    sessionStorage.removeItem("pending2fa");
    sessionStorage.removeItem("twofa.new");
  } catch (e) {
    // ignore
  }
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);


  useEffect(() => {
  const handler = () => {
    

    const token = getToken();

    if (!token) {
      console.warn("🚨 NO TOKEN → logout");
      setUser(null);
      return;
    }
    getCurrentUser()
      .then(setUser)
      .catch((err) => {
      const status = err?.response?.status;

      if (status === 401) {
        console.warn("🚨 SESSION EXPIRED");

        removeToken();
        clearAuthSession();
        setUser(null);

        alert("Deine Sitzung ist abgelaufen. Bitte neu einloggen.");
      } else {
        console.warn("⚠️ Backend offline – keeping user session");

        // ❗ WICHTIG: NICHT setUser(null)
      }
    });
  };

  window.addEventListener("auth-changed", handler);

  return () => {
    window.removeEventListener("auth-changed", handler);
  };
}, []);


  // Beim App-Start: wenn Token vorhanden -> /me laden
  useEffect(() => {

    applyStoredTokenToApi();   // ← Session stabilisieren

    let cancelled = false;

    const boot = async () => {
      setIsBootstrapping(true);

      const token = getToken();
      if (!token) {
        if (!cancelled) {
          setUser(null);
          setIsBootstrapping(false);
        }
        return;
      }

      try {
        const me = await getCurrentUser();
        if (!cancelled) setUser(me);
      } catch (err) {
          const status = err?.response?.status;

          console.warn("⚠️ /auth/me failed:", status);

          // 🔒 NUR bei echten Auth-Problemen logout
        if (status === 401) {
          console.warn("🚨 SESSION INVALID → logout");

          alert("Deine Sitzung ist abgelaufen. Bitte erneut einloggen.");

          removeToken();
          clearAuthSession();

          if (!cancelled) {
            setUser(null);
          }

          window.location.href = "/login";
        } else if (status === 403) {
          console.warn("⛔ FORBIDDEN 403 → keine Berechtigung, kein Logout");
        } 
        else {
            // ⚠️ Backend-Fehler (z. B. 500) → NICHT sofort logout
            console.warn("⚠️ Backend error – keeping session");
          }
            } finally {
                    if (!cancelled) setIsBootstrapping(false);
                  }
          };

    boot();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
  const token = getToken();
  if (!token) return;

  const payload = parseJwt(token);
  if (!payload?.exp) return;

  const expirationTime = payload.exp * 1000;
  const now = Date.now();
  const timeout = expirationTime - now;

  

  if (timeout <= 0) {
    logout();
    return;
  }

  const logoutTimer = setTimeout(() => {
    console.warn("🚨 SESSION EXPIRED (Timer)");
    alert("Deine Sitzung ist abgelaufen.");
    logout();
  }, timeout);

  return () => clearTimeout(logoutTimer);

}, [user]); // ✅ WICHTIG: user statt getToken()
  const login = useCallback(async (username, password) => {
    // Erwartet: apiLogin liefert { token } oder token-string (beides abfangen)
    const res = await apiLogin(username, password);
    const token = typeof res === "string" ? res : res?.token;

    if (token) setToken(token);

    // nach Login: /me holen, damit Navigation sofort Rollen korrekt hat
    const me = await getCurrentUser();
    setUser(me);

    return me;
  }, []);

 const logout = useCallback(() => {
  try {
    removeToken();
    clearAuthSession();

    // wichtig: User sofort entfernen
    setUser(null);

    // wichtig: Navigation neu auslösen
    window.dispatchEvent(new Event("auth-changed"));
    window.location.href = "/login";


  } catch (e) {
    console.error("Logout error!");
  }
}, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      isBootstrapping,
      login,
      logout,
    }),
    [user, isBootstrapping, login, logout]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// optional: default export (falls irgendwo "import UserProvider from ..." existiert)
export default UserProvider;
