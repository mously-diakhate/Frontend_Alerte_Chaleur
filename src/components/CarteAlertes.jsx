import { MapContainer, TileLayer, Polygon, Popup } from "react-leaflet";
import { senegalRegions } from "../data/senegalRegions";
import "leaflet/dist/leaflet.css";

// Définir les couleurs selon le niveau d’alerte
const alertColors = {
  "Très dangereux": "#dc2626", // rouge
  "Dangereux": "#f97316", // orange
  "Très inconfortable": "#eab308", // jaune
  "Acceptable": "#22c55e", // vert
};

export default function CarteAlertes() {
  return (
    <div className="bg-white rounded-lg shadow p-6 mt-12">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">
        Carte d'alerte par région
      </h2>

      <MapContainer
        center={[14.7, -14.4]}
        zoom={6}
        scrollWheelZoom={false}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {senegalRegions.map((region, index) => (
          <Polygon
            key={index}
            positions={region.coordinates}
            pathOptions={{
              fillColor: alertColors[region.level] || "#888",
              fillOpacity: 0.6,
              color: alertColors[region.level] || "#888",
              weight: 2,
            }}
          >
            <Popup>
              <strong>{region.name}</strong> <br />
              Niveau d'alerte :{" "}
              <span className="font-bold">{region.level}</span>
              <br />
              {region.level === "Très dangereux" &&
                "⚠️ Risque extrême de coup de chaleur."}
              {region.level === "Dangereux" &&
                "🌡️ Risque important, limitez les sorties."}
              {region.level === "Très inconfortable" &&
                "😓 Températures élevées, hydratez-vous régulièrement."}
              {region.level === "Acceptable" &&
                "✅ Conditions normales."}
            </Popup>
          </Polygon>
        ))}
      </MapContainer>

      {/* Légende */}
      <div className="flex flex-wrap mt-4 gap-4 text-sm text-gray-700">
        {Object.entries(alertColors).map(([level, color]) => (
          <div key={level} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: color }}
            />
            {level}
          </div>
        ))}
      </div>
    </div>
  );
}
