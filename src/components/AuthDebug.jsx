"use client"

import { useState } from "react"

export function AuthDebug() {
  const [debugInfo, setDebugInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const testAuth = async () => {
    setIsLoading(true)
    const API_BASE_URL = "http://localhost:8000/api"
    const token = localStorage.getItem("authToken") || localStorage.getItem("token")

    const info = {
      hasToken: !!token,
      token: token ? token.substring(0, 20) + "..." : null,
      localStorage: Object.keys(localStorage).filter((key) => key.includes("token") || key.includes("auth")),
    }

    if (token) {
      try {
        // Test avec Token (Django REST Framework)
        const response = await fetch(`${API_BASE_URL}/alerts/admin/test-auth/`, {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          info.authTest = { success: true, data }
        } else {
          const errorText = await response.text()
          info.authTest = { success: false, error: errorText, status: response.status }
        }
      } catch (error) {
        info.authTest = { success: false, error: error.message }
      }
    }

    setDebugInfo(info)
    setIsLoading(false)
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-4">
      <h3 className="font-bold mb-2 text-yellow-800">🔧 Debug Authentification</h3>
      <button
        onClick={testAuth}
        disabled={isLoading}
        className="bg-yellow-600 text-white px-4 py-2 rounded mb-4 disabled:opacity-50"
      >
        {isLoading ? "Test en cours..." : "Tester l'authentification"}
      </button>

      {debugInfo && (
        <div className="bg-white p-3 rounded border">
          <pre className="text-sm overflow-auto max-h-64">{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
