import api from "./api";

const TOKEN_KEY = "token";
const AUTH_EVENT = "auth-changed";

const fireAuthEvent = () => {
  try {
    window.dispatchEvent(new Event(AUTH_EVENT));
  } catch {}
};

export const getToken = () => sessionStorage.getItem(TOKEN_KEY);

export const setToken = (token) => {
  sessionStorage.setItem(TOKEN_KEY, token);
  localStorage.removeItem(TOKEN_KEY);
  fireAuthEvent();
};

export const removeToken = () => {
    console.log("🚨 TOKEN wird REMOVED im tokenutils!!!", new Error().stack);

  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
  fireAuthEvent();
};

export const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiry = payload.exp;
    if (!expiry) return true;
    return Date.now() >= expiry * 1000;
  } catch (e) {
    console.warn("Token konnte nicht geprüft werden.");
    return true;
  }
};

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    sessionStorage.setItem(TOKEN_KEY, token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    sessionStorage.removeItem(TOKEN_KEY);
  }
  fireAuthEvent();
};

export const saveToken = setToken; // Alias
