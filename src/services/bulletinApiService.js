const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api"

class BulletinApiService {
  async getAuthHeaders() {
    const token = localStorage.getItem("access_token") || localStorage.getItem("authToken")
    if (!token) {
      throw new Error("Token d'authentification manquant")
    }
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }
  }

  async getAuthHeadersForFormData() {
    const token = localStorage.getItem("access_token") || localStorage.getItem("authToken")
    if (!token) {
      throw new Error("Token d'authentification manquant")
    }
    return {
      Authorization: `Bearer ${token}`,
    }
  }

  // Ajouter cette méthode après getAuthHeadersForFormData()
  async getRegions() {
    try {
      const response = await fetch(`${API_BASE_URL}/weather/regions/`)

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Données régions reçues:", data)

      // Gérer différents formats de réponse
      if (Array.isArray(data)) {
        return data
      } else if (data && data.results && Array.isArray(data.results)) {
        return data.results
      } else {
        console.warn("Format de réponse inattendu pour les régions:", data)
        throw new Error("Format de données invalide")
      }
    } catch (error) {
      console.error("Erreur getRegions:", error)
      // Retourner une liste par défaut en cas d'erreur
      return [
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
      ]
    }
  }

  // Récupérer tous les bulletins avec filtres
  async getBulletins(filters = {}) {
    try {
      const params = new URLSearchParams()
      if (filters.region && filters.region !== "Tous") {
        params.append("region", filters.region)
      }
      if (filters.search) {
        params.append("search", filters.search)
      }

      const response = await fetch(`${API_BASE_URL}/bulletins/?${params}`)

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      console.error("Erreur getBulletins:", error)
      throw error
    }
  }

  // Modifier la méthode createBulletin pour gérer l'ID de région
  async createBulletin(bulletinData) {
    try {
      console.log("=== DÉBUT CRÉATION BULLETIN ===")
      console.log("Données d'entrée:", bulletinData)

      const formData = new FormData()

      // Validation des données requises
      if (!bulletinData.title || !bulletinData.title.trim()) {
        throw new Error("Le titre est requis")
      }
      if (!bulletinData.region) {
        throw new Error("La région est requise")
      }
      if (!bulletinData.file) {
        throw new Error("Le fichier est requis")
      }

      // Récupérer les régions pour obtenir l'ID
      let regionId = bulletinData.region

      // Si bulletinData.region est un nom (string), trouver l'ID correspondant
      if (typeof bulletinData.region === "string" && isNaN(bulletinData.region)) {
        console.log("Recherche de l'ID pour la région:", bulletinData.region)

        try {
          const regions = await this.getRegions()
          const foundRegion = regions.find((r) => r.name === bulletinData.region)

          if (foundRegion) {
            regionId = foundRegion.id
            console.log(`Région trouvée: ${bulletinData.region} -> ID: ${regionId}`)
          } else {
            throw new Error(`Région "${bulletinData.region}" non trouvée`)
          }
        } catch (regionError) {
          console.error("Erreur lors de la recherche de région:", regionError)
          throw new Error(`Impossible de trouver la région "${bulletinData.region}"`)
        }
      }

      // Ajouter les champs au FormData
      formData.append("title", bulletinData.title)
      formData.append("region", regionId) // Utiliser l'ID de la région
      formData.append("description", bulletinData.description || "")
      formData.append("file", bulletinData.file)

      // Debug: Afficher toutes les données du FormData
      console.log("=== CONTENU FORMDATA ===")
      for (const [key, value] of formData.entries()) {
        if (key === "file") {
          console.log(`${key}: ${value.name} (${value.size} bytes)`)
        } else {
          console.log(`${key}: ${value}`)
        }
      }

      const headers = await this.getAuthHeadersForFormData()
      console.log("Headers d'authentification:", headers)

      console.log("=== ENVOI REQUÊTE ===")
      console.log("URL:", `${API_BASE_URL}/bulletins/create/`)

      const response = await fetch(`${API_BASE_URL}/bulletins/create/`, {
        method: "POST",
        headers: headers,
        body: formData,
      })

      console.log("=== RÉPONSE SERVEUR ===")
      console.log("Status:", response.status)
      console.log("Status Text:", response.statusText)

      const responseText = await response.text()
      console.log("Réponse brute:", responseText)

      if (!response.ok) {
        let errorData
        try {
          errorData = JSON.parse(responseText)
          console.log("Erreur parsée:", errorData)
        } catch (parseError) {
          console.log("Impossible de parser la réponse JSON:", parseError)
          errorData = { error: responseText }
        }

        if (response.status === 400) {
          // Erreur de validation - afficher les détails
          console.error("=== ERREUR 400 - DÉTAILS ===")
          if (errorData.errors || errorData.error || errorData.region) {
            const errorDetails = errorData.errors || errorData.error || errorData
            console.error("Détails de validation:", errorDetails)

            if (typeof errorDetails === "object") {
              const errorMessages = []
              for (const [field, messages] of Object.entries(errorDetails)) {
                if (Array.isArray(messages)) {
                  errorMessages.push(`${field}: ${messages.join(", ")}`)
                } else {
                  errorMessages.push(`${field}: ${messages}`)
                }
              }
              throw new Error(`Erreurs de validation:\n${errorMessages.join("\n")}`)
            } else {
              throw new Error(`Erreur de validation: ${errorDetails}`)
            }
          } else {
            throw new Error(`Erreur 400: ${responseText}`)
          }
        } else if (response.status === 401) {
          throw new Error("Non autorisé - Veuillez vous reconnecter")
        } else if (response.status === 403) {
          throw new Error(`Accès refusé: ${errorData.error || "Permissions insuffisantes"}`)
        }

        throw new Error(errorData.detail || errorData.error || `Erreur ${response.status}: ${responseText}`)
      }

      let result
      try {
        result = JSON.parse(responseText)
        console.log("=== SUCCÈS ===")
        console.log("Bulletin créé:", result)
      } catch (parseError) {
        console.error("Erreur parsing réponse succès:", parseError)
        throw new Error("Réponse serveur invalide")
      }

      return result
    } catch (error) {
      console.error("=== ERREUR FINALE ===")
      console.error("Type:", error.constructor.name)
      console.error("Message:", error.message)
      console.error("Stack:", error.stack)
      throw error
    }
  }

  // Télécharger un bulletin
  async downloadBulletin(bulletinId) {
    try {
      const response = await fetch(`${API_BASE_URL}/bulletins/${bulletinId}/download/`)

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }

      // Récupérer le nom du fichier depuis les headers
      const contentDisposition = response.headers.get("Content-Disposition")
      let filename = `bulletin_${bulletinId}.pdf`

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }

      // Créer un blob et déclencher le téléchargement
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      return { success: true, filename }
    } catch (error) {
      console.error("Erreur downloadBulletin:", error)
      throw error
    }
  }

  // Obtenir les statistiques des bulletins
  async getBulletinStatistics() {
    try {
      const response = await fetch(`${API_BASE_URL}/bulletins/stats/`, {
        headers: await this.getAuthHeaders(),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Non autorisé - Veuillez vous reconnecter")
        }
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      console.error("Erreur getBulletinStatistics:", error)
      throw error
    }
  }

  // Supprimer un bulletin
  async deleteBulletin(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/bulletins/${id}/`, {
        method: "DELETE",
        headers: await this.getAuthHeaders(),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Non autorisé - Veuillez vous reconnecter")
        }
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error("Erreur deleteBulletin:", error)
      throw error
    }
  }

  // Obtenir les détails d'un bulletin
  async getBulletinDetails(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/bulletins/${id}/`, {
        headers: await this.getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      console.error("Erreur getBulletinDetails:", error)
      throw error
    }
  }
}

export const bulletinApiService = new BulletinApiService()
