import React from "react";
import { AlertTriangle, MapPin, Thermometer, Bell, HeartPulse } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";


const AlertPage = () => {
  const userProfile = {
    name: "Utilisateur",
    profil: "Personne âgée", // Peut être dynamique
    region: "Matam",
    vigilance: "Très dangereux",
    temperature: {
      day: 42,
      night: 34,
    },
  };

  const preventionMessages = {
    "Personne âgée": "Buvez régulièrement de l’eau, restez à l’ombre, évitez de sortir entre 12h et 16h.",
    "Femme enceinte": "Hydratez-vous souvent, portez des vêtements amples, évitez l’effort physique.",
    "Enfant": "Assurez-vous que l’enfant boit de l’eau, reste dans un endroit frais et aéré.",
    "Souffrant de maladie chronique": "Prenez vos traitements, évitez les sorties prolongées, consultez un médecin si besoin.",
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Bell className="text-red-600" /> Alerte Canicule - {userProfile.region}
      </h1>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="space-y-2">
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin className="w-4 h-4" /> Région : <strong>{userProfile.region}</strong>
              </p>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Thermometer className="w-4 h-4" /> Température jour : <strong>{userProfile.temperature.day}°C</strong> / nuit : <strong>{userProfile.temperature.night}°C</strong>
              </p>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> Niveau de vigilance : <strong className="text-red-600">{userProfile.vigilance}</strong>
              </p>
            </div>
            <div className="mt-4 md:mt-0 text-sm font-medium bg-red-100 text-red-700 px-4 py-2 rounded-md">
              🔔 Alerte : Risque sanitaire très élevé
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <HeartPulse className="text-rose-600" /> Recommandations personnalisées
          </h2>
          <p>{preventionMessages[userProfile.profil]}</p>
          <div className="mt-4">
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md">
              📞 Urgence : Appeler les secours
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertPage;
