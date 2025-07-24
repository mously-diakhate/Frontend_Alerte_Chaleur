const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api"

class AlertApiService {
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

  // Récupérer toutes les alertes avec filtres
  async getAlerts(filters = {}) {
    try {
      const params = new URLSearchParams()
      if (filters.level && filters.level !== "Tous") {
        params.append("level", filters.level)
      }
      if (filters.region) {
        params.append("region", filters.region)
      }
      if (filters.status) {
        params.append("status", filters.status)
      }

      const response = await fetch(`${API_BASE_URL}/alerts/admin/?${params}`, {
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
      console.error("Erreur getAlerts:", error)
      throw error
    }
  }

  // Créer et envoyer une nouvelle alerte avec debug amélioré
  async createAndSendAlert(alertData) {
    try {
      console.log("=== DÉBUT DEBUG ENVOI ALERTE ===")
      console.log("Données d'entrée:", alertData)

      const formData = new FormData()

      // Validation des données requises
      if (!alertData.title || !alertData.title.trim()) {
        throw new Error("Le titre est requis")
      }
      if (!alertData.level) {
        throw new Error("Le niveau d'alerte est requis")
      }

      // Mapper les champs selon votre modèle Django
      const region = alertData.regions && alertData.regions.length > 0 ? alertData.regions[0] : "Dakar"
      const alertLevel = this.mapAlertLevel(alertData.level)

      console.log("Région sélectionnée:", region)
      console.log("Niveau d'alerte mappé:", alertLevel)

      formData.append("region", region)
      formData.append("alert_level", alertLevel)
      formData.append("description_fr", alertData.message?.fr || "")
      formData.append("description_wolof", alertData.message?.wolof || "")
      formData.append("description_poular", alertData.message?.poular || "")
      formData.append("admin_name", alertData.adminName || "Admin")
      formData.append("status", "active")

      // Ajouter métadonnées d'envoi
      formData.append("title", alertData.title)
      formData.append("target_groups", JSON.stringify(alertData.targetGroups || ["all"]))
      formData.append("target_regions", JSON.stringify(alertData.regions || []))
      formData.append("priority", alertData.priority || "medium")
      formData.append("schedule_type", alertData.scheduleType || "immediate")

      if (alertData.scheduleType === "scheduled") {
        if (alertData.scheduledDate) formData.append("scheduled_date", alertData.scheduledDate)
        if (alertData.scheduledTime) formData.append("scheduled_time", alertData.scheduledTime)
      }

      // Ajouter l'audio si présent
      if (alertData.audioBlob) {
        console.log("Traitement audio...")
        try {
          const reader = new FileReader()
          const audioBase64 = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result)
            reader.onerror = reject
            reader.readAsDataURL(alertData.audioBlob)
          })
          formData.append("audio_blob", audioBase64)
          console.log("Audio ajouté avec succès")
        } catch (audioError) {
          console.error("Erreur audio:", audioError)
        }
      }

      // Debug: Afficher toutes les données du FormData
      console.log("=== CONTENU FORMDATA ===")
      for (const [key, value] of formData.entries()) {
        if (key === "audio_blob") {
          console.log(`${key}: [AUDIO DATA - ${value.length} caractères]`)
        } else {
          console.log(`${key}: ${value}`)
        }
      }

      const headers = await this.getAuthHeadersForFormData()
      console.log("Headers d'authentification:", headers)

      console.log("=== ENVOI REQUÊTE ===")
      console.log("URL:", `${API_BASE_URL}/alerts/admin/send/`)

      const response = await fetch(`${API_BASE_URL}/alerts/admin/send/`, {
        method: "POST",
        headers: headers,
        body: formData,
      })

      console.log("=== RÉPONSE SERVEUR ===")
      console.log("Status:", response.status)
      console.log("Status Text:", response.statusText)
      console.log("Headers:", Object.fromEntries(response.headers.entries()))

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
          if (errorData.errors || errorData.error) {
            const errorDetails = errorData.errors || errorData.error
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
        console.log("Alerte créée:", result)
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

  // Obtenir les statistiques d'envoi
  async getSendingStatistics() {
    try {
      const response = await fetch(`${API_BASE_URL}/alerts/admin/statistics/`, {
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
      console.error("Erreur getSendingStatistics:", error)
      throw error
    }
  }

  // Obtenir les utilisateurs par région et groupe
  async getTargetedUsers(regions = [], targetGroups = []) {
    try {
      const params = new URLSearchParams()
      if (regions.length > 0) {
        params.append("regions", regions.join(","))
      }
      if (targetGroups.length > 0) {
        params.append("target_groups", targetGroups.join(","))
      }

      const response = await fetch(`${API_BASE_URL}/alerts/admin/targeted-users/?${params}`, {
        headers: await this.getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      return result.count || 0
    } catch (error) {
      console.error("Erreur getTargetedUsers:", error)
      // Retourner une estimation en cas d'erreur
      return this.estimateUsers(regions, targetGroups)
    }
  }

  // Estimation locale en cas d'erreur API
  estimateUsers(regions, targetGroups) {
    const base = 1000
    let multiplier = 1

    if (targetGroups.includes("all")) {
      multiplier = 1
    } else {
      multiplier = targetGroups.length * 0.3
    }

    const regionMultiplier = regions.length === 0 ? 1 : regions.length * 0.2
    return Math.floor(base * multiplier * regionMultiplier)
  }

  // Mapper les niveaux d'alerte vers le format backend
  mapAlertLevel(level) {
    // Vérifier d'abord les choix exacts du modèle Django
    const mapping = {
      tres_dangereux: "tres_dangereux", // Garder la clé originale
      dangereux: "dangereux", // Garder la clé originale
      tres_inconfortable: "tres_inconfortable", // Garder la clé originale
      inconfortable: "inconfortable", // Garder la clé originale
    }

    console.log(`Mapping niveau: ${level} -> ${mapping[level] || level}`)
    return mapping[level] || level
  }

  // Supprimer une alerte
  async deleteAlert(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/alerts/admin/${id}/`, {
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
      console.error("Erreur deleteAlert:", error)
      throw error
    }
  }

  // Obtenir les détails d'une alerte
  async getAlertDetails(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/alerts/admin/${id}/`, {
        headers: await this.getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      console.error("Erreur getAlertDetails:", error)
      throw error
    }
  }
}

export const alertApiService = new AlertApiService()
