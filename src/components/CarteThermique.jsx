import React from "react";
import { MapContainer, TileLayer, Circle, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const zones = [
  {
    name: "Dakar",
    center: [14.7167, -17.4677],
    intensity: "élevée",
    color: "#ff0000",
  },
  {
    name: "Thiès",
    center: [14.7910, -16.9256],
    intensity: "modérée",
    color: "#ffa500",
  },
  {
    name: "Saint-Louis",
    center: [16.0333, -16.5000],
    intensity: "faible",
    color: "#00ff00",
  },
  {
    name: "Ziguinchor",
    center: [12.5833, -16.2667],
    intensity: "très élevée",
    color: "#8b0000",
  },
  {
    name: "Kaolack",
    center: [14.1500, -16.0833],
    intensity: "modérée",
    color: "#ffa500",
  },
];

const CarteThermique = () => {
  return (
    <div className="w-full max-w-5xl mx-auto rounded-lg shadow-lg border overflow-hidden">
      <MapContainer
        center={[14.5, -15.5]}
        zoom={6}
        scrollWheelZoom={false}
        style={{ height: "550px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {zones.map((zone, index) => (
          <Circle
            key={index}
            center={zone.center}
            radius={15000}
            pathOptions={{
              color: zone.color,
              fillColor: zone.color,
              fillOpacity: 0.5,
            }}
          >
            <Tooltip sticky>
              {zone.name} — Chaleur {zone.intensity}
            </Tooltip>
          </Circle>
        ))}
      </MapContainer>

      {/* Légende centrée sous la carte */}
      <div className="flex justify-center bg-white py-3 border-t text-sm font-semibold space-x-6">
        <LegendItem color="#00ff00" label="Faible" />
        <LegendItem color="#ffa500" label="Modérée" />
        <LegendItem color="#ff0000" label="Élevée" />
        <LegendItem color="#8b0000" label="Très élevée" />
      </div>
    </div>
  );
};

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center space-x-2">
      <div
        className="w-5 h-5 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span>{label}</span>
    </div>
  );
}

export default CarteThermique;
