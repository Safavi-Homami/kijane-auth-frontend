import React, { useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
                      import CourseList from "./pages/CourseList";
import CourseDetail from "./pages/CourseDetail";
import AddCourseForm from "./pages/AddCourseForm";
                      import LoginPage from "./pages/LoginPage";
                      import ConfirmationPage from "./registration/ConfirmationPage";
import PrivateRoute from "./components/PrivateRoute";
import Navigation from "./components/Navigation";
import Unauthorized from "./pages/Unauthorized";
import "./App.css";
import { isTokenExpired } from "./utils/jwtUtils";
import TrainerArea from "./pages/admin/TrainerArea";
import PasswordResetRequest from "./pages/admin/PasswordResetRequest.jsx";
import PasswordResetConfirm from "./pages/admin/PasswordResetConfirm";
import ChangePassword from "./components/ChangePassword";
import ForgotPassword from "./pages/admin/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";
import SuccessPage from "./pages/SuccessPage";
import api from "@api";
import ConfirmTwoFaReset from "./pages/ConfirmTwoFaReset";
import Reset2faRequest from "./pages/Reset2faRequest";
import Reset2faVerifyCode from "./pages/Reset2faVerifyCode";
import ConfirmTwoFa from "./pages/ConfirmTwoFa";
import ResetPasswordWithCode from "./pages/ResetPasswordWithCode";
import { useUser } from "./context/useUser";
                  import ConfirmActivation from "./registration/register/ConfirmActivation";
                  import MultiStepRegister from "./registration/register/MultiStepRegister";
                  import Landing from "./pages/Landing";

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserList from "./pages/admin/UserList";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SecuritySettings from "./pages/admin/settings/SecuritySettings";
import ProfileSettings from "./pages/admin/settings/ProfileSettings";
import NotificationSettings from "./pages/admin/settings/NotificationSettings";
import Header from "./components/layout/Header";
import DemoInfo from "./pages/DemoInfo";





// --- 2FA-Reset Guard ------------------------------------
function TwoFAResetGuard({ children }) {
  // Falls user bekannt ist: nur erlauben, wenn 2FA aktiv ist
  // Zusätzlich: Session-Flag, das wir beim Einstieg in den Reset-Flow setzen
  const { user } = useUser();
  const sessionFlag = sessionStorage.getItem("2faResetAllowed") === "1";

  const allowed =
    (user && (user.twoFaRequired === true || user.twoFaEnabled === true)) ||
    sessionFlag;

  return allowed ? children : <Navigate to="/forgot-password" replace />;
}

const translations = {
  de: {
    noUsers: "Keine Benutzer gefunden.",
    roleUpdated: "Rollen erfolgreich aktualisiert",
  },
  en: {
    noUsers: "No users found.",
    roleUpdated: "Roles updated successfully",
  },
};

function App() {
  const userId = 1; //später dynamisch holen
  const navigate = useNavigate();   // <-- hinzufügen

  return (
    <div>
      <Header />
        <Navigation />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Landing />} />
            <Route path="/demo-info" element={<DemoInfo />} />
            <Route path="/home" element={<Landing />} />
            <Route path="/courses" element={<CourseList />} />

            <Route path="/courses/:id" element={<CourseDetail />} />

            <Route
              path="/add-course"
              element={
                <PrivateRoute allowedRoles={["ADMIN", "MANAGER", "EDITOR"]}>
                  <AddCourseForm />
                </PrivateRoute>
              }
            />  
            <Route
              path="/trainer"
              element={
                <PrivateRoute allowedRoles={["TRAINER"]}>
                  <TrainerArea />
                </PrivateRoute>
              }
            />

          
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/admin/reset-request" element={<PasswordResetRequest />} />
            <Route path="/admin/reset-confirm" element={<PasswordResetConfirm />} />

            <Route
              path="/change-password"
              element={
                <PrivateRoute>
                  <ChangePassword userId={userId} />
                </PrivateRoute>
              }
            />

            <Route
              path="/reset-password"
              element={<Navigate to="/reset-password-code" replace />}
            />

            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password-code" element={<ResetPasswordWithCode />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/success" element={<SuccessPage />} />

            <Route path="/register" element={<MultiStepRegister />} />
            <Route path="/confirmation" element={<ConfirmationPage />} />        
            <Route path="/register/activate" element={<ConfirmActivation />} />
            <Route path="/register/success" element={<SuccessPage />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
              
              
            <Route path="/confirm-2fa-reset"
              element={
                <TwoFAResetGuard>
                  <ConfirmTwoFaReset />
                </TwoFAResetGuard>
              }
            />

            <Route path="/reset-2fa"
              element={
                <TwoFAResetGuard>
                  <Reset2faRequest />
                </TwoFAResetGuard>
              }
            />

            <Route path="/reset-2fa/verify"
              element={
                <TwoFAResetGuard>
                  <Reset2faVerifyCode />
                </TwoFAResetGuard>
              }
            />

            <Route path="/confirm-2fa" element={<ConfirmTwoFa />} />      


            <Route path="/admin/*" element={
                <PrivateRoute roles={['ADMIN']}>
                  <AdminLayout />
                </PrivateRoute>
            }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserList />} />
            <Route path="settings/security" element={<SecuritySettings />} />
            <Route path="settings/profile" element={<ProfileSettings />} />
            <Route path="settings/notifications" element={<NotificationSettings />} />
            </Route>


            <Route
                path="/admin"
                element={
                  <PrivateRoute allowedRoles={["ADMIN"]}>
                    <AdminDashboard />
                  </PrivateRoute>
                }
            />


            <Route path="/admin-dashboard" element={<PrivateRoute roles={["ADMIN"]}><AdminDashboard /></PrivateRoute>} />
            <Route path="*" element={<div>404 ❌ Seite nicht gefunden</div>} />  
              
          </Routes>
           
     <ToastContainer position="top-right" autoClose={3000} /> {/* HIER */}

    </div>
  );
}

// Wrapper zur Token-Gültigkeitsprüfung bei App-Start
function AppWrapper() {
  const { setUser } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token || isTokenExpired(token)) {
      console.warn("Token ist abgelaufen oder ungültig. Wird gelöscht.");
      sessionStorage.removeItem("token");
      setUser(null);
      return;
    }

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    api
      .get("/auth/me")
      .then((response) => {
        const user = {
  username: response.data.username,
  roles: response.data.roles,
  // Was auch immer dein Backend liefert – wir fangen mehrere Varianten ab:
  twoFaEnabled:
    Boolean(
      response.data.twoFaEnabled ??
      response.data.twoFActorEnabled ??   // du hattest das in der Konsole
      response.data.two_factor_enabled
    ),
  twoFaRequired: Boolean(response.data.twoFaRequired || false),
  email: response.data.email ?? null,
};
        setUser(user);

        if (user.twoFaRequired) {
          console.log("2FA erforderlich, Weiterleitung zur /confirm-2fa");
          navigate("/confirm-2fa");
        }
      })
      .catch((error) => {
        console.error("Fehler bei getCurrentUser:", error);
        sessionStorage.removeItem("token");
        setUser(null);
      });
  }, [setUser, navigate]);

  return <App />;
}

export default AppWrapper;

// <Route path="/admin" element={<AdminDashboard />} />
  //        <Route path="/admin/users" element={<UserList />} />
