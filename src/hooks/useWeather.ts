"use client"

import { useState, useEffect } from "react"
import { apiService } from "../services/api"

export const useWeather = () => {
  const [weatherData, setWeatherData] = useState<any>(null)
  const [regions, setRegions] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadWeatherData()
  }, [])

  const loadWeatherData = async () => {
    try {
      setIsLoading(true)
      const [weatherResponse, regionsResponse, alertsResponse] = await Promise.all([
        apiService.getCurrentWeather(),
        apiService.getRegions(),
        apiService.getActiveAlerts(),
      ])

      setWeatherData(weatherResponse)
      setRegions(regionsResponse)
      setAlerts(alertsResponse)
    } catch (err) {
      setError("Erreur lors du chargement des données météo")
      console.error("Weather data error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshWeatherData = () => {
    loadWeatherData()
  }

  return {
    weatherData,
    regions,
    alerts,
    isLoading,
    error,
    refreshWeatherData,
  }
}
