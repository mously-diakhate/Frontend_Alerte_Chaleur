"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Thermometer } from "lucide-react"
import { useAuth } from "../hooks/useAuth"

function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    password_confirm: "",
    situation: "",
    region: "",
    phone_number: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()
  const { register } = useAuth()

  const regions = [
    "Dakar",
    "Thiès",
    "Saint-Louis",
    "Diourbel",
    "Kaolack",
    "Fatick",
    "Kaffrine",
    "Louga",
    "Matam",
    "Tambacounda",
    "Kédougou",
    "Kolda",
    "Sédhiou",
    "Ziguinchor",
  ]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.password_confirm) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    setIsLoading(true)

    try {
      await register(formData)
      navigate("/meteosante")
    } catch (err) {
      const errorMessage =
        err.response?.data?.email?.[0] ||
        err.response?.data?.username?.[0] ||
        err.response?.data?.password?.[0] ||
        "Erreur lors de l'inscription. Veuillez réessayer."
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

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
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div>
            <label htmlFor="full_name" className="block text-gray-600 mb-1">
              Nom complet
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              placeholder="Votre nom complet"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-gray-600 mb-1">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="nom_utilisateur"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="exemple@domaine.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-600 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Choisissez un mot de passe"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          <div>
            <label htmlFor="password_confirm" className="block text-gray-600 mb-1">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              id="password_confirm"
              name="password_confirm"
              placeholder="Confirmez votre mot de passe"
              value={formData.password_confirm}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          <div>
            <label htmlFor="region" className="block text-gray-600 mb-1">
              Région
            </label>
            <select
              id="region"
              name="region"
              value={formData.region}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            >
              <option value="">Sélectionnez votre région</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="phone_number" className="block text-gray-600 mb-1">
              Téléphone (optionnel)
            </label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              placeholder="+221 XX XXX XX XX"
              value={formData.phone_number}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label htmlFor="situation" className="block text-gray-600 mb-1">
              Situation
            </label>
            <select
              id="situation"
              name="situation"
              value={formData.situation}
              onChange={handleChange}
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
            disabled={isLoading}
            className="w-full py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition shadow-lg disabled:opacity-50"
          >
            {isLoading ? "Inscription..." : "S'inscrire"}
          </button>
        </form>

        <p className="mt-6 text-gray-600 text-sm relative z-10">
          Vous avez déjà un compte ?{" "}
          <Link to="/login" className="text-orange-500 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
