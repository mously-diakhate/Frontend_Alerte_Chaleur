"use client"

import { useState, useEffect } from "react"
import {
  Pencil,
  Trash2,
  UserPlus,
  Users,
  UserCheck,
  UserX,
  RefreshCw,
  Eye,
  ToggleLeft,
  ToggleRight,
} from "lucide-react"
import { userApiService } from "../services/userApiService"
import UserCreateModal from "./user-create-modal"
import UserEditModal from "./user-edit-modal"

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [roleFilter, setRoleFilter] = useState("Tous")
  const [regionFilter, setRegionFilter] = useState("Tous")
  const [statusFilter, setStatusFilter] = useState("Tous")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [regions, setRegions] = useState([])
  const [statistics, setStatistics] = useState({
    total_users: 0,
    active_users: 0,
    users_by_role: [],
  })

  useEffect(() => {
    loadUsers()
    loadStatistics()
    loadRegions()
  }, [])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadUsers()
    }, 300)
    return () => clearTimeout(debounceTimer)
  }, [roleFilter, regionFilter, statusFilter, searchTerm])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const filters = {
        role: roleFilter,
        region: regionFilter,
        status: statusFilter === "Tous" ? "" : statusFilter,
        search: searchTerm,
      }
      const response = await userApiService.getUsers(filters)
      setUsers(response.results || response)
    } catch (error) {
      alert("Erreur lors du chargement des utilisateurs : " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const loadStatistics = async () => {
    try {
      const stats = await userApiService.getUserStatistics()
      setStatistics(stats)
    } catch (error) {
      console.error("Erreur stats", error)
    }
  }

  const loadRegions = async () => {
    try {
      const regionsData = await userApiService.getRegions()
      setRegions(["Tous", ...regionsData])
    } catch (error) {
      console.error("Erreur régions", error)
    }
  }

  const handleDelete = async (user) => {
    if (window.confirm(`Supprimer l'utilisateur "${user.full_name || user.username}" ?`)) {
      try {
        await userApiService.deleteUser(user.id)
        setUsers((prev) => prev.filter((u) => u.id !== user.id))
        loadStatistics()
      } catch (error) {
        alert("Erreur suppression : " + error.message)
      }
    }
  }

  const handleToggleStatus = async (user) => {
    try {
      await userApiService.toggleUserStatus(user.id)
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: !u.is_active } : u))
      )
      loadStatistics()
    } catch (error) {
      alert("Erreur statut : " + error.message)
    }
  }

  const statusBadge = (isActive) =>
    isActive ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"

  const roleBadge = (role) => {
    if (role === "super_admin") return "bg-red-100 text-red-700"
    if (role === "admin") return "bg-orange-100 text-orange-700"
    return "bg-blue-100 text-blue-700"
  }

  const getRoleLabel = (role) => {
    if (role === "admin") return "Admin"
    if (role === "super_admin") return "Super Admin"
    return "Utilisateur"
  }

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleString("fr-FR")
      : "Jamais"

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center text-orange-600">
        Gestion des <span className="text-gray-800">utilisateurs</span>
      </h1>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatBox label="Total utilisateurs" value={statistics.total_users} icon={<Users />} color="orange" />
        <StatBox label="Utilisateurs actifs" value={statistics.active_users} icon={<UserCheck />} color="green" />
        <StatBox
          label="Administrateurs"
          value={statistics.users_by_role.find((r) => r.role === "admin")?.count || 0}
          icon={<Eye />}
          color="red"
        />
        <StatBox
          label="Utilisateurs inactifs"
          value={statistics.total_users - statistics.active_users}
          icon={<UserX />}
          color="gray"
        />
      </div>

      {/* Filtres + Boutons */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-3 w-full md:w-auto flex-grow">
          <input
            type="text"
            placeholder="Rechercher..."
            className="px-4 py-2 border border-orange-300 rounded w-full md:w-60"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="px-4 py-2 border border-orange-300 rounded"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="Tous">Tous les rôles</option>
            <option value="admin">Admin</option>
            <option value="user">Utilisateur</option>
          </select>
          <select
            className="px-4 py-2 border border-orange-300 rounded"
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
          >
            {regions.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <select
            className="px-4 py-2 border border-orange-300 rounded"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="Tous">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadUsers}
            className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Actualiser
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Nouvel utilisateur
          </button>
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full table-auto">
          <thead className="bg-orange-100 text-orange-700">
            <tr>
              <th className="p-4 text-left">Nom</th>
              <th className="p-4 text-left">Rôle</th>
              <th className="p-4 text-left">Région</th>
              <th className="p-4 text-left">Statut</th>
              <th className="p-4 text-left">Connexion</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {users.length ? (
              users.map((user) => (
                <tr key={user.id} className="border-t hover:bg-orange-50">
                  <td className="p-4">{user.full_name || user.username}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded ${roleBadge(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="p-4">{user.region || "—"}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded ${statusBadge(user.is_active)}`}>
                      {user.is_active ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="p-4">{formatDate(user.last_login)}</td>
                  <td className="p-4 flex gap-2">
                    <button onClick={() => setShowEditModal(true) || setSelectedUser(user)}>
                      <Pencil className="text-orange-600 w-4 h-4" />
                    </button>
                    <button onClick={() => handleToggleStatus(user)}>
                      {user.is_active ? (
                        <ToggleRight className="text-green-600 w-4 h-4" />
                      ) : (
                        <ToggleLeft className="text-gray-600 w-4 h-4" />
                      )}
                    </button>
                    <button onClick={() => handleDelete(user)}>
                      <Trash2 className="text-red-600 w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500">
                  Aucun utilisateur trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <UserCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onUserCreated={(user) => {
          setUsers([user, ...users])
          loadStatistics()
        }}
      />
      <UserEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={selectedUser}
        onUserUpdated={(updated) => {
          setUsers((prev) =>
            prev.map((u) => (u.id === updated.id ? updated : u))
          )
          loadStatistics()
        }}
      />
    </div>
  )
}

// Composant pour boîte statistique
function StatBox({ label, value, icon, color = "orange" }) {
  const colorMap = {
    orange: "text-orange-600",
    green: "text-green-600",
    red: "text-red-600",
    gray: "text-gray-600",
  }
  return (
    <div className="bg-white rounded shadow p-4 flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className={`text-2xl font-bold ${colorMap[color]}`}>{value}</p>
      </div>
      <div className={`w-8 h-8 ${colorMap[color]}`}>{icon}</div>
    </div>
  )
}
