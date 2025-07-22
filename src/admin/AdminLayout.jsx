import { Link, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, AlertTriangle, FileText, BarChart3, LogOut } from "lucide-react";
import LogoutButton from "../components/LogoutButton";

export default function AdminLayout() {
  const navigate = useNavigate();

  // Check if admin is logged in, else redirect to login
  if (!localStorage.getItem("admin")) {
    navigate("/admin/login");
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-lg p-6 flex flex-col">
        <h1 className="text-3xl font-extrabold mb-10 text-orange-500">KARANGUE Admin</h1>
        <nav className="flex flex-col space-y-4 flex-grow">
          <Link to="/admin/dashboard" className="flex items-center gap-3 text-gray-700 hover:text-orange-600 font-semibold">
            <LayoutDashboard /> Tableau de bord
          </Link>
          <Link to="/admin/users" className="flex items-center gap-3 text-gray-700 hover:text-orange-600 font-semibold">
            <Users /> Utilisateurs
          </Link>
          <Link to="/admin/alerts" className="flex items-center gap-3 text-gray-700 hover:text-orange-600 font-semibold">
            <AlertTriangle /> Alertes
          </Link>
          <Link to="/admin/bulletins" className="flex items-center gap-3 text-gray-700 hover:text-orange-600 font-semibold">
            <FileText /> Bulletins météo
          </Link>
          <Link to="/admin/statistics" className="flex items-center gap-3 text-gray-700 hover:text-orange-600 font-semibold">
            <BarChart3 /> Statistiques
          </Link>
        </nav>
        <LogoutButton />
      </aside>

      <main className="flex-1 p-10 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
