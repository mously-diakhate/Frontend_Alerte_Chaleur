import { useEffect, useState } from "react";
import axios from "axios";
import { Thermometer, Droplet, AlertTriangle, MapPin } from "lucide-react";

const regions = [
  { name: "Dakar", lat: 14.7167, lon: -17.4677 },
  { name: "Diourbel", lat: 14.6600, lon: -16.2300 },
  { name: "Fatick", lat: 14.3392, lon: -16.4113 },
  { name: "Kaffrine", lat: 14.1050, lon: -15.5500 },
  { name: "Kaolack", lat: 14.1825, lon: -16.2533 },
  { name: "Kédougou", lat: 12.5500, lon: -12.1833 },
  { name: "Kolda", lat: 12.8833, lon: -14.9500 },
  { name: "Louga", lat: 15.6167, lon: -16.2167 },
  { name: "Matam", lat: 15.6600, lon: -13.2500 },
  { name: "Saint-Louis", lat: 16.0179, lon: -16.4896 },
  { name: "Sédhiou", lat: 12.7081, lon: -15.5569 },
  { name: "Tambacounda", lat: 13.7700, lon: -13.6670 },
  { name: "Thiès", lat: 14.7908, lon: -16.9250 },
  { name: "Ziguinchor", lat: 12.5833, lon: -16.2667 }
];

function MeteoSenegalPage() {
  const [donnees, setDonnees] = useState({});

  useEffect(() => {
    regions.forEach(({ name, lat, lon }) => {
      axios
        .get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weathercode`)
        .then((res) => {
          setDonnees((prev) => ({
            ...prev,
            [name]: res.data.current,
          }));
        })
        .catch((err) => console.error(`Erreur météo pour ${name}:`, err));
    });
  }, []);

  const getConseils = (data) => {
    const conseils = [];
    const temp = data.temperature_2m;
    const humidity = data.relative_humidity_2m;
    const code = data.weathercode;

    if (temp > 35) conseils.push("🥵 Buvez beaucoup d’eau.");
    if (humidity > 80) conseils.push("🦟 Risque de moustiques.");
    if (code === 3) conseils.push("🌬 Air poussiéreux, portez un masque.");
    if ([61, 63, 65].includes(code)) conseils.push("🌧 Pluie : attention au paludisme.");
    return conseils;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        Météo des 14 régions du Sénégal
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {regions.map(({ name }) => {
          const meteo = donnees[name];
          return (
            <div key={name} className="bg-white rounded-2xl shadow-lg p-6 border">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="text-orange-600 w-5 h-5" />
                  <h2 className="text-lg font-semibold text-gray-800">{name}</h2>
                </div>
                <span className="text-xl font-bold text-blue-700">
                  {meteo ? `${meteo.temperature_2m}°C` : "--"}
                </span>
              </div>

              {meteo ? (
                <>
                  <div className="flex items-center mb-2">
                    <Thermometer className="text-red-500 w-5 h-5 mr-2" />
                    <span className="text-sm text-gray-700">Température : {meteo.temperature_2m} °C</span>
                  </div>
                  <div className="flex items-center mb-4">
                    <Droplet className="text-blue-500 w-5 h-5 mr-2" />
                    <span className="text-sm text-gray-700">Humidité : {meteo.relative_humidity_2m} %</span>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-300 p-3 rounded">
                    <div className="flex items-center mb-1 text-yellow-700 font-semibold">
                      <AlertTriangle className="w-4 h-4 mr-1" /> Conseils
                    </div>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {getConseils(meteo).length > 0 ? (
                        getConseils(meteo).map((c, i) => <li key={i}>{c}</li>)
                      ) : (
                        <li>Aucun conseil particulier.</li>
                      )}
                    </ul>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">Chargement...</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MeteoSenegalPage;
