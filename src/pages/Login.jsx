import { useState } from "react";
import { Thermometer, User, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom"; // ✅ ajouté useNavigate
import { adminAccounts } from "../data/adminUsers";
import { userAccounts } from "../data/users";


function LoginPage() {
  const [role, setRole] = useState("user");
  const [emailOrId, setEmailOrId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

   const handleSubmit = (e) => {
    e.preventDefault();

    if (role === "admin") {
      const matched = adminAccounts.find(
        (a) => a.username === emailOrId && a.password === password
      );
      if (matched) {
        localStorage.setItem("admin", JSON.stringify(matched));
        navigate("/admin/dashboard");
      } else {
        setError("Identifiants administrateur incorrects.");
      }
    } else {
      const matchedUser = userAccounts.find(
        (u) => u.email === emailOrId && u.password === password
      );
      if (matchedUser) {
        localStorage.setItem("user", JSON.stringify(matchedUser));
        navigate("/meteosante");
      } else {
        setError("Email ou mot de passe incorrect.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-red-200 flex flex-col items-center justify-center px-4">
      <div className="flex mb-6 space-x-2">
        <button
          onClick={() => setRole("user")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            role === "user"
              ? "bg-orange-500 text-white"
              : "bg-white text-gray-700 border"
          }`}
        >
          <User className="w-4 h-4" /> Utilisateur
        </button>
        <button
          onClick={() => setRole("admin")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            role === "admin"
              ? "bg-orange-500 text-white"
              : "bg-white text-gray-700 border"
          }`}
        >
          <Shield className="w-4 h-4" /> Admin
        </button>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center relative overflow-hidden">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-full p-4 shadow-lg flex items-center justify-center">
            <Thermometer className="h-8 w-8 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800">Connexion</h2>
        <p className="text-gray-500 mb-6">Plateforme KARANGUE</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {error && (
          <p className="text-red-500 text-sm text-center mt-2">{error}</p>
         )}

          <div>
            <label className="block text-gray-600 mb-1">
              {role === "admin" ? "Identifiant" : "Email"}
            </label>
            <input
              type="text"
              placeholder={role === "admin" ? "Votre identifiant" : "votre@email.com"}
              value={emailOrId}
              onChange={(e) => setEmailOrId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Mot de passe</label>
            <input
              type="password"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          <div className="text-right">
            <a href="#" className="text-sm text-blue-500 hover:underline">
              Mot de passe oublié ?
            </a>
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition shadow-lg"
          >
            Se connecter
          </button>
        </form>
        
        {role === "user" && (
          <p className="mt-6 text-gray-600 text-sm">
            Pas encore de compte ?{" "}
            <Link to="/register" className="text-orange-500 hover:underline">
              S'inscrire
            </Link>
          </p>
        )}

        <p className="mt-2 text-gray-500 text-sm">Continuer en tant que visiteur</p>
      </div>
    </div>
  );
}

export default LoginPage;
