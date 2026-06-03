import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import CourseList from "./pages/CourseList";

import PrivateRoute from "./components/PrivateRoute";
import Unauthorized from "./pages/Unauthorized";
import "./App.css";

import CourseDetail from "./pages/CourseDetail";
import AddCourseForm from "./pages/AddCourseForm";
import LoginPage from "./pages/LoginPage";
import ConfirmationPage from "./registration/ConfirmationPage";

import TrainerArea from "./pages/admin/TrainerArea";

import LectureResourcesPage from "./pages/trainer/LectureResourcesPage.jsx";
import CourseCurriculumPage from "./pages/trainer/CourseCurriculumPage.jsx";
import CurriculumViewPage from "./pages/trainer/CurriculumViewPage.jsx";

import AuthorList from "./pages/AuthorList";
import CreateAuthorPage from "./pages/trainer/CreateAuthorPage.jsx";

import PasswordResetRequest from "./pages/admin/PasswordResetRequest.jsx";
import PasswordResetConfirm from "./pages/admin/PasswordResetConfirm";
import ChangePassword from "./components/ChangePassword";
import ForgotPassword from "./pages/admin/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";
import SuccessPage from "./pages/SuccessPage";
import ConfirmTwoFaReset from "./pages/ConfirmTwoFaReset";
import Reset2faRequest from "./pages/Reset2faRequest";
import Reset2faVerifyCode from "./pages/Reset2faVerifyCode";
import ConfirmTwoFa from "./pages/ConfirmTwoFa";
import ResetPasswordWithCode from "./pages/ResetPasswordWithCode";
import { useUser } from "./context/useUser";
import ConfirmActivation from "./registration/register/ConfirmActivation";
import MultiStepRegister from "./registration/register/MultiStepRegister";
import Landing from "./pages/Landing";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserList from "./pages/admin/UserList";

import CourseAccessManagement from "./pages/admin/CourseAccessManagement";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SecuritySettings from "./pages/admin/settings/SecuritySettings";
import ProfileSettings from "./pages/admin/settings/ProfileSettings";
import NotificationSettings from "./pages/admin/settings/NotificationSettings";
import Header from "./components/layout/Header";
import DemoInfo from "./pages/DemoInfo";
import "./styles/Trainer.css";
import QuizEditorPage from "./pages/trainer/QuizEditorPage";
import MyCertificatesPage from "./pages/trainer/MyCertificatesPage";
import VerifyCertificate from "./pages/trainer/VerifyCertificate";

import QuizPlayPage from "./pages/quiz/QuizPlayPage";
import HistoryPage from "./pages/trainer/HistoryPage";
import QuizResultPage from "./pages/quiz/QuizResultPage";
import QuizAttemptDetailPage from "./pages/quiz/QuizAttemptDetailPage";
import VerifyCertificatePage from "./pages/quiz/VerifyCertificatePage";

import StudentDashboard from "./pages/StudentDashboard";
import CourseBlueprintImportPage from "./pages/trainer/CourseBlueprintImportPage";

import CoursePlayerPage from "./pages/student/CoursePlayerPage";

import LearningGroupManagement from "./pages/admin/LearningGroupManagement";



// --- 2FA-Reset Guard ------------------------------------
function TwoFAResetGuard({ children }) {
  const { user } = useUser();
  const sessionFlag = sessionStorage.getItem("2faResetAllowed") === "1";

  const allowed =
    (user && (user.twoFaRequired === true || user.twoFaEnabled === true)) ||
    sessionFlag;

  return allowed ? children : <Navigate to="/forgot-password" replace />;
}

function App() {
  const userId = 1; // später dynamisch holen

  return (
    <div>
      <Header />
    {/* <Navigation />  <-- raus oder auskommentieren */}

      <Routes>

        <Route
          path="/course-blueprint-import"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "TRAINER", "MANAGER", "EDITOR"]}>
              <CourseBlueprintImportPage />
            </PrivateRoute>
          }
        />

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
  path="/sections/:sectionId/lectures/:lectureId/resources"
  element={
    <PrivateRoute allowedRoles={["TRAINER", "ADMIN"]}>
      <LectureResourcesPage />
    </PrivateRoute>
  }
/>

         <Route
          path="/courses/:courseId/curriculum" 
          element={
            <PrivateRoute allowedRoles={["TRAINER", "ADMIN"]}>
              <CourseCurriculumPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/courses/:courseId/curriculum-view"
          element={<CurriculumViewPage />}
        />

        <Route
          path="/courses/:courseId/player"
          element={
            <PrivateRoute>
              <CoursePlayerPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/quiz-editor/:quizId"
          element={
            <PrivateRoute>
              <QuizEditorPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/certificates"
          element={
            <PrivateRoute>
              <MyCertificatesPage />
            </PrivateRoute>
          }
        />

        <Route path="/verify/:certificateNumber" element={<VerifyCertificate />} />

        <Route path="/quiz-play/:quizId" element={<QuizPlayPage />} />

        <Route path="/quiz/:quizId/start" element={<QuizPlayPage />} />

        <Route path="/verify" element={<VerifyCertificatePage />} />
        <Route path="/verify/:certificateNumber" element={<VerifyCertificatePage />} />

        <Route
          path="/quiz/:quizId/result"
          element={
            <PrivateRoute>
              <QuizResultPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/history"
          element={
            <PrivateRoute>
              <HistoryPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/attempts/:attemptId/details"
          element={<QuizAttemptDetailPage />}
        />
        
        <Route
          path="/trainer"
          element={
            <PrivateRoute allowedRoles={["TRAINER", "ADMIN"]}>
              <TrainerArea />
            </PrivateRoute>
          }
        />

        <Route
          path="/trainer/authors"
          element={
            <PrivateRoute allowedRoles={["TRAINER", "ADMIN"]}>
              <AuthorList />
            </PrivateRoute>
          }
        />

        <Route
          path="/trainer/authors/new"
          element={
            <PrivateRoute allowedRoles={["TRAINER", "ADMIN"]}>
              <CreateAuthorPage />
            </PrivateRoute>
          }
        />


        <Route path="/dashboard" element={<StudentDashboard />} />

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

        <Route path="/reset-password" element={<Navigate to="/reset-password-code" replace />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password-code" element={<ResetPasswordWithCode />} />

        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/success" element={<SuccessPage />} />

        <Route path="/register" element={<MultiStepRegister />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
        <Route path="/register/activate" element={<ConfirmActivation />} />
        <Route path="/register/success" element={<SuccessPage />} />

        <Route
          path="/confirm-2fa-reset"
          element={
            <TwoFAResetGuard>
              <ConfirmTwoFaReset />
            </TwoFAResetGuard>
          }
        />

        <Route
          path="/reset-2fa"
          element={
            <TwoFAResetGuard>
              <Reset2faRequest />
            </TwoFAResetGuard>
          }
        />

        <Route
          path="/reset-2fa/verify"
          element={
            <TwoFAResetGuard>
              <Reset2faVerifyCode />
            </TwoFAResetGuard>
          }
        />

        <Route path="/confirm-2fa" element={<ConfirmTwoFa />} />

       <Route
          path="/admin/*"
          element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserList />} />
          <Route path="course-access" element={<CourseAccessManagement />} />
          <Route path="groups" element={<LearningGroupManagement />} />
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

        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;
