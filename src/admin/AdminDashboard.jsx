import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import CarteThermique from "../components/CarteThermique"; // import correct

const dummyUserData = [
  { id: 1, name: "Fatou Diop", role: "Agent santé", status: "Actif" },
  { id: 2, name: "Mamadou Ndiaye", role: "Relais communautaire", status: "Actif" },
  { id: 3, name: "Aissatou Sow", role: "Utilisateur", status: "Inactif" },
];

const dummyAlerts = [
  { id: 1, region: "Matam", level: "Dangereux", date: "2025-07-20" },
  { id: 2, region: "Kaffrine", level: "Très dangereux", date: "2025-07-19" },
  { id: 3, region: "Podor", level: "Très inconfortable", date: "2025-07-21" },
];

const heatwaveImpactData = [
  { date: "2025-06-15", reports: 12 },
  { date: "2025-06-20", reports: 22 },
  { date: "2025-06-25", reports: 18 },
  { date: "2025-07-01", reports: 30 },
  { date: "2025-07-10", reports: 40 },
];

export default function AdminDashboard() {
  const [users, setUsers] = useState(dummyUserData);
  const [alerts, setAlerts] = useState(dummyAlerts);

  const refreshData = () => {
    alert("Données rafraîchies !");
  };

  const levelColor = (level) => {
    switch (level) {
      case "Très dangereux":
        return "text-red-700 font-bold";
      case "Dangereux":
        return "text-orange-600 font-bold";
      case "Très inconfortable":
        return "text-yellow-600 font-bold";
      default:
        return "text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 p-8 max-w-7xl mx-auto">
      <h1 className="text-5xl font-extrabold mb-10 text-center text-orange-600 drop-shadow-md">
        Tableau de bord <span className="text-gray-800">administrateur</span>
      </h1>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <StatCard title="Utilisateurs" value={users.length} color="blue" />
        <StatCard title="Alertes actives" value={alerts.length} color="red" />
        <StatCard title="Bulletins" value={5} color="green" />
        <div className="flex items-center justify-center bg-white rounded-lg shadow p-6">
          <button
            onClick={refreshData}
            className="px-6 py-3 bg-orange-600 text-white rounded shadow hover:bg-orange-700 transition"
          >
            Rafraîchir données
          </button>
        </div>
      </div>

      {/* Graphique */}
      <section className="mt-12 bg-white rounded-lg shadow p-8">
        <h2 className="text-3xl font-semibold mb-6 text-orange-600">
          Rapports sanitaires liés aux vagues de chaleur
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={heatwaveImpactData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 14, fill: "#f97316" }} />
            <YAxis tick={{ fontSize: 14, fill: "#f97316" }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#fef3c7", borderRadius: "8px" }}
            />
            <Line
              type="monotone"
              dataKey="reports"
              stroke="#f97316"
              strokeWidth={3}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* Alertes en cours */}
      <section className="mt-12 bg-white rounded-lg shadow p-8">
        <h2 className="text-3xl font-semibold mb-6 text-orange-600">Alertes en cours</h2>
        <table className="w-full text-left border-collapse">
          <thead className="border-b border-orange-300 text-orange-600 font-semibold text-lg">
            <tr>
              <th className="p-4">Région</th>
              <th className="p-4">Niveau d'alerte</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert) => (
              <tr
                key={alert.id}
                className="hover:bg-orange-50 transition cursor-default"
              >
                <td className="p-4 font-semibold text-gray-800">{alert.region}</td>
                <td className={`p-4 ${levelColor(alert.level)}`}>{alert.level}</td>
                <td className="p-4">{alert.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Carte thermique */}
      <section className="mt-12 bg-white rounded-lg shadow p-8">
        <h2 className="text-3xl font-semibold mb-6 text-orange-600">
          Carte thermique des régions
        </h2>
        <CarteThermique />
      </section>

      {/* Gestion utilisateurs */}
      <section className="mt-12 bg-white rounded-lg shadow p-8">
        <h2 className="text-3xl font-semibold mb-6 text-orange-600">
          Gestion des utilisateurs
        </h2>
        <table className="w-full text-left border-collapse">
          <thead className="border-b border-orange-300 text-orange-600 font-semibold text-lg">
            <tr>
              <th className="p-4">Nom</th>
              <th className="p-4">Rôle</th>
              <th className="p-4">Statut</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-orange-50 transition cursor-default"
              >
                <td className="p-4 font-semibold text-gray-800">{user.name}</td>
                <td className="p-4">{user.role}</td>
                <td className={`p-4 font-semibold ${user.status === "Actif" ? "text-green-600" : "text-gray-500"}`}>
                  {user.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function StatCard({ title, value, color }) {
  const colorMap = {
    blue: "text-blue-600",
    red: "text-red-600",
    green: "text-green-600",
    orange: "text-orange-500",
  };
  return (
    <div className="bg-white rounded-lg shadow p-6 text-center">
      <h3 className="text-lg font-semibold text-gray-600">{title}</h3>
      <p className={`text-4xl font-extrabold mt-3 ${colorMap[color] || "text-gray-800"}`}>
        {value}
      </p>
    </div>
  );
}
