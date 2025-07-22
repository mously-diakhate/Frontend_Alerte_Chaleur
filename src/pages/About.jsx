export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-16 px-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-10">
        <h1 className="text-4xl font-extrabold text-orange-600 mb-8 border-b-4 border-orange-400 pb-2">
          À propos de KARANGUE
        </h1>

        <p className="mb-6 text-gray-700 text-lg leading-relaxed">
          KARANGUE est une plateforme d’alerte et de prévention santé dédiée à la lutte contre les risques sanitaires liés aux vagues de chaleur au Sénégal.
        </p>

        <h2 className="text-3xl font-semibold text-orange-500 mb-4 mt-10">
          Objectif principal
        </h2>
        <p className="mb-6 text-gray-700 text-lg leading-relaxed">
          Alerter les populations, notamment les plus vulnérables, des risques sanitaires liés aux vagues de chaleur et proposer des gestes préventifs personnalisés.
        </p>

        <h2 className="text-3xl font-semibold text-orange-500 mb-6 mt-12">
          Fonctionnalités principales
        </h2>
        <ul className="list-disc list-inside space-y-3 text-gray-700 text-lg">
          <li>
            <strong>Système d’alerte localisée (Mobile)</strong> : notifications push/SMS, alertes basées sur la position GPS, niveaux de vigilance.
          </li>
          <li>
            <strong>Affichage des données météo-santé (Web et Mobile)</strong> : températures prévues, niveaux de risque, cartes thermiques par région.
          </li>
          <li>
            <strong>Profil utilisateur personnalisé (Mobile)</strong> : conseils adaptés selon âge, état de santé, etc.
          </li>
          <li>
            <strong>Module "Que faire ?" (Mobile)</strong> : gestes de premiers secours, conseils d’hydratation et ventilation, bouton urgence.
          </li>
          <li>
            <strong>Connexion aux bulletins CNCS/ANACIM (Web)</strong> : intégration des bulletins PDF et alertes en temps réel.
          </li>
          <li>
            <strong>Collecte de données terrain (Mobile)</strong> : signalements sanitaires, ressenti thermique, conditions environnementales locales.
          </li>
          <li>
            <strong>Module IA (Web)</strong> : création et entraînement de modèles prédictifs.
          </li>
          <li>
            <strong>Version multilingue (Mobile)</strong> : français, wolof, pulaar (audio et texte).
          </li>
          <li>
            <strong>Administration et statistiques (Web)</strong> : gestion utilisateurs, suivi des alertes, rapports, téléchargement de bulletins.
          </li>
        </ul>

        <p className="mt-10 text-gray-700 text-lg leading-relaxed">
          Notre mission est de protéger la santé de tous en améliorant la prévention et la réactivité face aux épisodes de chaleur extrême.
        </p>
      </div>
    </div>
  );
}
