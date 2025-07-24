const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api"

class ApiService {
  constructor(baseURL) {
    this.baseURL = baseURL
    this.token = localStorage.getItem("access_token")
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const headers = {
      "Content-Type": "application/json",
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw { response: { data: errorData, status: response.status } }
      }

      return await response.json()
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // Authentification
  async login(email, password) {
    const response = await this.request("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })

    if (response.tokens) {
      this.token = response.tokens.access
      localStorage.setItem("access_token", response.tokens.access)
      localStorage.setItem("refresh_token", response.tokens.refresh)
    }

    return response
  }

  async register(userData) {
    const response = await this.request("/auth/register/", {
      method: "POST",
      body: JSON.stringify(userData),
    })

    if (response.tokens) {
      this.token = response.tokens.access
      localStorage.setItem("access_token", response.tokens.access)
      localStorage.setItem("refresh_token", response.tokens.refresh)
    }

    return response
  }

  async adminLogin(username, password) {
    const response = await this.request("/auth/admin-login/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    })

    if (response.tokens) {
      this.token = response.tokens.access
      localStorage.setItem("access_token", response.tokens.access)
      localStorage.setItem("refresh_token", response.tokens.refresh)
    }

    return response
  }

  async logout() {
    const refreshToken = localStorage.getItem("refresh_token")
    if (refreshToken) {
      await this.request("/auth/logout/", {
        method: "POST",
        body: JSON.stringify({ refresh: refreshToken }),
      })
    }

    this.token = null
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
  }

  async getProfile() {
    return await this.request("/auth/profile/")
  }

  // Alertes personnalisées
  async getPersonalizedAlert() {
    return await this.request("/alerts/personalized/")
  }

  // Structures de santé
  async getHealthStructures(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return await this.request(`/health-structures/${queryParams ? `?${queryParams}` : ""}`)
  }

  async addHealthStructure(structureData) {
    return await this.request("/health-structures/add/", {
      method: "POST",
      body: JSON.stringify(structureData),
    })
  }

  // Données météo
  async getRegions() {
    return await this.request("/weather/regions/")
  }

  async getCurrentWeather() {
    return await this.request("/weather/current/")
  }

  async getActiveAlerts() {
    return await this.request("/weather/alerts/")
  }

  async getEmergencyContacts(region) {
    const queryParams = region ? `?region=${region}` : ""
    return await this.request(`/health-structures/emergency-contacts/${queryParams}`)
  }
}

export const apiService = new ApiService(API_BASE_URL)
