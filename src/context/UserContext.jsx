
import React, { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser } from "../api";
import { getToken, removeToken, isTokenExpired } from "../tokenUtils";
import PropTypes from "prop-types";


// ✅ Context explizit exportieren
export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [twoFaRequired, setTwoFaRequired] = useState(false);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      console.warn("⛔ Kein Token vorhanden.");
      setUser(null);
      setLoading(false);
      return;
    }

    if (isTokenExpired(token)) {
      console.warn("⚠️ Token ist abgelaufen. Lösche ...");
      removeToken();
      setUser(null);
      setLoading(false);
      return;
    }

    async function fetchUser() {
      console.log("⏳ UserContext: Hole aktuellen Benutzer ...");
      try {
        const currentUser = await getCurrentUser();
        console.log("✅ UserContext: Benutzer erfolgreich geladen:", currentUser);
        setUser(currentUser);

        if (currentUser?.twoFaRequired) {
          console.log("🔐 2FA erforderlich, Weiterleitung folgt.");
          setTwoFaRequired(true);
        } else {
          setTwoFaRequired(false);
        }
      } catch (error) {
        console.warn("⚠️ Fehler beim Laden des Benutzers:", error);
        removeToken();
        setUser(null);
        setTwoFaRequired(false);
      } finally {
        setLoading(false);
        console.log("🔚 UserContext: Ladevorgang abgeschlossen.");
      }
    }

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading, twoFaRequired }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
