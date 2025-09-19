/// src/api.js
import axios from "axios";

// ---- Axios-Instanz ---------------------------------------------------------
//const baseURL = "http://localhost:8080/api";
const baseURL = "https://kijane-auth-backend-production.up.railway.app/api";


const api = axios.create({
  baseURL,
});

export const adminSecureApi = axios.create({
  baseURL: `${baseURL}/admin/v1/users`,
});

adminSecureApi.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// Token anhängen – nur wenn vorhanden:

// ---- Öffentliche Endpoints (ohne Token) ------------------------------------
const excludedPaths = [
  "/auth/login",
  "/auth/register",
  "/auth/register/send-code", //von regist-app
  "/auth/confirm",            //von regist -app
  "/auth/forgot-password",
  "/reset/reset-password/code",
  "/auth/confirm-reset",
  "/auth/verify-email",
  "/auth/request-2fa-reset",
  "/auth/confirm-2fa-reset",
  "/public",
];

// ---- Token-Helpers (SessionStorage) ----------------------------------------
export const setToken = (token) => {
  try {
    sessionStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } catch {}
};

export const getToken = () => {
  try {
    return sessionStorage.getItem("token");
  } catch {
    return null;
  }
};

export const removeToken = () => {
  try {
    sessionStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  } catch {}
};

// ---- Interceptors ----------------------------------------------------------
// 🔒 Authentifizierte Anfragen → fügt Token automatisch hinzu
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


api.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      const status = error.response?.status;
      const url = new URL(error.config?.url || "", error.config?.baseURL || "").pathname;
      const isExcluded = excludedPaths.some((p) => url.startsWith(p));

      if ((status === 401 || status === 403) && !isExcluded) {
        removeToken();
      }
    } catch {}
    return Promise.reject(error);
  }
);

// Token anhängen – nur wenn vorhanden:

// ---- Benannte API-Methoden -------------------------------------------------
export const login = (credentials) => api.post("/auth/login", credentials);
export const getCurrentUser = () => api.get("/auth/me").then((r) => r.data);
export const forgotPassword = (email) =>
  api.post("/auth/forgot-password", { email });


// 🚫 Für Anfragen OHNE Token (z.B. reset-password mit Code)
const apiPublic = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json', // ✅ FIX
  }
});


// Optionaler Interceptor für apiPublic (z.B. Logging)
apiPublic.interceptors.request.use((config) => {
  console.log("📤 [apiPublic] Request:", config);
  return config;
});

apiPublic.interceptors.request.use((config) => {
  console.log("📤 [apiPublic] Sende Anfrage an:", config.url);
  console.log("Header:", config.headers);
  return config;
});


export const resetPasswordWithCode = (email, code, newPassword) =>
  apiPublic.post(
    "/reset/reset-password/code",
    { email, code, newPassword },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  // --- Registration (aus registration-app) ------------------------------------
export const registerUser = (data) =>
  apiPublic.post("/auth/register", data);

export const sendActivationCode = (email) =>
  apiPublic.post(`/auth/register/send-code?username=${encodeURIComponent(email)}`);
  //(`/auth/register/send-code?username=${email}`); -> von register app 


export const confirmActivation = (data) =>
  apiPublic.post("/auth/confirm", data);



export const request2FAReset = (email) =>
  api.post("/auth/request-2fa-reset", { email });

export const confirm2FAReset = (email, code) =>
  api.post("/auth/confirm-2fa-reset", { email, code });

// ---- Default-Export der Instanz --------------------------------------------
export default api;

export { apiPublic };


export const adminApi = {
  listUsers: async ({ q = "", role = "" }) => {
    const res = await api.get(`/admin/v1/users`, {
      params: { q, role },
    });
    return res.data;
  },

    updateRoles: async (userId, roles) => {
    return api.put(`/admin/v1/users/${userId}/roles`, {
      userId,
      roles,
    });
  },

  toggleTwoFA: async (userId, action) => {
    return api.post(`/admin/v1/users/${userId}/2fa`, { action });
  },

  toggleUserStatus: async (userId) => {
    return api.post(`/admin/v1/users/${userId}/toggle-status`);
  },
};
