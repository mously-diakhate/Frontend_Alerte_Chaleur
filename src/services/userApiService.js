const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api"

class UserApiService {
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

  // Récupérer tous les utilisateurs avec filtres
  async getUsers(filters = {}) {
    try {
      const params = new URLSearchParams()
      if (filters.role && filters.role !== "Tous") {
        params.append("role", filters.role)
      }
      if (filters.region && filters.region !== "Tous") {
        params.append("region", filters.region)
      }
      if (filters.status) {
        params.append("status", filters.status)
      }
      if (filters.search) {
        params.append("search", filters.search)
      }

      const response = await fetch(`${API_BASE_URL}/users/admin/?${params}`, {
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
      console.error("Erreur getUsers:", error)
      throw error
    }
  }

  // Créer un nouvel utilisateur
  async createUser(userData) {
    try {
      console.log("=== DÉBUT CRÉATION UTILISATEUR ===")
      console.log("Données d'entrée:", userData)

      // Validation des données requises
      if (!userData.email || !userData.email.trim()) {
        throw new Error("L'email est requis")
      }
      if (!userData.username || !userData.username.trim()) {
        throw new Error("Le nom d'utilisateur est requis")
      }
      if (!userData.full_name || !userData.full_name.trim()) {
        throw new Error("Le nom complet est requis")
      }

      const response = await fetch(`${API_BASE_URL}/users/admin/`, {
        method: "POST",
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(userData),
      })

      console.log("=== RÉPONSE SERVEUR ===")
      console.log("Status:", response.status)

      const responseText = await response.text()
      console.log("Réponse brute:", responseText)

      if (!response.ok) {
        let errorData
        try {
          errorData = JSON.parse(responseText)
        } catch (parseError) {
          errorData = { error: responseText }
        }

        if (response.status === 400) {
          if (typeof errorData.error === "string") {
            throw new Error(errorData.error)
          } else if (errorData.error && typeof errorData.error === "object") {
            const errorMessages = []
            for (const [field, messages] of Object.entries(errorData.error)) {
              if (Array.isArray(messages)) {
                errorMessages.push(`${field}: ${messages.join(", ")}`)
              } else {
                errorMessages.push(`${field}: ${messages}`)
              }
            }
            throw new Error(`Erreurs de validation:\n${errorMessages.join("\n")}`)
          } else {
            throw new Error(`Erreur 400: ${responseText}`)
          }
        } else if (response.status === 401) {
          throw new Error("Non autorisé - Veuillez vous reconnecter")
        } else if (response.status === 403) {
          throw new Error(`Accès refusé: ${errorData.error || "Permissions insuffisantes"}`)
        }

        throw new Error(errorData.error || `Erreur ${response.status}: ${responseText}`)
      }

      const result = JSON.parse(responseText)
      console.log("=== SUCCÈS ===")
      console.log("Utilisateur créé:", result)
      return result
    } catch (error) {
      console.error("=== ERREUR FINALE ===")
      console.error("Message:", error.message)
      throw error
    }
  }

  // Modifier un utilisateur
  async updateUser(userId, userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/admin/${userId}/`, {
        method: "PUT",
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 401) {
          throw new Error("Non autorisé - Veuillez vous reconnecter")
        } else if (response.status === 403) {
          throw new Error("Accès refusé")
        }
        throw new Error(errorData.error || `Erreur ${response.status}`)
      }

      return response.json()
    } catch (error) {
      console.error("Erreur updateUser:", error)
      throw error
    }
  }

  // Supprimer un utilisateur
  async deleteUser(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/admin/${userId}/`, {
        method: "DELETE",
        headers: await this.getAuthHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 401) {
          throw new Error("Non autorisé - Veuillez vous reconnecter")
        } else if (response.status === 403) {
          throw new Error("Accès refusé")
        }
        throw new Error(errorData.error || `Erreur ${response.status}`)
      }
    } catch (error) {
      console.error("Erreur deleteUser:", error)
      throw error
    }
  }

  // Activer/désactiver un utilisateur
  async toggleUserStatus(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/admin/${userId}/toggle-status/`, {
        method: "POST",
        headers: await this.getAuthHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 401) {
          throw new Error("Non autorisé - Veuillez vous reconnecter")
        } else if (response.status === 403) {
          throw new Error("Accès refusé")
        }
        throw new Error(errorData.error || `Erreur ${response.status}`)
      }

      return response.json()
    } catch (error) {
      console.error("Erreur toggleUserStatus:", error)
      throw error
    }
  }

  // Obtenir les statistiques des utilisateurs
  async getUserStatistics() {
    try {
      const response = await fetch(`${API_BASE_URL}/users/admin/statistics/`, {
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
      console.error("Erreur getUserStatistics:", error)
      throw error
    }
  }

  // Obtenir la liste des régions
  async getRegions() {
    try {
      const response = await fetch(`${API_BASE_URL}/users/admin/regions/`, {
        headers: await this.getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data.regions || []
    } catch (error) {
      console.error("Erreur getRegions:", error)
      // Retourner une liste par défaut
      return [
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
    }
  }

  // Obtenir les choix de situation
  async getSituationChoices() {
    try {
      const response = await fetch(`${API_BASE_URL}/users/admin/situation-choices/`, {
        headers: await this.getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data.choices || []
    } catch (error) {
      console.error("Erreur getSituationChoices:", error)
      // Retourner une liste par défaut
      return [
        { value: "personne_agee", label: "Personne âgée" },
        { value: "femme_enceinte", label: "Femme enceinte" },
        { value: "personne_risque", label: "Personne à risque" },
        { value: "enfant", label: "Enfant" },
        { value: "aucune", label: "Aucune situation particulière" },
      ]
    }
  }

  // Obtenir les détails d'un utilisateur
  async getUserDetails(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/admin/${userId}/`, {
        headers: await this.getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      console.error("Erreur getUserDetails:", error)
      throw error
    }
  }
}

export const userApiService = new UserApiService()
