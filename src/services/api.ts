const API_BASE_URL = "http://127.0.0.1:8000/api"

// Configuration axios ou fetch
class ApiService {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.token = localStorage.getItem("access_token")
  }

  private async request(endpoint: string, options: RequestInit = {}) {
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
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // Authentification
  async login(email: string, password: string) {
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

  async register(userData: {
    email: string
    username: string
    password: string
    password_confirm: string
    full_name?: string
    situation?: string
    region?: string
    phone_number?: string
  }) {
    return await this.request("/auth/register/", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async adminLogin(username: string, password: string) {
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

  async getWeatherHistory(regionId: number) {
    return await this.request(`/weather/history/${regionId}/`)
  }

  // Structures de santé
  async getHealthStructures(params?: { region?: string; type?: string }) {
    const queryParams = new URLSearchParams(params).toString()
    return await this.request(`/health-structures/${queryParams ? `?${queryParams}` : ""}`)
  }

  async getEmergencyContacts(region?: string) {
    const queryParams = region ? `?region=${region}` : ""
    return await this.request(`/health-structures/emergency-contacts/${queryParams}`)
  }

  async getNearbyStructures(lat: number, lon: number) {
    return await this.request(`/health-structures/nearby/?lat=${lat}&lon=${lon}`)
  }

  // Alertes personnalisées
  async getUserAlerts() {
    return await this.request("/alerts/user/")
  }

  async getPersonalizedAlert() {
    return await this.request("/alerts/personalized/")
  }

  async markAlertAsRead(alertId: number) {
    return await this.request(`/alerts/${alertId}/read/`, {
      method: "POST",
    })
  }

  // Admin APIs
  async getDashboardStats() {
    return await this.request("/admin/stats/")
  }

  async getAdminUsers(params?: { role?: string; search?: string; status?: string }) {
    const queryParams = new URLSearchParams(params).toString()
    return await this.request(`/admin/users/${queryParams ? `?${queryParams}` : ""}`)
  }

  async createUser(userData: any) {
    return await this.request("/admin/users/create/", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async updateUser(userId: number, userData: any) {
    return await this.request(`/admin/users/${userId}/`, {
      method: "PUT",
      body: JSON.stringify(userData),
    })
  }

  async deleteUser(userId: number) {
    return await this.request(`/admin/users/${userId}/`, {
      method: "DELETE",
    })
  }

  // Bulletins
  async getBulletins(params?: { region?: string; search?: string }) {
    const queryParams = new URLSearchParams(params).toString()
    return await this.request(`/bulletins/${queryParams ? `?${queryParams}` : ""}`)
  }

  async uploadBulletin(formData: FormData) {
    return await fetch(`${this.baseURL}/bulletins/create/`, {
      method: "POST",
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    }).then((res) => res.json())
  }

  async downloadBulletin(bulletinId: number) {
    return `${this.baseURL}/bulletins/${bulletinId}/download/`
  }

  // Alertes multilingues (Admin)
  async getAdminAlerts(params?: { level?: string; region?: string; status?: string }) {
    const queryParams = new URLSearchParams(params).toString()
    return await this.request(`/alerts/admin/${queryParams ? `?${queryParams}` : ""}`)
  }

  async createAdminAlert(alertData: any) {
    return await this.request("/alerts/admin/", {
      method: "POST",
      body: JSON.stringify(alertData),
    })
  }

  async updateAdminAlert(alertId: number, alertData: any) {
    return await this.request(`/alerts/admin/${alertId}/`, {
      method: "PUT",
      body: JSON.stringify(alertData),
    })
  }

  async deleteAdminAlert(alertId: number) {
    return await this.request(`/alerts/admin/${alertId}/`, {
      method: "DELETE",
    })
  }

  // Rapports de santé
  async getHealthReports(params?: { verified?: boolean; severity?: string; region?: string }) {
    const queryParams = new URLSearchParams(Object.entries(params || {}).map(([k, v]) => [k, String(v)])).toString()
    return await this.request(`/reports/health-reports/${queryParams ? `?${queryParams}` : ""}`)
  }

  async createHealthReport(reportData: any) {
    return await this.request("/reports/health-reports/", {
      method: "POST",
      body: JSON.stringify(reportData),
    })
  }

  async verifyHealthReport(reportId: number) {
    return await this.request(`/reports/health-reports/${reportId}/verify/`, {
      method: "POST",
    })
  }
}

export const apiService = new ApiService(API_BASE_URL)
