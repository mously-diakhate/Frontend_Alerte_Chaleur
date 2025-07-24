"use client"

import { useState, useEffect, useRef } from "react"
import { Send, Users, MapPin, AlertTriangle, Clock, CheckCircle, Mic, Loader } from "lucide-react"
import { alertApiService } from "../services/alertApiService"

const alertLevels = [
  { value: "tres_dangereux", label: "Très dangereux", color: "bg-red-500" },
  { value: "dangereux", label: "Dangereux", color: "bg-orange-500" },
  { value: "tres_inconfortable", label: "Très inconfortable", color: "bg-yellow-500" },
  { value: "inconfortable", label: "Inconfortable", color: "bg-blue-500" },
]

const regionsSenegal = [
  "Dakar",
  "Thiès",
  "Saint-Louis",
  "Matam",
  "Kaffrine",
  "Podor",
  "Kaolack",
  "Ziguinchor",
  "Tambacounda",
  "Kolda",
  "Fatick",
  "Diourbel",
  "Louga",
  "Kédougou",
  "Sédhiou",
]

const targetGroups = [
  { id: "all", label: "Tous les utilisateurs", icon: Users },
  { id: "elderly", label: "Personnes âgées", icon: Users },
  { id: "pregnant", label: "Femmes enceintes", icon: Users },
  { id: "children", label: "Parents d'enfants", icon: Users },
  { id: "at_risk", label: "Personnes à risque", icon: Users },
]

const supportedLanguages = [
  { code: "fr", label: "Français" },
  { code: "wolof", label: "Wolof" },
  { code: "poular", label: "Poular" },
]

