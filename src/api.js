/// src/api.js
import axios from "axios";


// ---- Axios-Instanz ---------------------------------------------------------
const baseURL = "http://localhost:8080/api";
//const baseURL = "https://kijane-auth-backend-production.up.railway.app/api";

const api = axios.create({ baseURL });

export const adminSecureApi = axios.create({
  baseURL: `${baseURL}/admin/v1/users`,
});

adminSecureApi.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---- Öffentliche Endpoints (ohne Token / ohne Auto-Logout) -----------------
const excludedPaths = [
  "/auth/login",
  "/auth/register",
  "/auth/register/send-code",
  "/auth/confirm",
  "/auth/forgot-password",
  "/reset/reset-password/code",
  "/auth/confirm-reset",
  "/auth/verify-email",
  "/auth/request-2fa-reset",
  "/auth/confirm-2fa-reset",

  // ✅ wichtig: /me NICHT als Grund nehmen, den Token zu löschen
  "/auth/me",

  "/public",
  "/authors",
  "/courses",
  "/sections",
  "/lectures",
];

const notifyAuthChanged = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth-changed"));
  }
};

let logoutTriggered = false;

// ---- Token-Helpers (SessionStorage) ----------------------------------------
export const setToken = (token) => {
  try {
    sessionStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    logoutTriggered = false;
    notifyAuthChanged(); 
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
      
        console.trace(); // 🔥 SUPER WICHTIG

    sessionStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  notifyAuthChanged(); 
  } catch {}
};

export const parseJwt = (token) => {
  try {
    const base64Payload = token.split(".")[1];
    const decoded = atob(base64Payload);
    return JSON.parse(decoded);
  } catch (e) {
    return null;
  }
};



// ---- Interceptors ----------------------------------------------------------
// 🔒 Authentifizierte Anfragen → fügt Token automatisch hinzu
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");

  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


api.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      const status = error.response?.status;

      const url = new URL(
        error.config?.url || "",
        error.config?.baseURL || ""
      ).pathname;

      

      const isExcluded =
        url.startsWith("/auth/login") ||
        url.startsWith("/auth/register") ||
        url.startsWith("/auth/forgot-password") ||
        url.startsWith("/auth/confirm") ||
        url.startsWith("/auth/me") ||
        url.startsWith("/reset/reset-password/code") ||
        url.startsWith("/auth/verify-email") ||
        url.startsWith("/auth/request-2fa-reset") ||
        url.startsWith("/auth/confirm-2fa-reset");

      const isPublicEndpoint =
        url.startsWith("/courses") ||
        url.startsWith("/sections") ||
        url.startsWith("/lectures");

      // ✅ 401 = Token fehlt / Token abgelaufen / nicht mehr authentifiziert
      if (status === 401 && !isExcluded && !isPublicEndpoint) {
        console.warn("🚨 AUTH ERROR 401 → removing token");

        if (!logoutTriggered) {
          logoutTriggered = true;
          alert("Deine Sitzung ist abgelaufen...");
          removeToken();
        }
      }

      // ✅ 403 = eingeloggt, aber keine Berechtigung
      // WICHTIG: hier KEIN Token löschen!
      else if (status === 403) {
        console.warn("⛔ FORBIDDEN 403 → keine Berechtigung, kein Logout");
      }

      else {
        console.warn("⚠️ API error ignored (no logout)");
      }
    } catch (e) {
      console.error("Interceptor error!");
    }

    return Promise.reject(error);
  }
);
// ---- Benannte API-Methoden -------------------------------------------------
export const login = (credentials) => api.post("/auth/login", credentials);

// ✅ robuster: Header explizit setzen (hilft gegen Timing/„erst beim 2. Klick“)
export const getCurrentUser = () => {

  const token = sessionStorage.getItem("token");

  

  return api
    .get("/auth/me", token ? { headers: { Authorization: `Bearer ${token}` } } : {})
    .then((r) => r.data);
    
};
//---------------------------------------------------------------------------
// Für sections
export const moveSectionUp = (sectionId) =>
  api.post(`/sections/${sectionId}/move-up`);

export const moveSectionDown = (sectionId) =>
  api.post(`/sections/${sectionId}/move-down`);
//-----------------------------------------------------------------------
// Lectures
export const getLecturesBySectionId = (sectionId) =>
  api.get(`/sections/${sectionId}/lectures`);

export const createLecture = (sectionId, payload) =>
  api.post(`/sections/${sectionId}/lectures`, payload);



