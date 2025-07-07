import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix des icônes de Leaflet dans React
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function CartographiePage() {
  const senegalCenter = [14.4974, -14.4524]; // Latitude/Longitude du Sénégal

  const hospitals = [
    {
      name: "Hôpital Principal de Dakar",
      position: [14.6641, -17.4371],
    },
    {
      name: "Hôpital de Fann",
      position: [14.6876, -17.4685],
    },
    {
      name: "Hôpital Dalal Jamm",
      position: [14.8255, -17.2767],
    },
  ];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Structures de santé au Sénégal</h2>

      <MapContainer
        center={senegalCenter}
        zoom={6}
        style={{ height: "600px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {hospitals.map((hospital, idx) => (
          <Marker key={idx} position={hospital.position}>
            <Popup>{hospital.name}</Popup>
          </Marker>
        ))}

        <Marker position={[14.6641, -17.4371]}>
        <Tooltip permanent direction="top" offset={[0, -10]}>
             Hôpital Principal
        </Tooltip>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default CartographiePage;
