"use client"

import { useState } from "react"
import { Users, UserPlus, BarChart3 } from "lucide-react"
import UserManagement from "./user-management"

export default function AdminUsersDashboard() {
  const [activeTab, setActiveTab] = useState("users")

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <div className="container mx-auto p-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-orange-600 mb-2">Centre de Gestion KARANGUE</h1>
          <p className="text-gray-600 text-lg">Système de gestion des utilisateurs</p>
        </div>

        {/* Navigation par onglets */}
        <div className="flex border-b border-gray-200 mb-6">
          {[
            { id: "users", label: "Gestion des utilisateurs", icon: Users },
            { id: "create", label: "Créer utilisateur", icon: UserPlus },
            { id: "analytics", label: "Analyses", icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Contenu des onglets */}
        {activeTab === "users" && <UserManagement />}
        {activeTab === "create" && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-12">
              <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Créer un utilisateur</h3>
              <p className="text-gray-500 mb-4">
                Utilisez le bouton "Nouvel utilisateur" dans l'onglet Gestion des utilisateurs pour créer un nouveau
                compte.
              </p>
              <button
                onClick={() => setActiveTab("users")}
                className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition"
              >
                Aller à la gestion
              </button>
            </div>
          </div>
        )}
        {activeTab === "analytics" && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Analyses détaillées</h3>
              <p className="text-gray-500">
                Cette section contiendra des graphiques et analyses approfondies des utilisateurs.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
