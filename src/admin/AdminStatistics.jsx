import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const alertDataByRegion = [
  { region: "Matam", alerts: 12 },
  { region: "Kaffrine", alerts: 8 },
  { region: "Podor", alerts: 5 },
  { region: "Dakar", alerts: 10 },
  { region: "Thiès", alerts: 6 },
];

const healthImpactReports = [
  { date: "2025-07-01", reports: 20 },
  { date: "2025-07-05", reports: 35 },
  { date: "2025-07-10", reports: 40 },
  { date: "2025-07-15", reports: 50 },
  { date: "2025-07-20", reports: 30 },
];

const userProfilesStats = [
  { profile: "Personnes âgées", count: 120 },
  { profile: "Femmes enceintes", count: 80 },
  { profile: "Enfants", count: 100 },
  { profile: "Maladies chroniques", count: 60 },
];

const COLORS = ["#FF8042", "#0088FE", "#00C49F", "#FFBB28"];

export default function AdminStatistics() {
  const [selectedProfile, setSelectedProfile] = useState("Tous");

  // Filtrer par profil utilisateur si besoin (exemple)
  const filteredProfiles =
    selectedProfile === "Tous"
      ? userProfilesStats
      : userProfilesStats.filter((p) => p.profile === selectedProfile);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 p-8 max-w-7xl mx-auto">
      <h1 className="text-5xl font-extrabold mb-10 text-center text-orange-600 drop-shadow-md">
        Statistiques & Rapports <span className="text-gray-800">de la plateforme</span>
      </h1>

      {/* Résumé / Objectifs */}
      <section className="mb-12 bg-white p-6 rounded-lg shadow">
        <h2 className="text-3xl font-semibold text-orange-600 mb-4">Objectif principal</h2>
        <p className="text-gray-700 text-lg max-w-4xl mx-auto text-center">
          Alerter les populations vulnérables des risques sanitaires liés aux vagues de chaleur et proposer des gestes préventifs personnalisés.
        </p>
      </section>

      {/* Statistiques Alertes par région */}
      <section className="mb-12 bg-white p-6 rounded-lg shadow">
        <h2 className="text-3xl font-semibold text-orange-600 mb-6">Alertes par région</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={alertDataByRegion} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="region" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="alerts" fill="#fb923c" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Rapports sanitaires liés aux vagues de chaleur */}
      <section className="mb-12 bg-white p-6 rounded-lg shadow">
        <h2 className="text-3xl font-semibold text-orange-600 mb-6">Rapports sanitaires (signalements)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={healthImpactReports} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="reports" stroke="#f97316" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* Profil utilisateurs / recommandations ciblées */}
      <section className="mb-12 bg-white p-6 rounded-lg shadow max-w-4xl mx-auto">
        <h2 className="text-3xl font-semibold text-orange-600 mb-6 text-center">
          Répartition des profils utilisateurs
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={userProfilesStats}
              dataKey="count"
              nameKey="profile"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {userProfilesStats.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </section>

      {/* Rapport récapitulatif simplifié */}
      <section className="bg-white p-6 rounded-lg shadow max-w-4xl mx-auto mb-20">
        <h2 className="text-3xl font-semibold text-orange-600 mb-6 text-center">Résumé des fonctionnalités</h2>
        <ul className="list-disc list-inside text-gray-700 text-lg space-y-2 max-w-xl mx-auto">
          <li>Système d’alerte localisée avec notifications push/SMS par région.</li>
          <li>Affichage des données météo-santé avec carte thermique.</li>
          <li>Profil utilisateur pour recommandations ciblées.</li>
          <li>Module “Que faire ?” avec gestes de premiers secours et conseils.</li>
          <li>Connexion automatique aux bulletins CNCS/ANACIM.</li>
          <li>Collecte de données terrain sur les effets sanitaires.</li>
          <li>Module IA pour prédiction et anticipation des pics de chaleur.</li>
          <li>Administration complète et suivi en temps réel des alertes et utilisateurs.</li>
        </ul>
      </section>
    </div>
  );
}
