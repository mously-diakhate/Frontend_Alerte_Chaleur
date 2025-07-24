// Utilitaires pour adapter les données du backend au format attendu par le frontend

export const formatWeatherData = (backendData: any) => {
  // Adapter les données du backend au format attendu par vos composants existants
  const formattedData: any = {}

  Object.keys(backendData).forEach((regionName) => {
    const regionData = backendData[regionName]

    if (regionData.error) {
      formattedData[regionName] = {
        temperature: "N/A",
        humidity: "N/A",
        vigilance: "Données indisponibles",
        conseils: ["Données météo temporairement indisponibles"],
      }
    } else {
      // Déterminer le niveau de vigilance basé sur la température
      let vigilance = "Normal"
      if (regionData.temperature > 40) {
        vigilance = "Très dangereux"
      } else if (regionData.temperature > 35) {
        vigilance = "Dangereux"
      } else if (regionData.temperature > 30) {
        vigilance = "Très inconfortable"
      } else if (regionData.temperature > 25) {
        vigilance = "Inconfortable"
      }

      formattedData[regionName] = {
        temperature: regionData.temperature,
        humidity: regionData.humidity,
        vigilance,
        conseils: regionData.conseils || [],
        feels_like: regionData.feels_like,
        wind_speed: regionData.wind_speed,
        uv_index: regionData.uv_index,
      }
    }
  })

  return formattedData
}

export const getVigilanceColor = (vigilance: string) => {
  switch (vigilance) {
    case "Très dangereux":
      return "text-red-600"
    case "Dangereux":
      return "text-orange-600"
    case "Très inconfortable":
      return "text-yellow-600"
    case "Inconfortable":
      return "text-blue-600"
    default:
      return "text-green-600"
  }
}

export const formatAlerts = (backendAlerts: any[]) => {
  return backendAlerts.map((alert) => ({
    id: alert.id,
    region: alert.region_name,
    level: alert.alert_level,
    message: alert.message,
    temperature: alert.temperature_threshold,
    createdAt: alert.created_at,
    expiresAt: alert.expires_at,
  }))
}
