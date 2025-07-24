"use client"

import { useState, useEffect } from "react"
import { X, UserPlus, AlertCircle, CheckCircle } from "lucide-react"
import { userApiService } from "../services/userApiService"

export default function UserCreateModal({ isOpen, onClose, onUserCreated }) {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    full_name: "",
    situation: "aucune",
    region: "",
    phone_number: "",
    is_admin: false,
    email_notifications: true,
    sms_notifications: false,
    is_active: true,
    password: "",
  })

  const [createStatus, setCreateStatus] = useState({
    isLoading: false,
    success: false,
    error: null,
  })

  const [regions, setRegions] = useState([])
  const [situationChoices, setSituationChoices] = useState([])

  useEffect(() => {
    if (isOpen) {
      loadRegions()
      loadSituationChoices()
    }
  }, [isOpen])

  const loadRegions = async () => {
    try {
      const regionsData = await userApiService.getRegions()
      setRegions(regionsData)
    } catch (error) {
      console.error("Erreur lors du chargement des régions:", error)
    }
  }

  const loadSituationChoices = async () => {
    try {
      const choices = await userApiService.getSituationChoices()
      setSituationChoices(choices)
    } catch (error) {
      console.error("Erreur lors du chargement des choix de situation:", error)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    const errors = []

    if (!formData.email.trim()) errors.push("L'email est requis")
    if (!formData.username.trim()) errors.push("Le nom d'utilisateur est requis")
    if (!formData.full_name.trim()) errors.push("Le nom complet est requis")

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push("Format d'email invalide")
    }

    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const errors = validateForm()
    if (errors.length > 0) {
      setCreateStatus({
        isLoading: false,
        success: false,
        error: errors.join("\n"),
      })
      return
    }

    try {
      setCreateStatus({
        isLoading: true,
        success: false,
        error: null,
      })

      const result = await userApiService.createUser(formData)

      setCreateStatus({
        isLoading: false,
        success: true,
        error: null,
      })

      // Notifier le parent
      if (onUserCreated) {
        onUserCreated(result)
      }

      // Réinitialiser le formulaire après un délai
      setTimeout(() => {
        resetForm()
        onClose()
      }, 2000)
    } catch (error) {
      console.error("Erreur lors de la création:", error)
      setCreateStatus({
        isLoading: false,
        success: false,
        error: error.message,
      })
    }
  }

  const resetForm = () => {
    setFormData({
      email: "",
      username: "",
      full_name: "",
      situation: "aucune",
      region: "",
      phone_number: "",
      is_admin: false,
      email_notifications: true,
      sms_notifications: false,
      is_active: true,
      password: "",
    })
    setCreateStatus({
      isLoading: false,
      success: false,
      error: null,
    })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-orange-700 flex items-center gap-2">
              <UserPlus className="w-6 h-6" />
              Créer un nouvel utilisateur
            </h2>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 transition">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="utilisateur@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  disabled={createStatus.isLoading}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Nom d'utilisateur *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  placeholder="nom_utilisateur"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  disabled={createStatus.isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Nom complet *</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
                placeholder="Prénom Nom"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                disabled={createStatus.isLoading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Situation</label>
                <select
                  value={formData.situation}
                  onChange={(e) => handleInputChange("situation", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  disabled={createStatus.isLoading}
                >
                  {situationChoices.map((choice) => (
                    <option key={choice.value} value={choice.value}>
                      {choice.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Région</label>
                <select
                  value={formData.region}
                  onChange={(e) => handleInputChange("region", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  disabled={createStatus.isLoading}
                >
                  <option value="">Sélectionner une région</option>
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange("phone_number", e.target.value)}
                  placeholder="+221 XX XXX XX XX"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  disabled={createStatus.isLoading}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Mot de passe</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Laisser vide pour mot de passe par défaut"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  disabled={createStatus.isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">Si vide, le mot de passe par défaut sera "karangue2025"</p>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_admin"
                  checked={formData.is_admin}
                  onChange={(e) => handleInputChange("is_admin", e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  disabled={createStatus.isLoading}
                />
                <label htmlFor="is_admin" className="ml-2 text-gray-700">
                  Administrateur
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="email_notifications"
                  checked={formData.email_notifications}
                  onChange={(e) => handleInputChange("email_notifications", e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  disabled={createStatus.isLoading}
                />
                <label htmlFor="email_notifications" className="ml-2 text-gray-700">
                  Notifications par email
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sms_notifications"
                  checked={formData.sms_notifications}
                  onChange={(e) => handleInputChange("sms_notifications", e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  disabled={createStatus.isLoading}
                />
                <label htmlFor="sms_notifications" className="ml-2 text-gray-700">
                  Notifications par SMS
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange("is_active", e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  disabled={createStatus.isLoading}
                />
                <label htmlFor="is_active" className="ml-2 text-gray-700">
                  Compte actif
                </label>
              </div>
            </div>

            {/* Messages d'état */}
            {createStatus.error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div className="whitespace-pre-line">{createStatus.error}</div>
              </div>
            )}

            {createStatus.success && (
              <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <div>Utilisateur créé avec succès !</div>
              </div>
            )}

            {/* Boutons */}
            <div className="flex gap-4 justify-end pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                disabled={createStatus.isLoading}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={createStatus.isLoading || createStatus.success}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {createStatus.isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Créer l'utilisateur
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
