import { useState } from "react";
import { Pencil, Trash2, UserPlus } from "lucide-react";

const sampleUsers = [
  {
    id: 1,
    name: "Dr. Aminata Diop",
    email: "a.diop@sante.sn",
    role: "admin",
    region: "Dakar",
    status: "actif",
    lastLogin: "2025-01-03 14:30",
  },
  {
    id: 2,
    name: "Ousmane Fall",
    email: "o.fall@agent.sn",
    role: "agent",
    region: "Matam",
    status: "actif",
    lastLogin: "2025-01-03 12:15",
  },
  {
    id: 3,
    name: "Fatou Seck",
    email: "f.seck@relais.sn",
    role: "agent",
    region: "Podor",
    status: "inactif",
    lastLogin: "2025-01-02 16:45",
  },
];

export default function AdminUsers() {
  const [users, setUsers] = useState(sampleUsers);
  const [roleFilter, setRoleFilter] = useState("Tous");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers =
    roleFilter === "Tous"
      ? users.filter((u) =>
          [u.name, u.email, u.region]
            .join(" ")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      : users
          .filter((u) => u.role === roleFilter.toLowerCase())
          .filter((u) =>
            [u.name, u.email, u.region]
              .join(" ")
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          );

  const statusBadge = (status) =>
    status === "actif"
      ? "bg-green-100 text-green-800"
      : "bg-gray-200 text-gray-700";

  const roleBadge = (role) => {
    if (role === "admin") return "bg-red-100 text-red-700";
    if (role === "agent") return "bg-blue-100 text-blue-700";
    return "bg-gray-200 text-gray-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 p-8 max-w-7xl mx-auto">
      <h1 className="text-5xl font-extrabold mb-10 text-center text-orange-600 drop-shadow-md">
        Gestion des <span className="text-gray-800">utilisateurs</span>
      </h1>

      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-4 w-full max-w-lg">
            <input
              type="text"
              placeholder="Rechercher par nom, email ou région..."
              className="flex-1 px-4 py-3 border border-orange-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 border border-orange-300 rounded shadow-sm text-orange-700 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="Tous">Tous les rôles</option>
              <option value="admin">Admin</option>
              <option value="agent">Agent</option>
            </select>
          </div>

          <button
            className="flex items-center gap-2 bg-orange-600 text-white px-5 py-3 rounded shadow hover:bg-orange-700 transition font-semibold"
            title="Ajouter un nouvel utilisateur"
          >
            <UserPlus className="w-5 h-5" /> Nouvel utilisateur
          </button>
        </div>

        <table className="w-full text-left border-collapse rounded overflow-hidden">
          <thead className="bg-orange-100 text-orange-700 font-semibold text-lg">
            <tr>
              <th className="p-4 border-b border-orange-300">Utilisateur</th>
              <th className="p-4 border-b border-orange-300">Rôle</th>
              <th className="p-4 border-b border-orange-300">Région</th>
              <th className="p-4 border-b border-orange-300">Statut</th>
              <th className="p-4 border-b border-orange-300">Dernière connexion</th>
              <th className="p-4 border-b border-orange-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-orange-200 hover:bg-orange-50 transition cursor-default"
                >
                  <td className="p-4">
                    <div className="font-semibold text-gray-800">{u.name}</div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-semibold ${roleBadge(
                        u.role
                      )}`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">{u.region}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-semibold ${statusBadge(
                        u.status
                      )}`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4">{u.lastLogin}</td>
                  <td className="p-4 flex gap-3">
                    <button
                      className="text-orange-600 hover:text-orange-800"
                      title={`Modifier ${u.name}`}
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      title={`Supprimer ${u.name}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 py-10">
                  Aucun utilisateur trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
