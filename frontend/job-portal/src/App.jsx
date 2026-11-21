import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Toaster } from "react-hot-toast";

const LandingPage = lazy(() => import("./pages/LandingPage/LandingPage"));
const SignUp = lazy(() => import("./pages/Auth/SignUp"));
const Login = lazy(() => import("./pages/Auth/Login"));
const JobSeekerDashboard = lazy(() => import("./pages/JobSeeker/JobSeekerDashboard"));
const JobDetails = lazy(() => import("./pages/JobSeeker/JobDetails"));
const SavedJobs = lazy(() => import("./pages/JobSeeker/SavedJobs"));
const JobMatchesPage = lazy(() => import("./pages/JobSeeker/JobMatchesPage"));
const ResumeBuilderPage = lazy(() => import("./pages/JobSeeker/ResumeBuilderPage"));
const MessagesPage = lazy(() => import("./pages/MessagesPage"));
const SkillBadgesPage = lazy(() => import("./pages/SkillBadgesPage"));
const UserProfile = lazy(() => import("./pages/JobSeeker/UserProfile"));
const EmployerDashboard = lazy(() => import("./pages/Employer/EmployerDashboard"));
const JobPostingForm = lazy(() => import("./pages/Employer/JobPostingForm"));
const ManageJobs = lazy(() => import("./pages/Employer/ManageJobs"));
const ApplicationViewer = lazy(() => import("./pages/Employer/ApplicationViewer"));
const EmployerProfilePage = lazy(() => import("./pages/Employer/EmployerProfilePage"));
import ProtectedRoute from "./routes/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
const InterviewPage = lazy(() => import("./pages/LandingPage/InterviewPage"));
const SettingsPage = lazy(() => import("./pages/Settings/SettingsPage"));
const LegalPage = lazy(() => import("./pages/LegalPage"));

const RouteFallback = () => {
  const { t } = useTranslation();
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-screen items-center justify-center text-[#676664]"
    >
      {t("loading")}
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/interview-page" element={<InterviewPage />} />
            <Route
              path="/privacy-policy"
              element={<LegalPage document="privacy" />}
            />
            <Route path="/terms" element={<LegalPage document="terms" />} />

            <Route path="/find-jobs" element={<JobSeekerDashboard />} />
            <Route path="/job/:jobId" element={<JobDetails />} />
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/skill-badges" element={<SkillBadgesPage />} />
              <Route path="/profile" element={<UserProfile />} />
            </Route>

            <Route element={<ProtectedRoute requiredRole="jobseeker" />}>
              <Route path="/saved-jobs" element={<SavedJobs />} />
              <Route path="/matches" element={<JobMatchesPage />} />
              <Route path="/resume-builder" element={<ResumeBuilderPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredRole="employer" />}>
              <Route path="/employer-dashboard" element={<EmployerDashboard />} />
              <Route path="/post-job" element={<JobPostingForm />} />
              <Route path="/manage-jobs" element={<ManageJobs />} />
              <Route path="/applicants" element={<ApplicationViewer />} />
              <Route path="/company-profile" element={<EmployerProfilePage />} />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>

      <Toaster
        toastOptions={{
          className: "",
          style: {
            fontSize: "13px",
          },
        }}
      />
    </AuthProvider>
  );
};

export default App;
