import { Link } from "react-router-dom";
import { MapPin, Search, Zap, Shield, Users } from "lucide-react";

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-white to-blue-50">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center flex-1 px-6 py-24 text-center bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 text-white relative overflow-hidden">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Protégez-vous contre les <span className="bg-white text-orange-500 px-2 rounded">vagues de chaleur</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl">
          Recevez des alertes précoces et découvrez des conseils personnalisés pour protéger votre santé et celle de vos proches.
        </p>
        <div className="flex flex-col md:flex-row gap-4">
          <Link to="/register" className="bg-white text-orange-600 font-semibold px-8 py-4 rounded-full shadow hover:bg-orange-50 transition">
            <Zap className="inline mr-2" /> Commencer
          </Link>
          <Link to="/meteo-sante" className="border border-white text-white font-semibold px-8 py-4 rounded-full hover:bg-white hover:text-orange-600 transition">
            <Search className="inline mr-2" /> Voir les alertes
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white text-gray-800">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-orange-500">10K+</div>
            <div className="text-sm">Utilisateurs protégés</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-500">98%</div>
            <div className="text-sm">Précision des alertes</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-500">24/7</div>
            <div className="text-sm">Surveillance active</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-pink-500">15</div>
            <div className="text-sm">Régions couvertes</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gradient-to-br from-orange-50 via-white to-blue-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-12">Fonctionnalités principales</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Cartographie interactive</h3>
              <p className="text-gray-600">Visualisez les zones à risque en temps réel grâce à notre carte dynamique.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Alertes personnalisées</h3>
              <p className="text-gray-600">Recevez des notifications précoces selon votre profil et votre localisation.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <Zap className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Prédictions IA</h3>
              <p className="text-gray-600">Des modèles intelligents pour anticiper les pics de chaleur et leurs impacts sanitaires.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-red-500 text-white text-center">
        <h2 className="text-4xl font-bold mb-6">Rejoignez la communauté KARANGUE</h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto">
          Inscrivez-vous pour recevoir des alertes personnalisées et contribuer à la protection de votre communauté.
        </p>
        <Link to="/register" className="bg-white text-orange-600 font-semibold px-10 py-4 rounded-full shadow hover:bg-orange-50 transition">
          <Users className="inline mr-2" /> Créer mon compte
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-white text-gray-500 text-center py-6">
        &copy; {new Date().getFullYear()} KARANGUE Sénégal. Tous droits réservés.
      </footer>
    </div>
  );
}

export default HomePage;