// -----------------------------------------------------------------------------
// Authors (Trainer-Bereich)
// -----------------------------------------------------------------------------

/**
 * Eigene Authoren des eingeloggten Trainers
 * GET /api/authors/my
 */
export const getMyAuthors = () =>
  api.get("/authors/my").then((res) => res.data);

/**
 * Neuen Author für aktuellen Trainer anlegen
 * POST /api/authors
 */
export const createAuthor = (data) =>
  api.post("/authors", data).then((res) => res.data);


export const forgotPassword = (email) =>
  api.post("/auth/forgot-password", { email });

// 🚫 Für Anfragen OHNE Token (z.B. reset-password mit Code)
const apiPublic = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

apiPublic.interceptors.request.use((config) => {
  
  return config;
});

export const resetPasswordWithCode = (email, code, newPassword) =>
  apiPublic.post("/reset/reset-password/code", { email, code, newPassword });

export const registerUser = (data) => apiPublic.post("/auth/register", data);

export const sendActivationCode = (email) =>
  apiPublic.post(`/auth/register/send-code?username=${encodeURIComponent(email)}`);

export const confirmActivation = (data) => apiPublic.post("/auth/confirm", data);

export const request2FAReset = (email) =>
  api.post("/auth/request-2fa-reset", { email });

export const confirm2FAReset = (email, code) =>
  api.post("/auth/confirm-2fa-reset", { email, code });

export const createAuthorAndGrantToMe = (data) =>
  api.post("/authors/create-and-grant-to-me", data);

// ✅ ADD: applyStoredTokenToApi (wird von UserContext importiert)
export const applyStoredTokenToApi = () => {
  const token = getToken();
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
  return token;
};


export default api;
export { apiPublic };

export const adminApi = {
  listUsers: async ({ q = "", role = "" }) => {
    const res = await api.get(`/admin/v1/users`, { params: { q, role } });
    return res.data;
  },

  updateRoles: async (userId, roles) => {
    return api.put(`/admin/v1/users/${userId}/roles`, { userId, roles });
  },

  toggleTwoFA: async (userId, action) => {
    return api.post(`/admin/v1/users/${userId}/2fa`, { action });
  },

  toggleUserStatus: async (userId) => {
    return api.post(`/admin/v1/users/${userId}/toggle-status`);
  },
};

export const courseAccessApi = {
  listByCourse: async (courseId) => {
    const res = await api.get(`/admin/course-access/course/${courseId}`);
    return res.data;
  },

  grant: async ({ userId, courseId }) => {
    const res = await api.post("/admin/course-access/grant", {
      userId,
      courseId,
    });
    return res.data;
  },

  revoke: async (accessId) => {
    const res = await api.patch(`/admin/course-access/${accessId}/revoke`);
    return res.data;
  },

  check: async ({ userId, courseId }) => {
    const res = await api.get("/admin/course-access/check", {
      params: { userId, courseId },
    });
    return res.data;
  },
};

export const learningGroupApi = {
  listGroups: async () => {
    const res = await api.get("/admin/groups");
    return res.data;
  },

  createGroup: async ({ name, description }) => {
    const res = await api.post("/admin/groups", { name, description });
    return res.data;
  },

  updateGroup: async (groupId, { name, description }) => {
    const res = await api.put(`/admin/groups/${groupId}`, {
      name,
      description,
    });
    return res.data;
  },

  setGroupActive: async (groupId, active) => {
    const res = await api.patch(`/admin/groups/${groupId}/active`, null, {
      params: { active },
    });
    return res.data;
  },

  listMembers: async (groupId) => {
    const res = await api.get(`/admin/groups/${groupId}/members`);
    return res.data;
  },

  addMember: async (groupId, userId) => {
    const res = await api.post(`/admin/groups/${groupId}/members`, {
      userId,
    });
    return res.data;
  },

  setMemberActive: async (memberId, active) => {
    const res = await api.patch(`/admin/groups/members/${memberId}/active`, null, {
      params: { active },
    });
    return res.data;
  },

  listCourseAccesses: async (groupId) => {
    const res = await api.get(`/admin/groups/${groupId}/course-accesses`);
    return res.data;
  },

  grantCourseToGroup: async (groupId, courseId) => {
    const res = await api.post(`/admin/groups/${groupId}/course-accesses`, {
      courseId,
    });
    return res.data;
  },

  setCourseAccessActive: async (accessId, active) => {
    const res = await api.patch(
      `/admin/groups/course-accesses/${accessId}/active`,
      null,
      {
        params: { active },
      }
    );
    return res.data;
  },
};
