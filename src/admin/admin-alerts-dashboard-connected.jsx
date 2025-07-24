"use client"

import { useState } from "react"
import { Send, History, BarChart3 } from "lucide-react"
import AlertSenderConnected from "./alert-sender-connected"
import AlertHistoryConnected from "./alert-history-connected"

export default function AdminAlertsDashboardConnected() {
  const [activeTab, setActiveTab] = useState("send")

  const handleAlertSent = (alert) => {
    console.log("Alerte envoyée:", alert)
    setActiveTab("history") // Basculer vers l'historique après envoi
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <div className="container mx-auto p-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-orange-600 mb-2">Centre d'Alertes KARANGUE</h1>
          <p className="text-gray-600 text-lg">Système de gestion et d'envoi d'alertes météo-santé connecté</p>
        </div>

        {/* Navigation par onglets */}
        <div className="flex border-b border-gray-200 mb-6">
          {[
            { id: "send", label: "Envoyer une alerte", icon: Send },
            { id: "history", label: "Historique", icon: History },
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
        {activeTab === "send" && <AlertSenderConnected onAlertSent={handleAlertSent} />}
        {activeTab === "history" && <AlertHistoryConnected />}
        {activeTab === "analytics" && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Analyses détaillées</h3>
              <p className="text-gray-500">
                Cette section contiendra des graphiques et analyses approfondies des performances de vos alertes.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
