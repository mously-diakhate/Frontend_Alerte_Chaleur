"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { Trash2, Filter, PlusCircle, Eye, Mic } from "lucide-react"
import { adminApiService } from "../services/adminApi"


const alertLevels = ["Très dangereux", "Dangereux", "Très inconfortable"]

const alertStatuses = ["Active", "Inactive"]

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

const supportedLanguages = [
  { code: "fr", label: "Français" },
  { code: "wolof", label: "Wolof" },
  { code: "poular", label: "Poular" },
]

export default function AdminAlerts() {
  const [alerts, setAlerts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterLevel, setFilterLevel] = useState("Tous")
  const [currentPage, setCurrentPage] = useState(1)
  const alertsPerPage = 4
  const [formData, setFormData] = useState({
    region: "",
    level: "",
    description: { fr: "", wolof: "", poular: "" },
    langSelected: "fr",
    is_active: true,
    audioMessage: null,
    audioBlob: null,
  })
  const [modalAlert, setModalAlert] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const [displayLang, setDisplayLang] = useState("fr")

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    try {
      setIsLoading(true)
      const response = await adminApiService.getAlerts()
      setAlerts(response.results || response)
    } catch (error) {
      console.error("Erreur lors du chargement des alertes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredAlerts = useMemo(() => {
    if (filterLevel === "Tous") return alerts
    return alerts.filter((a) => a.level === filterLevel)
  }, [filterLevel, alerts])

  const totalPages = Math.ceil(filteredAlerts.length / alertsPerPage)
  const currentAlerts = filteredAlerts.slice((currentPage - 1) * alertsPerPage, currentPage * alertsPerPage)

  const levelColor = (level) => {
    switch (level) {
      case "Très dangereux":
        return "bg-red-100 text-red-700"
      case "Dangereux":
        return "bg-orange-100 text-orange-700"
      case "Très inconfortable":
        return "bg-yellow-100 text-yellow-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const statusColor = (status) => {
    return status ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"
  }

  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette alerte ?")) {
      try {
        await adminApiService.deleteAlert(id)
        setAlerts((prev) => prev.filter((a) => a.id !== id))
        if (currentPage > 1 && currentAlerts.length === 1) {
          setCurrentPage(currentPage - 1)
        }
      } catch (error) {
        console.error("Erreur lors de la suppression:", error)
        alert("Erreur lors de la suppression de l'alerte")
      }
    }
  }

  const handleDescriptionChange = (e) => {
    const { value } = e.target
    setFormData((f) => ({
      ...f,
      description: { ...f.description, [formData.langSelected]: value },
    }))
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }))
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
        setFormData((f) => ({ ...f, audioMessage: audioUrl, audioBlob }))
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
    setFormData((f) => ({ ...f, audioMessage: null, audioBlob: null }))
  }

  const handleAddAlert = async (e) => {
    e.preventDefault()
    const { region, level, description, is_active, audioBlob } = formData

    const hasTextDescription = Object.values(description).some((text) => text && text.trim() !== "")

    if (!region || !level || (!hasTextDescription && !audioBlob)) {
      alert(
        "Merci de remplir tous les champs requis et d'entrer une description dans au moins une langue ou un message vocal.",
      )
      return
    }

    try {
      const alertData = {
        region,
        level,
        description,
        is_active,
      }

      if (audioBlob) {
        alertData.audio_message = audioBlob
      }

      const newAlert = await adminApiService.createAlert(alertData)
      setAlerts((prev) => [newAlert, ...prev])
      setFormData({
        region: "",
        level: "",
        description: { fr: "", wolof: "", poular: "" },
        langSelected: "fr",
        is_active: true,
        audioMessage: null,
        audioBlob: null,
      })
      setCurrentPage(1)
      alert("Alerte créée avec succès !")
    } catch (error) {
      console.error("Erreur lors de la création de l'alerte:", error)
      alert("Erreur lors de la création de l'alerte")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Chargement des alertes...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 p-8 max-w-7xl mx-auto">
      <h1 className="text-5xl font-extrabold mb-10 text-center text-orange-600 drop-shadow-md">
        Gestion des alertes <span className="text-gray-800">administrateur</span>
      </h1>

      {/* Formulaire ajout */}
      <section className="mb-12 bg-white rounded-lg shadow p-8">
        <h2 className="text-3xl font-semibold mb-6 text-orange-600 flex items-center gap-2">
          <PlusCircle className="w-8 h-8" />
          Ajouter une nouvelle alerte
        </h2>
        <form onSubmit={handleAddAlert} className="grid grid-cols-1 md:grid-cols-2 gap-6" noValidate>
          <div>
            <label htmlFor="region" className="block mb-2 font-semibold text-gray-700">
              Région
            </label>
            <select
              name="region"
              id="region"
              value={formData.region}
              onChange={handleInputChange}
              className="w-full border border-orange-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            >
              <option value="">-- Sélectionnez une région --</option>
              {regionsSenegal.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="level" className="block mb-2 font-semibold text-gray-700">
              Niveau d'alerte
            </label>
            <select
              name="level"
              id="level"
              value={formData.level}
              onChange={handleInputChange}
              className="w-full border border-orange-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            >
              <option value="">-- Sélectionnez un niveau --</option>
              {alertLevels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="langSelected" className="block mb-2 font-semibold text-gray-700">
              Langue de description
            </label>
            <select
              name="langSelected"
              id="langSelected"
              value={formData.langSelected}
              onChange={(e) => setFormData((f) => ({ ...f, langSelected: e.target.value }))}
              className="w-full border border-orange-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              {supportedLanguages.map(({ code, label }) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 font-semibold text-gray-700">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="rounded border-orange-300 text-orange-600 focus:ring-orange-500"
              />
              Alerte active
            </label>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="descriptionLang" className="block mb-2 font-semibold text-gray-700">
              Description ({supportedLanguages.find((l) => l.code === formData.langSelected)?.label})
            </label>
            <textarea
              name="descriptionLang"
              id="descriptionLang"
              value={formData.description[formData.langSelected]}
              onChange={handleDescriptionChange}
              rows={4}
              className="w-full border border-orange-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Entrez une description précise des risques et recommandations"
              disabled={formData.audioMessage !== null}
            />
            <small className="text-gray-500">
              Vous pouvez saisir une description dans la langue sélectionnée. Si un message vocal est enregistré, la
              saisie texte est désactivée.
            </small>
          </div>

          <div className="md:col-span-2">
            <label className="block mb-2 font-semibold text-gray-700">Message vocal (enregistrement)</label>
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
            <small className="text-gray-500 block mt-1">
              Vous pouvez soit saisir un texte, soit enregistrer un message vocal.
            </small>
          </div>

          <div className="md:col-span-2 text-right">
            <button
              type="submit"
              className="bg-orange-600 text-white font-bold px-8 py-3 rounded shadow hover:bg-orange-700 transition"
            >
              Ajouter l'alerte
            </button>
          </div>
        </form>
      </section>

      {/* Choix de la langue d'affichage */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2 text-orange-600 font-semibold text-lg">
          <label htmlFor="displayLangSelect">Afficher la description en :</label>
          <select
            id="displayLangSelect"
            value={displayLang}
            onChange={(e) => setDisplayLang(e.target.value)}
            className="border border-orange-300 rounded px-4 py-2 font-semibold text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
          >
            {supportedLanguages.map(({ code, label }) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 text-orange-600 font-semibold text-lg">
          <Filter className="w-6 h-6" />
          <label htmlFor="levelFilter">Filtrer par niveau :</label>
        </div>
        <select
          id="levelFilter"
          value={filterLevel}
          onChange={(e) => {
            setFilterLevel(e.target.value)
            setCurrentPage(1)
          }}
          className="border border-orange-300 rounded px-4 py-2 font-semibold text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
        >
          <option value="Tous">Tous</option>
          {alertLevels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto rounded-lg shadow-lg bg-white">
        <table className="w-full text-left border-collapse">
          <thead className="bg-orange-100 text-orange-700 uppercase font-semibold text-sm tracking-wide">
            <tr>
              <th className="p-4">Région</th>
              <th className="p-4">Niveau d'alerte</th>
              <th className="p-4">Description</th>
              <th className="p-4">Statut</th>
              <th className="p-4">Date</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentAlerts.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-gray-400 text-lg">
                  Aucune alerte disponible.
                </td>
              </tr>
            ) : (
              currentAlerts.map((alert) => (
                <tr key={alert.id} className="border-b hover:bg-orange-50 transition cursor-default">
                  <td className="p-4 font-semibold text-gray-800">{alert.region}</td>
                  <td className={`p-4 font-bold rounded-md w-max ${levelColor(alert.level)}`}>{alert.level}</td>
                  <td
                    className="p-4 max-w-xs truncate"
                    title={
                      alert.description && alert.description[displayLang]
                        ? alert.description[displayLang]
                        : "Pas de description dans cette langue"
                    }
                  >
                    {alert.description && alert.description[displayLang] ? (
                      alert.description[displayLang]
                    ) : (
                      <em>Pas de description dans cette langue</em>
                    )}
                    {alert.audio_message && (
                      <div className="mt-2">
                        <audio controls src={alert.audio_message} />
                      </div>
                    )}
                  </td>
                  <td className={`p-4 font-semibold rounded-md w-max ${statusColor(alert.is_active)}`}>
                    {alert.is_active ? "Active" : "Inactive"}
                  </td>
                  <td className="p-4">{new Date(alert.created_at).toLocaleDateString()}</td>
                  <td className="p-4 flex gap-2">
                    <button
                      onClick={() => setModalAlert(alert)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition font-semibold"
                      title="Voir détails"
                    >
                      <Eye className="w-5 h-5" /> Détails
                    </button>
                    <button
                      onClick={() => handleDelete(alert.id)}
                      className="flex items-center gap-2 text-red-600 hover:text-red-800 transition font-semibold"
                      aria-label={`Supprimer l'alerte de ${alert.region}`}
                      title="Supprimer l'alerte"
                    >
                      <Trash2 className="w-5 h-5" /> Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-4 text-orange-700 font-semibold">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className={`px-5 py-2 rounded-full border border-orange-400 hover:bg-orange-200 transition ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Précédent
          </button>
          <span>
            Page <span className="font-bold">{currentPage}</span> sur <span className="font-bold">{totalPages}</span>
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-5 py-2 rounded-full border border-orange-400 hover:bg-orange-200 transition ${
              currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Suivant
          </button>
        </div>
      )}

      {/* Modal détails */}
      {modalAlert && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setModalAlert(null)}
        >
          <div className="bg-white rounded-lg max-w-lg w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setModalAlert(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              aria-label="Fermer modal"
            >
              &#10005;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-orange-600">Détails de l'alerte</h2>
            <p>
              <strong>Région :</strong> {modalAlert.region}
            </p>
            <p>
              <strong>Niveau d'alerte :</strong> {modalAlert.level}
            </p>
            <p>
              <strong>Description ({displayLang}) :</strong>
            </p>
            <p className="mb-4 whitespace-pre-wrap">
              {modalAlert.description && modalAlert.description[displayLang] ? (
                modalAlert.description[displayLang]
              ) : (
                <em>Aucune description dans cette langue</em>
              )}
            </p>
            {modalAlert.audio_message && (
              <div className="mb-4">
                <strong>Message vocal :</strong>
                <audio controls src={modalAlert.audio_message} className="mt-2" />
              </div>
            )}
            <p>
              <strong>Statut :</strong> {modalAlert.is_active ? "Active" : "Inactive"}
            </p>
            <p>
              <strong>Date :</strong> {new Date(modalAlert.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
