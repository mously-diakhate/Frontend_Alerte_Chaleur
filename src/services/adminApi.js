const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

class AdminApiService {
  async getAuthHeaders() {
    const token = localStorage.getItem("authToken") || localStorage.getItem("token")

    if (!token) {
      throw new Error("Token d'authentification manquant")
    }

    // Django REST Framework utilise "Token" au lieu de "Bearer"
    return {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    }
  }

  async getAuthHeadersForFormData() {
    const token = localStorage.getItem("authToken") || localStorage.getItem("token")

    if (!token) {
      throw new Error("Token d'authentification manquant")
    }

    // Pour FormData, ne pas définir Content-Type
    return {
      Authorization: `Token ${token}`,
    }
  }

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

  async createAlert(alertData) {
    try {
      console.log("Création d'alerte avec:", alertData)

      const formData = new FormData()

      // Mapper les champs selon votre modèle Django
      formData.append("region", alertData.region)
      formData.append("alert_level", alertData.level)
      formData.append("description_fr", alertData.description.fr || "")
      formData.append("description_wolof", alertData.description.wolof || "")
      formData.append("description_poular", alertData.description.poular || "")
      formData.append("admin_name", "Admin")
      formData.append("status", alertData.is_active ? "active" : "inactive")

      // Ajouter l'audio si présent
      if (alertData.audio_message) {
        console.log("Traitement audio...")
        try {
          const reader = new FileReader()
          const audioBase64 = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result)
            reader.onerror = reject
            reader.readAsDataURL(alertData.audio_message)
          })
          formData.append("audio_blob", audioBase64)
          console.log("Audio ajouté")
        } catch (audioError) {
          console.error("Erreur audio:", audioError)
        }
      }

      // Debug: afficher le contenu du FormData
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, typeof value === "string" ? value.substring(0, 100) : value)
      }

      const headers = await this.getAuthHeadersForFormData()
      console.log("Headers:", headers)

      const response = await fetch(`${API_BASE_URL}/alerts/admin/`, {
        method: "POST",
        headers: headers,
        body: formData,
      })

      console.log("Réponse:", response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Erreur réponse:", errorText)

        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText }
        }

        if (response.status === 401) {
          throw new Error("Non autorisé - Veuillez vous reconnecter")
        }
        throw new Error(errorData.detail || errorData.error || `Erreur ${response.status}`)
      }

      const result = await response.json()
      console.log("Alerte créée:", result)
      return result
    } catch (error) {
      console.error("Erreur createAlert:", error)
      throw error
    }
  }

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

  async getStatistics() {
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
      console.error("Erreur getStatistics:", error)
      throw error
    }
  }
}

export const adminApiService = new AdminApiService()
