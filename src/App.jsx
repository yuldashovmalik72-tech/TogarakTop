import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { CompareProvider } from "./context/CompareContext.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import CompareTray from "./components/CompareTray.jsx";

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
import ComparePage from "./pages/ComparePage.jsx";
import MapPage from "./pages/MapPage.jsx";
import { NotFound } from "./pages/ErrorPage.jsx";

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CompareProvider>
          <div className="min-h-screen bg-paper">
            <Navbar />
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/kirish" element={<Login />} />
                <Route path="/royxatdan-otish" element={<Register />} />
                <Route path="/taqqoslash" element={<ComparePage />} />
                <Route path="/xarita" element={<MapPage />} />

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

              {/* Noma'lum yo'llar — o'z 404 sahifamiz (Vercel default emas) */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
          <CompareTray />
        </div>
      </CompareProvider>
    </AuthProvider>
    </ToastProvider>
  );
}
