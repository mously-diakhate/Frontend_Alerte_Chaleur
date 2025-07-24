"use client"
import { useState } from "react"
import { Thermometer, User, Shield, AlertCircle } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

function LoginPage() {
  const [role, setRole] = useState("user")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login, adminLogin } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!email.includes("@")) {
      setError("Veuillez entrer une adresse email valide.")
      setIsLoading(false)
      return
    }

    try {
      if (role === "admin") {
        await adminLogin(email, password)
        navigate("/admin/dashboard")
      } else {
        const user = await login(email, password)

        // Vérifie si l’utilisateur est un admin : interdiction d’accéder via espace utilisateur
        if (user?.is_admin || user?.is_staff || user?.is_superuser) {
          setError("Un administrateur ne peut pas se connecter depuis l'espace utilisateur.")
          setIsLoading(false)
          return
        }

        navigate("/meteosante")
      }
    } catch (err) {
      console.error("Erreur de connexion:", err)
      if (err.response?.data?.error) {
        setError(err.response.data.error)
      } else {
        setError("Email ou mot de passe incorrect.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleChange = (newRole) => {
    setRole(newRole)
    setEmail("")
    setPassword("")
    setError("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-red-200 flex flex-col items-center justify-center px-4">
      {/* Sélecteur de rôle */}
      <div className="flex mb-6 space-x-2">
        <button
          onClick={() => handleRoleChange("user")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            role === "user" ? "bg-orange-500 text-white shadow-lg" : "bg-white text-gray-700 border hover:bg-gray-50"
          }`}
        >
          <User className="w-4 h-4" /> Utilisateur
        </button>
        <button
          onClick={() => handleRoleChange("admin")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            role === "admin" ? "bg-orange-500 text-white shadow-lg" : "bg-white text-gray-700 border hover:bg-gray-50"
          }`}
        >
          <Shield className="w-4 h-4" /> Admin
        </button>
      </div>

      {/* Formulaire de connexion */}
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center relative overflow-hidden">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-full p-4 shadow-lg flex items-center justify-center">
            <Thermometer className="h-8 w-8 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800">Connexion</h2>
        <p className="text-gray-500 mb-2">Plateforme KARANGUE</p>

        {/* Indicateur de type de connexion */}
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4 ${
            role === "admin" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
          }`}
        >
          {role === "admin" ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
          {role === "admin" ? "Espace Administrateur" : "Espace Utilisateur"}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Champ Email */}
          <div>
            <label className="block text-gray-600 mb-1 font-medium">Email</label>
            <input
              type="email"
              placeholder="exemple@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Champ mot de passe */}
          <div>
            <label className="block text-gray-600 mb-1 font-medium">Mot de passe</label>
            <input
              type="password"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="text-right">
            <a href="#" className="text-sm text-blue-500 hover:underline">
              Mot de passe oublié ?
            </a>
          </div>

          {/* Bouton de connexion */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
              role === "admin"
                ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Connexion...
              </div>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>

        {role === "user" && (
          <p className="mt-6 text-gray-600 text-sm">
            Pas encore de compte ?{" "}
            <Link to="/register" className="text-orange-500 hover:underline font-medium">
              S'inscrire
            </Link>
          </p>
        )}

        <p className="mt-2 text-gray-500 text-sm">
          <Link to="/" className="text-orange-500 hover:underline">
            Continuer en tant que visiteur
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
