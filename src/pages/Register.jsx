import { useState } from "react";
import { Link } from "react-router-dom";
import { Thermometer } from "lucide-react";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [situation, setSituation] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Nom:", name, "Email:", email, "Mot de passe:", password, "Situation:", situation);
    // Ici, tu ajoutes la logique d'inscription
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-red-200 flex items-center justify-center px-4 pt-20">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center relative overflow-hidden">
        {/* Decorative blurred background */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-orange-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-red-400/20 rounded-full blur-3xl"></div>

        {/* Logo */}
        <div className="flex justify-center mb-4 relative z-10">
          <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-full p-4 shadow-xl flex items-center justify-center">
            <Thermometer className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Titre */}
        <h2 className="text-2xl font-bold text-gray-800 relative z-10">Créer un compte</h2>
        <p className="text-gray-500 mb-6 relative z-10">Plateforme KARANGUE</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left relative z-10">
          <div>
            <label htmlFor="name" className="block text-gray-600 mb-1">Nom complet</label>
            <input
              type="text"
              id="name"
              placeholder="Votre nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-600 mb-1">Email</label>
            <input
              type="email"
              id="email"
              placeholder="exemple@domaine.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-600 mb-1">Mot de passe</label>
            <input
              type="password"
              id="password"
              placeholder="Choisissez un mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>
          <div>
            <label htmlFor="situation" className="block text-gray-600 mb-1">Situation</label>
            <select
              id="situation"
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            >
              <option value="">Sélectionnez votre situation</option>
              <option value="personne_agee">Personne âgée</option>
              <option value="femme_enceinte">Femme enceinte</option>
              <option value="personne_risque">Personne à risque</option>
              <option value="enfant">Enfant</option>
              <option value="aucune">Aucune situation particulière</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition shadow-lg"
          >
            S'inscrire
          </button>
        </form>

        <p className="mt-6 text-gray-600 text-sm relative z-10">
          Vous avez déjà un compte ?{" "}
          <Link to="/login" className="text-orange-500 hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
