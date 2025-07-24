"use client"

import { useState, useEffect } from "react"
import { apiService } from "../services/api"

export const useHealthStructures = (region?: string, type?: string) => {
  const [structures, setStructures] = useState<any[]>([])
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadHealthStructures()
  }, [region, type])

  const loadHealthStructures = async () => {
    try {
      setIsLoading(true)
      const [structuresResponse, contactsResponse] = await Promise.all([
        apiService.getHealthStructures({ region, type }),
        apiService.getEmergencyContacts(region),
      ])

      setStructures(structuresResponse)
      setEmergencyContacts(contactsResponse)
    } catch (err) {
      setError("Erreur lors du chargement des structures de santé")
      console.error("Health structures error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const findNearbyStructures = async (lat: number, lon: number) => {
    try {
      const nearbyStructures = await apiService.getNearbyStructures(lat, lon)
      return nearbyStructures
    } catch (err) {
      console.error("Nearby structures error:", err)
      return []
    }
  }

  return {
    structures,
    emergencyContacts,
    isLoading,
    error,
    findNearbyStructures,
    refreshStructures: loadHealthStructures,
  }
}
