import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import CircleDetail from "./pages/CircleDetail.jsx";
import EditCircle from "./pages/EditCircle.jsx";
import CreateCircle from "./pages/CreateCircle.jsx";
import MyCircles from "./pages/MyCircles.jsx";
import CourseCenterDetail from "./pages/CourseCenterDetail.jsx";
import MyCourseCenters from "./pages/MyCourseCenters.jsx";
import Profile from "./pages/Profile.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <div className="min-h-screen bg-paper">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/kirish" element={<Login />} />
            <Route path="/royxatdan-otish" element={<Register />} />

            <Route path="/togarak/:id" element={<CircleDetail />} />
            <Route path="/markaz/:id" element={<CourseCenterDetail />} />

            <Route
              path="/togarak/:id/tahrirlash"
              element={
                <ProtectedRoute>
                  <EditCircle />
                </ProtectedRoute>
              }
            />
            <Route
              path="/togarak-yaratish"
              element={
                <ProtectedRoute>
                  <CreateCircle />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mening-togaraklarim"
              element={
                <ProtectedRoute>
                  <MyCircles />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mening-markazlarim"
              element={
                <ProtectedRoute>
                  <MyCourseCenters />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profil"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </AuthProvider>
    </ToastProvider>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 text-center">
      <h1 className="font-display text-2xl font-extrabold text-ink">404</h1>
      <p className="text-sm text-muted">Bu sahifa topilmadi</p>
    </div>
  );
}