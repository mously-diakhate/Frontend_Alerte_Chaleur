"use client"

import { useState, useEffect } from "react"
import { Eye, Clock, CheckCircle, XCircle, Users, Trash2, RefreshCw } from "lucide-react"
import { alertApiService } from "../services/alertApiService"

const levelColors = {
  "Très dangereux": "bg-red-500",
  Dangereux: "bg-orange-500",
  "Très inconfortable": "bg-yellow-500",
  Inconfortable: "bg-blue-500",
}

const statusColors = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  expired: "bg-red-100 text-red-800",
}

const statusIcons = {
  active: CheckCircle,
  inactive: Clock,
  expired: XCircle,
}

export default function AlertHistoryConnected() {
  const [alerts, setAlerts] = useState([])
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [statistics, setStatistics] = useState({
    total_alerts: 0,
    active_alerts: 0,
    alerts_by_level: [],
    alerts_by_region: [],
  })

  useEffect(() => {
    loadAlerts()
    loadStatistics()
  }, [])

  const loadAlerts = async () => {
    try {
      setIsLoading(true)
      const response = await alertApiService.getAlerts()
      setAlerts(response.results || response)
    } catch (error) {
      console.error("Erreur lors du chargement des alertes:", error)
      alert("Erreur lors du chargement des alertes: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const loadStatistics = async () => {
    try {
      const stats = await alertApiService.getSendingStatistics()
      setStatistics(stats)
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette alerte ?")) {
      try {
        await alertApiService.deleteAlert(id)
        setAlerts((prev) => prev.filter((alert) => alert.id !== id))
        alert("Alerte supprimée avec succès")
      } catch (error) {
        console.error("Erreur lors de la suppression:", error)
        alert("Erreur lors de la suppression: " + error.message)
      }
    }
  }

  const openModal = async (alert) => {
    try {
      const detailedAlert = await alertApiService.getAlertDetails(alert.id)
      setSelectedAlert(detailedAlert)
      setShowModal(true)
    } catch (error) {
      console.error("Erreur lors du chargement des détails:", error)
      setSelectedAlert(alert)
      setShowModal(true)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedAlert(null)
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case "active":
        return "Active"
      case "inactive":
        return "Inactive"
      case "expired":
        return "Expirée"
      default:
        return status
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600 flex items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          Chargement des alertes...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Historique des alertes</h2>
          <p className="text-gray-600">Consultez les alertes envoyées et leurs statistiques</p>
        </div>
        <button
          onClick={loadAlerts}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total alertes</p>
              <p className="text-2xl font-bold">{statistics.total_alerts}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Alertes actives</p>
              <p className="text-2xl font-bold">{statistics.active_alerts}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Région principale</p>
              <p className="text-lg font-bold">{statistics.alerts_by_region?.[0]?.region__name || "N/A"}</p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Niveau fréquent</p>
              <p className="text-lg font-bold">{statistics.alerts_by_level?.[0]?.alert_level || "N/A"}</p>
            </div>
            <Eye className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Tableau des alertes */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Alertes récentes</h3>
          <p className="text-sm text-gray-600">Liste des alertes créées avec leurs informations</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Région
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Niveau
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Aucune alerte trouvée
                  </td>
                </tr>
              ) : (
                alerts.map((alert) => {
                  const StatusIcon = statusIcons[alert.status] || CheckCircle
                  return (
                    <tr key={alert.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{alert.region_name || alert.region}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${levelColors[alert.alert_level] || "bg-gray-400"}`} />
                          <span className="text-sm">{alert.alert_level}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs truncate" title={alert.description_fr}>
                          {alert.description_fr || "Pas de description"}
                        </div>
                        {alert.audio_message && <div className="text-xs text-blue-600 mt-1">+ Message audio</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <StatusIcon className="w-4 h-4" />
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              statusColors[alert.status] || "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {getStatusLabel(alert.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{alert.admin_name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div>{new Date(alert.created_at).toLocaleDateString()}</div>
                          <div className="text-gray-500">{new Date(alert.created_at).toLocaleTimeString()}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openModal(alert)}
                            className="text-blue-600 hover:text-blue-800 transition font-semibold flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" /> Détails
                          </button>
                          <button
                            onClick={() => handleDelete(alert.id)}
                            className="text-red-600 hover:text-red-800 transition font-semibold flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" /> Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal détails */}
      {showModal && selectedAlert && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative mx-4" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeModal} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl">
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 text-orange-600">Détails de l'alerte</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Région</h4>
                  <p>{selectedAlert.region_name || selectedAlert.region}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Niveau</h4>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${levelColors[selectedAlert.alert_level] || "bg-gray-400"}`}
                    />
                    {selectedAlert.alert_level}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold">Administrateur</h4>
                  <p>{selectedAlert.admin_name}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Statut</h4>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      statusColors[selectedAlert.status] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {getStatusLabel(selectedAlert.status)}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Descriptions</h4>
                <div className="space-y-2">
                  {selectedAlert.description_fr && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Français:</span>
                      <p className="text-sm">{selectedAlert.description_fr}</p>
                    </div>
                  )}
                  {selectedAlert.description_wolof && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Wolof:</span>
                      <p className="text-sm">{selectedAlert.description_wolof}</p>
                    </div>
                  )}
                  {selectedAlert.description_poular && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Poular:</span>
                      <p className="text-sm">{selectedAlert.description_poular}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedAlert.audio_message && (
                <div>
                  <h4 className="font-semibold mb-2">Message audio</h4>
                  <audio controls src={selectedAlert.audio_message} className="w-full" />
                </div>
              )}

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Créée le:</span>
                    <p>{new Date(selectedAlert.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="font-medium">Modifiée le:</span>
                    <p>{new Date(selectedAlert.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
