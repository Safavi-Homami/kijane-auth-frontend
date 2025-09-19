import api from "./api"; // ✅ korrekt und sicher


const TOKEN_KEY = "token";

export const getToken = () => {
  return sessionStorage.getItem(TOKEN_KEY);
};

export const setToken = (token) => {
  sessionStorage.setItem(TOKEN_KEY, token);
  localStorage.removeItem(TOKEN_KEY); // Bereinigt alte Konflikte
};

export const removeToken = () => {
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY); // Sicher ist sicher
};

export const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp;
    if (!expiry) return true;
    return Date.now() >= expiry * 1000;
  } catch (e) {
    console.warn("⚠️ Token konnte nicht geparst werden:", e);
    return true;
  }
};

export function storeToken(token) {
  sessionStorage.setItem("token", token);
}

// ✅ NEU
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    sessionStorage.setItem("token", token); // ✨ automatisch speichern
  } else {
    delete api.defaults.headers.common["Authorization"];
    sessionStorage.removeItem("token");
  }
};


export const saveToken = setToken; // Alias für Kompatibilität

