import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo & Description */}
        <div>
          <h2 className="text-2xl font-bold text-orange-500 mb-2">KARANGUE</h2>
          <p className="text-gray-400 text-sm">
            KARANGUE est une plateforme innovante pour prévenir les risques sanitaires liés aux vagues de chaleur.
          </p>
        </div>
        {/* Liens rapides */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Navigation</h3>
          <ul className="space-y-1 text-sm">
            <li><Link to="/" className="hover:underline">Accueil</Link></li>
            <li><Link to="/cartographie" className="hover:underline">Carte</Link></li>
            <li><Link to="/meteo-sante" className="hover:underline">Météo-Santé</Link></li>
            <li><Link to="/about" className="hover:underline">À propos</Link></li>
          </ul>
        </div>
        {/* Ressources */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Ressources</h3>
          <ul className="space-y-1 text-sm">
            <li><a href="#" className="hover:underline">Centre d'aide</a></li>
            <li><a href="#" className="hover:underline">Support technique</a></li>
            <li><a href="#" className="hover:underline">Politique de confidentialité</a></li>
            <li><a href="#" className="hover:underline">Conditions d'utilisation</a></li>
          </ul>
        </div>
        {/* Contact */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Contact</h3>
          <ul className="space-y-1 text-sm">
            <li>Email: contact@heatalert.sn</li>
            <li>Tél: +221 77 000 00 00</li>
            <li>Adresse: Dakar, Sénégal</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-8 pt-4 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} KARANGUE Sénégal. Tous droits réservés.
      </div>
    </footer>
  );
}

export default Footer;
