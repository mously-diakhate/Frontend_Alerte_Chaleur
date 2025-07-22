import { useState, useMemo } from "react";
import { Download, Upload, Search } from "lucide-react";

const sampleBulletins = [
  {
    id: 1,
    title: "Bulletin Canicule - Matam - Juillet 2025",
    date: "2025-07-20",
    region: "Matam",
    link: "/bulletins/matam-juillet-2025.pdf",
  },
  {
    id: 2,
    title: "Alerte Rouge - Kaffrine - Juillet 2025",
    date: "2025-07-19",
    region: "Kaffrine",
    link: "/bulletins/kaffrine-juillet-2025.pdf",
  },
  {
    id: 3,
    title: "Vague de chaleur - Podor - Juillet 2025",
    date: "2025-07-18",
    region: "Podor",
    link: "/bulletins/podor-juillet-2025.pdf",
  },
];

const regionsSenegal = [
  "Tous",
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

export default function MeteoBulletins() {
  const [bulletins, setBulletins] = useState(sampleBulletins);
  const [filterRegion, setFilterRegion] = useState("Tous");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBulletins = useMemo(() => {
    return bulletins.filter((b) => {
      const matchesRegion = filterRegion === "Tous" || b.region === filterRegion;
      const matchesSearch =
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.region.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesRegion && matchesSearch;
    });
  }, [bulletins, filterRegion, searchTerm]);

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 via-white to-orange-50 max-w-6xl mx-auto">
      <h1 className="text-4xl font-extrabold mb-8 text-blue-700 text-center drop-shadow-md">
        Bulletins Météo Santé Sénégal
      </h1>

      {/* Filtre & recherche */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <label htmlFor="regionFilter" className="font-semibold text-blue-700">
            Filtrer par région :
          </label>
          <select
            id="regionFilter"
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="border border-blue-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {regionsSenegal.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 border border-blue-300 rounded px-3 py-2 focus-within:ring-2 focus-within:ring-blue-400">
          <Search className="text-blue-600" />
          <input
            type="text"
            placeholder="Rechercher un bulletin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="outline-none w-full"
          />
        </div>

        <button
          className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-5 py-2 rounded hover:bg-blue-700 transition"
          onClick={() => alert("Fonctionnalité d'upload à implémenter")}
          aria-label="Ajouter un bulletin"
        >
          <Upload className="w-5 h-5" /> Ajouter un bulletin
        </button>
      </div>

      {/* Tableau des bulletins */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead className="bg-blue-100 text-blue-700 font-semibold text-sm uppercase tracking-wide">
            <tr>
              <th className="p-4">Titre</th>
              <th className="p-4">Région</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBulletins.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-10 text-center text-gray-400">
                  Aucun bulletin trouvé.
                </td>
              </tr>
            ) : (
              filteredBulletins.map(({ id, title, region, date, link }) => (
                <tr key={id} className="border-b hover:bg-blue-50 transition cursor-pointer">
                  <td className="p-4 max-w-xl truncate" title={title}>
                    {title}
                  </td>
                  <td className="p-4 font-semibold">{region}</td>
                  <td className="p-4">{date}</td>
                  <td className="p-4 text-center">
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
                      aria-label={`Télécharger ${title}`}
                    >
                      <Download className="w-5 h-5" /> Télécharger
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
