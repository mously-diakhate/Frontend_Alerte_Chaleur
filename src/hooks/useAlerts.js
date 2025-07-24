"use client"

import { useState, useEffect, useCallback } from "react"
import { adminApiService } from "../services/adminApi"

export function useAlerts() {
  const [alerts, setAlerts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadAlerts = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await adminApiService.getAlerts()
      setAlerts(response.results || response)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createAlert = useCallback(async (alertData) => {
    try {
      const newAlert = await adminApiService.createAlert(alertData)
      setAlerts((prev) => [newAlert, ...prev])
    } catch (err) {
      throw err
    }
  }, [])

  const deleteAlert = useCallback(async (id) => {
    try {
      await adminApiService.deleteAlert(id)
      setAlerts((prev) => prev.filter((alert) => alert.id !== id))
    } catch (err) {
      throw err
    }
  }, [])

  useEffect(() => {
    loadAlerts()
  }, [loadAlerts])

  return {
    alerts,
    isLoading,
    error,
    createAlert,
    deleteAlert,
    refreshAlerts: loadAlerts,
  }
}
