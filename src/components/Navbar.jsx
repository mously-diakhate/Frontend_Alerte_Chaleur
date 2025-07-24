import { Link } from "react-router-dom";
import { Thermometer, MapPin, Users, Shield, Info, AlertTriangle } from "lucide-react";

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Thermometer className="h-7 w-7 text-orange-500" />
          <span className="font-bold text-xl text-orange-600">KARANGUE</span>
        </Link>
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/cartographie" className="flex items-center text-gray-700 hover:text-orange-500 transition">
            <MapPin className="h-4 w-4 mr-1" /> Carte
          </Link>
          <Link to="/meteosante" className="flex items-center text-gray-700 hover:text-orange-500 transition">
            <Thermometer className="h-4 w-4 mr-1" /> Météo-Santé
          </Link>
          <Link to="/alertes" className="flex items-center text-gray-700 hover:text-orange-500 transition">
            <AlertTriangle className="h-4 w-4 mr-1" /> Alertes
          </Link>
          <Link to="/about" className="flex items-center text-gray-700 hover:text-orange-500 transition">
            <Info className="h-4 w-4 mr-1" /> À propos
          </Link>
          <Link to="/register" className="flex items-center text-gray-700 hover:text-orange-500 transition">
            <Users className="h-4 w-4 mr-1" /> Rejoindre
          </Link>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            to="/login"
            className="px-4 py-2 rounded-full border border-orange-500 text-orange-500 font-medium hover:bg-orange-500 hover:text-white transition"
          >
            Connexion
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium hover:from-orange-600 hover:to-red-600 transition"
          >
            S'inscrire
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
