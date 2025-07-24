"use client"

import { useState, useEffect, useMemo } from "react"
import { Download, Upload, Search, RefreshCw, Trash2, Eye } from "lucide-react"
import { bulletinApiService } from "../services/bulletinApiService"
import BulletinUploadModal from "./bulletin-upload-modal"

export default function MeteoBulletinsConnected() {
  const [regions, setRegions] = useState([
    "Tous",
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
  ])
  const [loadingRegions, setLoadingRegions] = useState(false)
  const [bulletins, setBulletins] = useState([])
  const [filterRegion, setFilterRegion] = useState("Tous")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [statistics, setStatistics] = useState({
    total_bulletins: 0,
    total_downloads: 0,
    bulletins_by_region: [],
    top_bulletins: [],
  })

  const regionsSenegal = [
    "Tous",
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

  // Charger les bulletins
  useEffect(() => {
    loadBulletins()
    loadStatistics()
    loadRegions() // Ajouter cette ligne
  }, [])

  // Recharger quand les filtres changent
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadBulletins()
    }, 300)
    return () => clearTimeout(debounceTimer)
  }, [filterRegion, searchTerm])

  const loadBulletins = async () => {
    try {
      setIsLoading(true)
      const filters = {
        region: filterRegion,
        search: searchTerm,
      }
      const response = await bulletinApiService.getBulletins(filters)
      setBulletins(response.results || response)
    } catch (error) {
      console.error("Erreur lors du chargement des bulletins:", error)
      // En cas d'erreur, garder les bulletins existants
    } finally {
      setIsLoading(false)
    }
  }

  const loadStatistics = async () => {
    try {
      const stats = await bulletinApiService.getBulletinStatistics()
      setStatistics(stats)
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error)
    }
  }

  // Ajouter cette méthode
  const loadRegions = async () => {
    try {
      setLoadingRegions(true)
      const regionsData = await bulletinApiService.getRegions()

      // S'assurer que regionsData est un tableau
      if (Array.isArray(regionsData)) {
        setRegions(["Tous", ...regionsData.map((r) => r.name)])
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

  const handleDownload = async (bulletin) => {
    try {
      await bulletinApiService.downloadBulletin(bulletin.id)

      // Mettre à jour le compteur local immédiatement
      setBulletins((prev) =>
        prev.map((b) => (b.id === bulletin.id ? { ...b, download_count: (b.download_count || 0) + 1 } : b)),
      )

      // Les statistiques seront automatiquement recalculées par l'useEffect
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error)
      alert("Erreur lors du téléchargement: " + error.message)
    }
  }

  const handleDelete = async (bulletin) => {
    if (window.confirm(`Voulez-vous vraiment supprimer le bulletin "${bulletin.title}" ?`)) {
      try {
        await bulletinApiService.deleteBulletin(bulletin.id)
        setBulletins((prev) => prev.filter((b) => b.id !== bulletin.id))
        // Les statistiques seront automatiquement recalculées par l'useEffect
        alert("Bulletin supprimé avec succès")
      } catch (error) {
        console.error("Erreur lors de la suppression:", error)
        alert("Erreur lors de la suppression: " + error.message)
      }
    }
  }

  const handleBulletinCreated = (newBulletin) => {
    setBulletins((prev) => [newBulletin, ...prev])
    // Les statistiques seront automatiquement recalculées par l'useEffect
  }

  const filteredBulletins = useMemo(() => {
    return bulletins.filter((b) => {
      const matchesRegion = filterRegion === "Tous" || b.region_name === filterRegion
      const matchesSearch =
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.region_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.description && b.description.toLowerCase().includes(searchTerm.toLowerCase()))
      return matchesRegion && matchesSearch
    })
  }, [bulletins, filterRegion, searchTerm])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatFileSize = (sizeInMB) => {
    if (sizeInMB < 1) {
      return `${Math.round(sizeInMB * 1024)} KB`
    }
    return `${sizeInMB} MB`
  }

  // Ajouter cet useEffect après les autres useEffect existants
  useEffect(() => {
    // Recalculer les statistiques locales basées sur les bulletins chargés
    if (bulletins.length > 0) {
      const localStats = {
        total_bulletins: bulletins.length,
        total_downloads: bulletins.reduce((sum, b) => sum + (b.download_count || 0), 0),
        bulletins_by_region: [],
        top_bulletins: bulletins.sort((a, b) => (b.download_count || 0) - (a.download_count || 0)),
      }

      // Calculer les bulletins par région
      const regionCounts = {}
      bulletins.forEach((b) => {
        regionCounts[b.region_name] = (regionCounts[b.region_name] || 0) + 1
      })

      localStats.bulletins_by_region = Object.entries(regionCounts)
        .map(([name, count]) => ({ region__name: name, count }))
        .sort((a, b) => b.count - a.count)

      setStatistics(localStats)
    }
  }, [bulletins])

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 via-white to-orange-50 max-w-6xl mx-auto">
      <h1 className="text-4xl font-extrabold mb-8 text-blue-700 text-center drop-shadow-md">
        Bulletins Météo Santé Sénégal
      </h1>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total bulletins</p>
              <p className="text-2xl font-bold text-blue-700">{statistics.total_bulletins}</p>
            </div>
            <Eye className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Téléchargements</p>
              <p className="text-2xl font-bold text-green-700">{statistics.total_downloads}</p>
            </div>
            <Download className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Région active</p>
              <p className="text-lg font-bold text-purple-700">
                {statistics.bulletins_by_region?.[0]?.region__name || "N/A"}
              </p>
            </div>
            <Search className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Plus téléchargé</p>
              <p className="text-sm font-bold text-orange-700">
                {statistics.top_bulletins?.[0]?.download_count || 0} téléch.
              </p>
            </div>
            <Upload className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filtre & recherche */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <label htmlFor="regionFilter" className="font-semibold text-blue-700">
            Filtrer par région :
          </label>
          {/* Dans le select des régions, remplacer regionsSenegal par regions : */}
          <select
            id="regionFilter"
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="border border-blue-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={loadingRegions}
          >
            {Array.isArray(regions) &&
              regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
          </select>
        </div>

        <div className="flex items-center gap-2 border border-blue-300 rounded px-3 py-2 focus-within:ring-2 focus-within:ring-blue-400">
          <Search className="text-blue-600" />
          <input
            type="text"
            placeholder="Rechercher un bulletin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="outline-none w-full"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadBulletins}
            className="flex items-center gap-2 bg-gray-600 text-white font-semibold px-4 py-2 rounded hover:bg-gray-700 transition"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Actualiser
          </button>
          <button
            className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-5 py-2 rounded hover:bg-blue-700 transition"
            onClick={() => setShowUploadModal(true)}
          >
            <Upload className="w-5 h-5" /> Ajouter un bulletin
          </button>
        </div>
      </div>

      {/* Tableau des bulletins */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead className="bg-blue-100 text-blue-700 font-semibold text-sm uppercase tracking-wide">
            <tr>
              <th className="p-4">Titre</th>
              <th className="p-4">Région</th>
              <th className="p-4">Date</th>
              <th className="p-4">Taille</th>
              <th className="p-4">Téléchargements</th>
              <th className="p-4">Créé par</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-gray-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Chargement des bulletins...
                </td>
              </tr>
            ) : filteredBulletins.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-gray-400">
                  Aucun bulletin trouvé.
                </td>
              </tr>
            ) : (
              filteredBulletins.map((bulletin) => (
                <tr key={bulletin.id} className="border-b hover:bg-blue-50 transition">
                  <td className="p-4 max-w-xl">
                    <div className="font-medium" title={bulletin.title}>
                      {bulletin.title}
                    </div>
                    {bulletin.description && (
                      <div className="text-sm text-gray-500 mt-1 truncate" title={bulletin.description}>
                        {bulletin.description}
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-semibold">{bulletin.region_name}</td>
                  <td className="p-4 text-sm">{formatDate(bulletin.created_at)}</td>
                  <td className="p-4 text-sm">{formatFileSize(bulletin.file_size_mb)}</td>
                  <td className="p-4">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                      {bulletin.download_count}
                    </span>
                  </td>
                  <td className="p-4 text-sm">{bulletin.created_by_name}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleDownload(bulletin)}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-sm"
                        title={`Télécharger ${bulletin.title}`}
                      >
                        <Download className="w-4 h-4" />
                        Télécharger
                      </button>
                      <button
                        onClick={() => handleDelete(bulletin)}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold text-sm ml-2"
                        title={`Supprimer ${bulletin.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal d'upload */}
      <BulletinUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onBulletinCreated={handleBulletinCreated}
      />
    </div>
  )
}
