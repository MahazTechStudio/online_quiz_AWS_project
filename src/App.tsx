import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AuthRoute from "@/components/AuthRoute";
import StudentLayout from "@/components/StudentLayout";
import AdminLayout from "@/components/AdminLayout";
import LoginPage from "@/pages/LoginPage";
import NotFoundPage from "@/pages/NotFoundPage";
import StudentDashboard from "@/pages/student/StudentDashboard";
import StudentQuizzes from "@/pages/student/StudentQuizzes";
import StudentTakeQuiz from "@/pages/student/StudentTakeQuiz";
import StudentResults from "@/pages/student/StudentResults";
import StudentResultDetail from "@/pages/student/StudentResultDetail";
import StudentProfile from "@/pages/student/StudentProfile";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminQuizzes from "@/pages/admin/AdminQuizzes";
import AdminQuizEditor from "@/pages/admin/AdminQuizEditor";
import AdminResults from "@/pages/admin/AdminResults";
import AdminProfile from "@/pages/admin/AdminProfile";
import Spinner from "@/components/Spinner";

function RootRedirect() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-slate-500">Loading QuizCloud...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/student/dashboard" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/student"
        element={
          <AuthRoute requiredRole="student">
            <StudentLayout />
          </AuthRoute>
        }
      >
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="quizzes" element={<StudentQuizzes />} />
        <Route path="quizzes/:quizId" element={<StudentTakeQuiz />} />
        <Route path="results" element={<StudentResults />} />
        <Route path="results/:attemptId" element={<StudentResultDetail />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      <Route
        path="/admin"
        element={
          <AuthRoute requiredRole="admin">
            <AdminLayout />
          </AuthRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="quizzes" element={<AdminQuizzes />} />
        <Route path="quizzes/new" element={<AdminQuizEditor />} />
        <Route path="quizzes/:quizId" element={<AdminQuizEditor />} />
        <Route path="results" element={<AdminResults />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
