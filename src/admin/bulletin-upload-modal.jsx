"use client"

import { useState, useEffect } from "react"
import { Upload, X, FileText, AlertCircle, CheckCircle } from "lucide-react"
import { bulletinApiService } from "../services/bulletinApiService"

export default function BulletinUploadModal({ isOpen, onClose, onBulletinCreated }) {
  const [formData, setFormData] = useState({
    title: "",
    region: "",
    description: "",
    file: null,
  })

  const [uploadStatus, setUploadStatus] = useState({
    isLoading: false,
    success: false,
    error: null,
  })

  const [dragActive, setDragActive] = useState(false)
  const [regions, setRegions] = useState([
    { id: 1, name: "Dakar" },
    { id: 2, name: "Thiès" },
    { id: 3, name: "Saint-Louis" },
    { id: 4, name: "Matam" },
    { id: 5, name: "Kaffrine" },
    { id: 6, name: "Podor" },
    { id: 7, name: "Kaolack" },
    { id: 8, name: "Ziguinchor" },
    { id: 9, name: "Tambacounda" },
    { id: 10, name: "Kolda" },
    { id: 11, name: "Fatick" },
    { id: 12, name: "Diourbel" },
    { id: 13, name: "Louga" },
    { id: 14, name: "Kédougou" },
    { id: 15, name: "Sédhiou" },
  ]) // Initialiser avec des données par défaut
  const [loadingRegions, setLoadingRegions] = useState(false) // Nouveau state pour le chargement

  // Charger les régions quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && regions.length === 0) {
      loadRegions()
    }
  }, [isOpen])

  const loadRegions = async () => {
    try {
      setLoadingRegions(true)
      const regionsData = await bulletinApiService.getRegions()

      // S'assurer que regionsData est un tableau
      if (Array.isArray(regionsData)) {
        setRegions(regionsData)
      } else if (regionsData && regionsData.results && Array.isArray(regionsData.results)) {
        setRegions(regionsData.results)
      } else {
        console.warn("Format de données régions inattendu:", regionsData)
        // Garder les régions par défaut déjà définies
      }
    } catch (error) {
      console.error("Erreur lors du chargement des régions:", error)
      // Les régions par défaut sont déjà définies dans le state initial
    } finally {
      setLoadingRegions(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileSelect = (file) => {
    // Vérifier l'extension du fichier
    const allowedExtensions = [".pdf", ".doc", ".docx"]
    const fileExtension = "." + file.name.split(".").pop().toLowerCase()

    if (!allowedExtensions.includes(fileExtension)) {
      setUploadStatus({
        isLoading: false,
        success: false,
        error: `Type de fichier non autorisé. Extensions autorisées: ${allowedExtensions.join(", ")}`,
      })
      return
    }

    // Vérifier la taille du fichier (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus({
        isLoading: false,
        success: false,
        error: "Le fichier ne peut pas dépasser 10MB.",
      })
      return
    }

    setFormData((prev) => ({ ...prev, file }))
    setUploadStatus({ isLoading: false, success: false, error: null })
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const validateForm = () => {
    const errors = []

    if (!formData.title.trim()) errors.push("Le titre est requis")
    if (!formData.region) errors.push("La région est requise")
    if (!formData.file) errors.push("Le fichier est requis")

    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const errors = validateForm()
    if (errors.length > 0) {
      setUploadStatus({
        isLoading: false,
        success: false,
        error: errors.join("\n"),
      })
      return
    }

    try {
      setUploadStatus({
        isLoading: true,
        success: false,
        error: null,
      })

      const result = await bulletinApiService.createBulletin(formData)

      setUploadStatus({
        isLoading: false,
        success: true,
        error: null,
      })

      // Notifier le parent
      if (onBulletinCreated) {
        onBulletinCreated(result)
      }

      // Réinitialiser le formulaire après un délai
      setTimeout(() => {
        resetForm()
        onClose()
      }, 2000)
    } catch (error) {
      console.error("Erreur lors de la création:", error)
      setUploadStatus({
        isLoading: false,
        success: false,
        error: error.message,
      })
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      region: "",
      description: "",
      file: null,
    })
    setUploadStatus({
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
            <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
              <Upload className="w-6 h-6" />
              Ajouter un bulletin météo
            </h2>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 transition">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Titre */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Titre du bulletin *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Ex: Bulletin Canicule - Matam - Juillet 2025"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={uploadStatus.isLoading}
              />
            </div>

            {/* Région */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Région *</label>
              <select
                value={formData.region}
                onChange={(e) => handleInputChange("region", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={uploadStatus.isLoading || loadingRegions}
              >
                <option value="">{loadingRegions ? "Chargement des régions..." : "Sélectionner une région"}</option>
                {Array.isArray(regions) &&
                  regions.map((region) => (
                    <option key={region.id} value={region.name}>
                      {region.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Description (optionnelle)</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Description du bulletin..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={uploadStatus.isLoading}
              />
            </div>

            {/* Upload de fichier */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Fichier du bulletin *</label>

              {/* Zone de drop */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-blue-400"
                } ${uploadStatus.isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !uploadStatus.isLoading && document.getElementById("file-input").click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                  disabled={uploadStatus.isLoading}
                />

                {formData.file ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <FileText className="w-8 h-8" />
                    <div>
                      <p className="font-medium">{formData.file.name}</p>
                      <p className="text-sm text-gray-500">{(formData.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    <Upload className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-lg font-medium">Glissez votre fichier ici</p>
                    <p className="text-sm">ou cliquez pour sélectionner</p>
                    <p className="text-xs mt-2">PDF, DOC, DOCX - Max 10MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Messages d'état */}
            {uploadStatus.error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div className="whitespace-pre-line">{uploadStatus.error}</div>
              </div>
            )}

            {uploadStatus.success && (
              <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <div>Bulletin créé avec succès !</div>
              </div>
            )}

            {/* Boutons */}
            <div className="flex gap-4 justify-end pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                disabled={uploadStatus.isLoading}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={uploadStatus.isLoading || uploadStatus.success}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploadStatus.isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Créer le bulletin
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