export default function AlertSenderConnected({ onAlertSent }) {
  const [activeTab, setActiveTab] = useState("compose")
  const [formData, setFormData] = useState({
    title: "",
    level: "",
    regions: [],
    targetGroups: ["all"],
    message: { fr: "", wolof: "", poular: "" },
    currentLang: "fr",
    scheduleType: "immediate",
    scheduledDate: "",
    scheduledTime: "",
    priority: "medium",
    audioMessage: null,
    audioBlob: null,
  })

  const [sendingStatus, setSendingStatus] = useState({
    isLoading: false,
    progress: 0,
    sent: 0,
    total: 0,
    errors: [],
    success: false,
  })

  const [estimatedRecipients, setEstimatedRecipients] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false)

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  // Estimation du nombre de destinataires via API
  useEffect(() => {
    const fetchRecipients = async () => {
      if (formData.targetGroups.length === 0) {
        setEstimatedRecipients(0)
        return
      }

      setIsLoadingRecipients(true)
      try {
        const count = await alertApiService.getTargetedUsers(formData.regions, formData.targetGroups)
        setEstimatedRecipients(count)
      } catch (error) {
        console.error("Erreur estimation destinataires:", error)
        // Utiliser estimation locale en cas d'erreur
        const estimate = alertApiService.estimateUsers(formData.regions, formData.targetGroups)
        setEstimatedRecipients(estimate)
      } finally {
        setIsLoadingRecipients(false)
      }
    }

    const debounceTimer = setTimeout(fetchRecipients, 500)
    return () => clearTimeout(debounceTimer)
  }, [formData.targetGroups, formData.regions])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleMessageChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      message: { ...prev.message, [prev.currentLang]: value },
    }))
  }

  const handleRegionToggle = (region) => {
    setFormData((prev) => ({
      ...prev,
      regions: prev.regions.includes(region) ? prev.regions.filter((r) => r !== region) : [...prev.regions, region],
    }))
  }

  const handleTargetGroupToggle = (groupId) => {
    if (groupId === "all") {
      setFormData((prev) => ({
        ...prev,
        targetGroups: prev.targetGroups.includes("all") ? [] : ["all"],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        targetGroups: prev.targetGroups.includes("all")
          ? [groupId]
          : prev.targetGroups.includes(groupId)
            ? prev.targetGroups.filter((g) => g !== groupId)
            : [...prev.targetGroups.filter((g) => g !== "all"), groupId],
      }))
    }
  }

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("L'enregistrement audio n'est pas supporté par votre navigateur.")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        const audioUrl = URL.createObjectURL(audioBlob)
        setFormData((prev) => ({ ...prev, audioMessage: audioUrl, audioBlob }))
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (error) {
      alert("Erreur lors de l'accès au microphone : " + error.message)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
    }
    setIsRecording(false)
  }

  const resetRecording = () => {
    if (formData.audioMessage) {
      URL.revokeObjectURL(formData.audioMessage)
    }
    setFormData((prev) => ({ ...prev, audioMessage: null, audioBlob: null }))
  }

  const validateForm = () => {
    const errors = []

    if (!formData.title.trim()) errors.push("Le titre est requis")
    if (!formData.level) errors.push("Le niveau d'alerte est requis")
    if (formData.targetGroups.length === 0) errors.push("Au moins un groupe cible est requis")

    const hasMessage = Object.values(formData.message).some((msg) => msg.trim()) || formData.audioBlob
    if (!hasMessage) errors.push("Au moins un message dans une langue ou un audio est requis")

    if (formData.scheduleType === "scheduled") {
      if (!formData.scheduledDate) errors.push("La date de programmation est requise")
      if (!formData.scheduledTime) errors.push("L'heure de programmation est requise")
    }

    return errors
  }

  const handleSendAlert = async () => {
    const errors = validateForm()
    if (errors.length > 0) {
      alert("Erreurs de validation :\n" + errors.join("\n"))
      return
    }

    try {
      setSendingStatus({
        isLoading: true,
        progress: 0,
        sent: 0,
        total: estimatedRecipients,
        errors: [],
        success: false,
      })

      // Préparer les données pour l'API
      const alertData = {
        ...formData,
        adminName: "Admin", // Ou récupérer depuis le contexte utilisateur
      }

      // Simulation de progression pendant l'envoi
      const progressInterval = setInterval(() => {
        setSendingStatus((prev) => {
          if (prev.progress >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return {
            ...prev,
            progress: prev.progress + 10,
            sent: Math.floor(((prev.progress + 10) / 100) * prev.total),
          }
        })
      }, 300)

      // Appel API réel
      const result = await alertApiService.createAndSendAlert(alertData)

      clearInterval(progressInterval)

      setSendingStatus((prev) => ({
        ...prev,
        isLoading: false,
        progress: 100,
        sent: prev.total,
        success: true,
      }))

      if (onAlertSent) {
        onAlertSent({
          ...result,
          sentAt: new Date(),
          recipients: estimatedRecipients,
        })
      }

      alert("Alerte envoyée avec succès !")
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error)
      setSendingStatus((prev) => ({
        ...prev,
        isLoading: false,
        errors: [...prev.errors, error.message],
      }))
      alert("Erreur lors de l'envoi de l'alerte: " + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      level: "",
      regions: [],
      targetGroups: ["all"],
      message: { fr: "", wolof: "", poular: "" },
      currentLang: "fr",
      scheduleType: "immediate",
      scheduledDate: "",
      scheduledTime: "",
      priority: "medium",
      audioMessage: null,
      audioBlob: null,
    })
    setSendingStatus({
      isLoading: false,
      progress: 0,
      sent: 0,
      total: 0,
      errors: [],
      success: false,
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-orange-600 mb-2">Envoi d'Alertes Administrateur</h1>
        <p className="text-gray-600">Créez et envoyez des alertes personnalisées aux utilisateurs</p>
      </div>

      {/* Navigation par onglets */}
      <div className="flex border-b border-gray-200">
        {[
          { id: "compose", label: "Composer", icon: AlertTriangle },
          { id: "targeting", label: "Ciblage", icon: Users },
          { id: "send", label: "Envoi", icon: Send },
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
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
      {activeTab === "compose" && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Contenu de l'alerte
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Titre de l'alerte</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Ex: Alerte canicule - Dakar"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Niveau d'alerte</label>
              <select
                value={formData.level}
                onChange={(e) => handleInputChange("level", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="">Sélectionner le niveau</option>
                {alertLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-gray-700 font-medium">Message</label>
              <select
                value={formData.currentLang}
                onChange={(e) => handleInputChange("currentLang", e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                {supportedLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              value={formData.message[formData.currentLang]}
              onChange={(e) => handleMessageChange(e.target.value)}
              placeholder={`Rédigez votre message en ${formData.currentLang}...`}
              rows={4}
              disabled={formData.audioMessage !== null}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:bg-gray-100"
            />
            <div className="flex gap-1 mt-2">
              {Object.entries(formData.message).map(([lang, msg]) => (
                <span
                  key={lang}
                  className={`px-2 py-1 text-xs rounded ${
                    msg.trim() ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {lang.toUpperCase()} {msg.trim() && "✓"}
                </span>
              ))}
            </div>
          </div>

          {/* Enregistrement audio */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Message vocal (optionnel)</label>
            {!isRecording && !formData.audioMessage && (
              <button
                type="button"
                onClick={startRecording}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Mic className="w-5 h-5" />
                Démarrer l'enregistrement
              </button>
            )}
            {isRecording && (
              <button
                type="button"
                onClick={stopRecording}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition flex items-center gap-2"
              >
                <Mic className="w-5 h-5 animate-pulse" />
                Arrêter l'enregistrement
              </button>
            )}
            {formData.audioMessage && !isRecording && (
              <div className="mt-4 flex flex-col gap-2">
                <audio controls src={formData.audioMessage} />
                <button
                  type="button"
                  onClick={resetRecording}
                  className="text-red-600 underline hover:text-red-800 self-start"
                >
                  Réenregistrer
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "targeting" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Régions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-orange-600 flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5" />
                Régions cibles
              </h3>
              <p className="text-sm text-gray-600 mb-4">Sélectionnez les régions (vide = toutes les régions)</p>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {regionsSenegal.map((region) => (
                  <label key={region} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.regions.includes(region)}
                      onChange={() => handleRegionToggle(region)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm">{region}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Groupes cibles */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-orange-600 flex items-center gap-2 mb-4">
                <Users className="w-5 h-5" />
                Groupes cibles
              </h3>
              <p className="text-sm text-gray-600 mb-4">Sélectionnez les types d'utilisateurs</p>
              <div className="space-y-3">
                {targetGroups.map((group) => {
                  const Icon = group.icon
                  return (
                    <label key={group.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.targetGroups.includes(group.id)}
                        onChange={() => handleTargetGroupToggle(group.id)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <Icon className="w-4 h-4" />
                      <span>{group.label}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Estimation des destinataires */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="font-semibold text-blue-900">Destinataires estimés</p>
                <p className="text-sm text-blue-700">
                  Régions: {formData.regions.length === 0 ? "Toutes" : formData.regions.length} • Groupes:{" "}
                  {formData.targetGroups.length}
                </p>
              </div>
              <div className="text-right">
                {isLoadingRecipients ? (
                  <div className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-blue-700">Calcul...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-blue-900">{estimatedRecipients.toLocaleString()}</p>
                    <p className="text-sm text-blue-700">utilisateurs</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "send" && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-orange-600 flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5" />
              Programmation d'envoi
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Type d'envoi</label>
                <select
                  value={formData.scheduleType}
                  onChange={(e) => handleInputChange("scheduleType", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="immediate">Immédiat</option>
                  <option value="scheduled">Programmé</option>
                </select>
              </div>

              {formData.scheduleType === "scheduled" && (
                <>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Date</label>
                    <input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => handleInputChange("scheduledDate", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Heure</label>
                    <input
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) => handleInputChange("scheduledTime", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Statut d'envoi */}
          {sendingStatus.isLoading && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-orange-600 flex items-center gap-2 mb-4">
                <Send className="w-5 h-5 animate-pulse" />
                Envoi en cours...
              </h3>
              <div className="space-y-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${sendingStatus.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Envoyé: {sendingStatus.sent.toLocaleString()}</span>
                  <span>Total: {sendingStatus.total.toLocaleString()}</span>
                  <span>{Math.round(sendingStatus.progress)}%</span>
                </div>
              </div>
            </div>
          )}

          {sendingStatus.success && !sendingStatus.isLoading && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <div>
                  <h3 className="text-xl font-semibold text-green-700">Alerte envoyée avec succès !</h3>
                  <p className="text-gray-600">{sendingStatus.sent.toLocaleString()} utilisateurs ont reçu l'alerte</p>
                </div>
                <button
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Créer une nouvelle alerte
                </button>
              </div>
            </div>
          )}

          {sendingStatus.errors.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-red-700">Erreur lors de l'envoi</h3>
                  <div className="text-gray-600 space-y-1">
                    {sendingStatus.errors.map((error, index) => (
                      <p key={index}>{error}</p>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setSendingStatus((prev) => ({ ...prev, errors: [] }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Réessayer
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-4 justify-end">
            <button
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              disabled={sendingStatus.isLoading}
            >
              Réinitialiser
            </button>
            <button
              onClick={handleSendAlert}
              disabled={sendingStatus.isLoading || formData.targetGroups.length === 0}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-3 rounded-lg shadow transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {sendingStatus.isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {formData.scheduleType === "immediate" ? "Envoyer maintenant" : "Programmer l'envoi"}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
