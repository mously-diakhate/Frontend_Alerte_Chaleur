
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";

import { useEffect } from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/Home";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import CartographiePage from "./pages/cartographie";
import MeteoSantePage from "./pages/meteosante";
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminUsersDashboard from "./admin/admin-users-dashboard";
import AdminAlertsDashboardConnected from './admin/admin-alerts-dashboard-connected'
import BulletinDashboard from "./admin/bulletin-dashboard";
import AdminStatistics from "./admin/AdminStatistics";
import About from "./pages/About";
import AlertPage from "./pages/Alert";
import "leaflet/dist/leaflet.css";

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    window.scrollTo(0, 0); // Pour éviter de rester scroller après navigation
  }, [location]);

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <div className="pt-20 flex flex-col min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/cartographie" element={<CartographiePage />} />
          <Route path="/meteosante" element={<MeteoSantePage />} />
          <Route path="/about" element={<About />} /> 
          <Route path="/alertes" element={<AlertPage />} />

          {/* Admin section */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} /> {/* 👈 AJOUT OBLIGATOIRE */}
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsersDashboard />} />
            <Route path="alerts" element={<AdminAlertsDashboardConnected />} />
            <Route path="bulletins" element={<BulletinDashboard />} />
            <Route path="statistics" element={<AdminStatistics />} />
          </Route>

        </Routes>
        {!isAdminRoute && <Footer />}
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
