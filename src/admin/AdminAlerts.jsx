import { useState, useMemo } from "react";
import { Trash2, Filter, PlusCircle, Eye } from "lucide-react";

const initialAlerts = [
  {
    id: 1,
    region: "Matam",
    level: "Dangereux",
    date: "2025-07-20",
    description: "Vague de chaleur sévère attendue avec risques importants pour la santé.",
    admin: "Fatou Diop",
    status: "Active",
  },
  {
    id: 2,
    region: "Kaffrine",
    level: "Très dangereux",
    date: "2025-07-19",
    description: "Conditions extrêmes, vigilance maximale recommandée.",
    admin: "Mamadou Ndiaye",
    status: "Active",
  },
  {
    id: 3,
    region: "Podor",
    level: "Très inconfortable",
    date: "2025-07-21",
    description: "Chaleur élevée, éviter les activités physiques intenses.",
    admin: "Aissatou Sow",
    status: "Inactive",
  },
];

const alertLevels = [
  "Très dangereux",
  "Dangereux",
  "Très inconfortable",
];

const alertStatuses = ["Active", "Inactive"];

const regionsSenegal = [
  "Dakar",
  "Thiès",
  "Saint-Louis",
  "Matam",
  "Kaffrine",
  "Podor",
  "Kaolack",
  "Ziguinchor",
  "Tambacounda",
  "Kolda",
  "Fatick",
  "Diourbel",
  "Louga",
  "Kédougou",
  "Sédhiou",
];

