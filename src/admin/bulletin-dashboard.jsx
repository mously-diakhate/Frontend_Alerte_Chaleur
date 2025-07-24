"use client"

import { useState } from "react"
import { FileText, Upload, BarChart3 } from "lucide-react"
import MeteoBulletinsConnected from "./meteo-bulletins-connected"

export default function BulletinDashboard() {
  const [activeTab, setActiveTab] = useState("bulletins")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="container mx-auto p-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">Centre de Bulletins KARANGUE</h1>
          <p className="text-gray-600 text-lg">Système de gestion des bulletins météo-santé</p>
        </div>

        {/* Navigation par onglets */}
        <div className="flex border-b border-gray-200 mb-6">
          {[
            { id: "bulletins", label: "Bulletins", icon: FileText },
            { id: "upload", label: "Ajouter", icon: Upload },
            { id: "analytics", label: "Analyses", icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
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
        {activeTab === "bulletins" && <MeteoBulletinsConnected />}
        {activeTab === "upload" && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-12">
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Ajouter un bulletin</h3>
              <p className="text-gray-500 mb-4">
                Utilisez le bouton "Ajouter un bulletin" dans l'onglet Bulletins pour uploader un nouveau fichier.
              </p>
              <button
                onClick={() => setActiveTab("bulletins")}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Aller aux bulletins
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
                Cette section contiendra des graphiques et analyses approfondies des téléchargements de bulletins.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
