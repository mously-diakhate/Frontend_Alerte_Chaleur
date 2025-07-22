import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
} from "react-leaflet";
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
  const senegalCenter = [14.4974, -14.4524]; // Centre du Sénégal

  const [structures, setStructures] = useState([
    { name: "Hôpital Principal de Dakar", position: [14.6641, -17.4371] }
    
  ]);

  const [formData, setFormData] = useState({
    name: "",
    latitude: "",
    longitude: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddStructure = (e) => {
    e.preventDefault();
    const { name, latitude, longitude } = formData;
    if (!name || !latitude || !longitude) return alert("Champs requis");

    const newStructure = {
      name,
      position: [parseFloat(latitude), parseFloat(longitude)],
    };

    setStructures([...structures, newStructure]);
    setFormData({ name: "", latitude: "", longitude: "" });
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Structures de santé au Sénégal</h2>

      {/* Formulaire d'ajout */}
      <form onSubmit={handleAddStructure} className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Nom de la structure"
          className="border p-2 rounded"
        />
        <input
          type="number"
          name="latitude"
          value={formData.latitude}
          onChange={handleChange}
          placeholder="Latitude"
          className="border p-2 rounded"
          step="any"
        />
        <input
          type="number"
          name="longitude"
          value={formData.longitude}
          onChange={handleChange}
          placeholder="Longitude"
          className="border p-2 rounded"
          step="any"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Ajouter
        </button>
      </form>

      {/* Carte */}
      <MapContainer
        center={senegalCenter}
        zoom={6}
        style={{ height: "600px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {structures.map((structure, idx) => (
          <Marker key={idx} position={structure.position}>
            <Popup>{structure.name}</Popup>
            <Tooltip permanent direction="top" offset={[0, -10]}>
              {structure.name}
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default CartographiePage;