export default function AdminAlerts() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [filterLevel, setFilterLevel] = useState("Tous");
  const [currentPage, setCurrentPage] = useState(1);
  const alertsPerPage = 4;

  const [formData, setFormData] = useState({
    region: "",
    level: "",
    description: "",
    admin: "",
    status: "Active",
  });

  const [modalAlert, setModalAlert] = useState(null);

  const filteredAlerts = useMemo(() => {
    if (filterLevel === "Tous") return alerts;
    return alerts.filter((a) => a.level === filterLevel);
  }, [filterLevel, alerts]);

  const totalPages = Math.ceil(filteredAlerts.length / alertsPerPage);
  const currentAlerts = filteredAlerts.slice(
    (currentPage - 1) * alertsPerPage,
    currentPage * alertsPerPage
  );

  const levelColor = (level) => {
    switch (level) {
      case "Très dangereux":
        return "bg-red-100 text-red-700";
      case "Dangereux":
        return "bg-orange-100 text-orange-700";
      case "Très inconfortable":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const statusColor = (status) => {
    return status === "Active"
      ? "bg-green-100 text-green-700"
      : "bg-gray-200 text-gray-500";
  };

  const handleDelete = (id) => {
    if(window.confirm("Voulez-vous vraiment supprimer cette alerte ?")) {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      if (currentPage > 1 && currentAlerts.length === 1) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleAddAlert = (e) => {
    e.preventDefault();
    const { region, level, description, admin, status } = formData;
    if (!region || !level || !description || !admin) {
      alert("Merci de remplir tous les champs.");
      return;
    }
    const newAlert = {
      id: Date.now(),
      region,
      level,
      description,
      admin,
      status,
      date: new Date().toISOString().split("T")[0],
    };
    setAlerts((prev) => [newAlert, ...prev]);
    setFormData({
      region: "",
      level: "",
      description: "",
      admin: "",
      status: "Active",
    });
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 p-8 max-w-7xl mx-auto">
      <h1 className="text-5xl font-extrabold mb-10 text-center text-orange-600 drop-shadow-md">
        Gestion des alertes <span className="text-gray-800">administrateur</span>
      </h1>

      {/* Formulaire ajout */}
      <section className="mb-12 bg-white rounded-lg shadow p-8">
        <h2 className="text-3xl font-semibold mb-6 text-orange-600 flex items-center gap-2">
          <PlusCircle className="w-8 h-8" />
          Ajouter une nouvelle alerte
        </h2>
        <form
          onSubmit={handleAddAlert}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          noValidate
        >
          <div>
            <label
              htmlFor="region"
              className="block mb-2 font-semibold text-gray-700"
            >
              Région
            </label>
            <select
              name="region"
              id="region"
              value={formData.region}
              onChange={handleInputChange}
              className="w-full border border-orange-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            >
              <option value="">-- Sélectionnez une région --</option>
              {regionsSenegal.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="level"
              className="block mb-2 font-semibold text-gray-700"
            >
              Niveau d'alerte
            </label>
            <select
              name="level"
              id="level"
              value={formData.level}
              onChange={handleInputChange}
              className="w-full border border-orange-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            >
              <option value="">-- Sélectionnez un niveau --</option>
              {alertLevels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="description"
              className="block mb-2 font-semibold text-gray-700"
            >
              Description détaillée
            </label>
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full border border-orange-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Entrez une description précise des risques et recommandations"
              required
            />
          </div>

          <div>
            <label
              htmlFor="admin"
              className="block mb-2 font-semibold text-gray-700"
            >
              Nom de l'administrateur
            </label>
            <input
              type="text"
              name="admin"
              id="admin"
              value={formData.admin}
              onChange={handleInputChange}
              placeholder="Exemple : Fatou Diop"
              className="w-full border border-orange-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          <div>
            <label
              htmlFor="status"
              className="block mb-2 font-semibold text-gray-700"
            >
              Statut de l'alerte
            </label>
            <select
              name="status"
              id="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full border border-orange-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              {alertStatuses.map((stat) => (
                <option key={stat} value={stat}>
                  {stat}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 text-right">
            <button
              type="submit"
              className="bg-orange-600 text-white font-bold px-8 py-3 rounded shadow hover:bg-orange-700 transition"
            >
              Ajouter l'alerte
            </button>
          </div>
        </form>
      </section>

      {/* Filtre */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2 text-orange-600 font-semibold text-lg">
          <Filter className="w-6 h-6" />
          <label htmlFor="levelFilter">Filtrer par niveau :</label>
        </div>
        <select
          id="levelFilter"
          value={filterLevel}
          onChange={(e) => {
            setFilterLevel(e.target.value);
            setCurrentPage(1);
          }}
          className="border border-orange-300 rounded px-4 py-2 font-semibold text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
        >
          <option value="Tous">Tous</option>
          {alertLevels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto rounded-lg shadow-lg bg-white">
        <table className="w-full text-left border-collapse">
          <thead className="bg-orange-100 text-orange-700 uppercase font-semibold text-sm tracking-wide">
            <tr>
              <th className="p-4">Région</th>
              <th className="p-4">Niveau d'alerte</th>
              <th className="p-4">Description</th>
              <th className="p-4">Administrateur</th>
              <th className="p-4">Statut</th>
              <th className="p-4">Date</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentAlerts.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-10 text-center text-gray-400 text-lg"
                >
                  Aucune alerte disponible.
                </td>
              </tr>
            ) : (
              currentAlerts.map(
                ({ id, region, level, description, admin, status, date }) => (
                  <tr
                    key={id}
                    className="border-b hover:bg-orange-50 transition cursor-default"
                  >
                    <td className="p-4 font-semibold text-gray-800">{region}</td>
                    <td
                      className={`p-4 font-bold rounded-md w-max ${levelColor(
                        level
                      )}`}
                    >
                      {level}
                    </td>
                    <td className="p-4 max-w-xs truncate" title={description}>
                      {description}
                    </td>
                    <td className="p-4">{admin}</td>
                    <td
                      className={`p-4 font-semibold rounded-md w-max ${statusColor(
                        status
                      )}`}
                    >
                      {status}
                    </td>
                    <td className="p-4">{date}</td>
                    <td className="p-4 flex gap-2">
                      <button
                        onClick={() =>
                          setModalAlert({ region, level, description, admin, status, date })
                        }
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition font-semibold"
                        title="Voir détails"
                      >
                        <Eye className="w-5 h-5" /> Détails
                      </button>
                      <button
                        onClick={() => handleDelete(id)}
                        className="flex items-center gap-2 text-red-600 hover:text-red-800 transition font-semibold"
                        aria-label={`Supprimer l'alerte de ${region}`}
                        title="Supprimer l'alerte"
                      >
                        <Trash2 className="w-5 h-5" /> Supprimer
                      </button>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-4 text-orange-700 font-semibold">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className={`px-5 py-2 rounded-full border border-orange-400 hover:bg-orange-200 transition ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Précédent
          </button>
          <span>
            Page <span className="font-bold">{currentPage}</span> sur{" "}
            <span className="font-bold">{totalPages}</span>
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-5 py-2 rounded-full border border-orange-400 hover:bg-orange-200 transition ${
              currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Suivant
          </button>
        </div>
      )}

      {/* Modal détails */}
      {modalAlert && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setModalAlert(null)}
        >
          <div
            className="bg-white rounded-lg max-w-lg w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalAlert(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              aria-label="Fermer modal"
            >
              &#10005;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-orange-600">Détails de l'alerte</h2>
            <p><strong>Région :</strong> {modalAlert.region}</p>
            <p><strong>Niveau d'alerte :</strong> {modalAlert.level}</p>
            <p><strong>Description :</strong></p>
            <p className="mb-4 whitespace-pre-wrap">{modalAlert.description}</p>
            <p><strong>Administrateur :</strong> {modalAlert.admin}</p>
            <p><strong>Statut :</strong> {modalAlert.status}</p>
            <p><strong>Date :</strong> {modalAlert.date}</p>
          </div>
        </div>
      )}
    </div>
  );
}
