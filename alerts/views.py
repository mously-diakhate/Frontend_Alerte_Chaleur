from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from .models import PersonalizedAlert, AlertTemplate, SITUATION_CHOICES
from .serializers import PersonalizedAlertSerializer, AlertTemplateSerializer

class UserAlertsView(generics.ListAPIView):
    serializer_class = PersonalizedAlertSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return PersonalizedAlert.objects.filter(user=self.request.user)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_alert_read(request, alert_id):
    try:
        alert = PersonalizedAlert.objects.get(id=alert_id, user=request.user)
        alert.is_read = True
        alert.save()
        return Response({'message': 'Alerte marquée comme lue'})
    except PersonalizedAlert.DoesNotExist:
        return Response({'error': 'Alerte non trouvée'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_personalized_alert(request):
    """Génère une alerte personnalisée pour l'utilisateur connecté"""
    user = request.user
    
    # Logique de génération d'alerte basée sur le profil utilisateur
    alert_data = generate_personalized_alert(user)
    
    return Response(alert_data)

def generate_personalized_alert(user):
    """Génère une alerte personnalisée selon le profil utilisateur"""
    
    # Messages de prévention par situation
    prevention_messages = {
        'personne_agee': "Buvez régulièrement de l'eau, restez à l'ombre, évitez de sortir entre 12h et 16h.",
        'femme_enceinte': "Hydratez-vous souvent, portez des vêtements amples, évitez l'effort physique.",
        'enfant': "Assurez-vous que l'enfant boit de l'eau, reste dans un endroit frais et aéré.",
        'personne_risque': "Prenez vos traitements, évitez les sorties prolongées, consultez un médecin si besoin.",
        'aucune': "Restez hydraté et évitez l'exposition prolongée au soleil."
    }
    
    # Simulation de données météo (à remplacer par vraies données)
    alert_data = {
        'user_name': user.full_name or user.username,
        'situation': user.situation,
        'region': user.region or 'Dakar',
        'vigilance': 'Très dangereux',  # À calculer selon vraies données
        'temperature': {
            'day': 42,  # À récupérer des vraies données
            'night': 34
        },
        'prevention_message': prevention_messages.get(user.situation, prevention_messages['aucune']),
        'alert_level': 'high',
        'recommendations': get_situation_recommendations(user.situation)
    }
    
    return alert_data

def get_situation_recommendations(situation):
    """Retourne des recommandations spécifiques selon la situation"""
    recommendations = {
        'personne_agee': [
            "Restez dans un endroit frais et climatisé",
            "Buvez de l'eau toutes les heures",
            "Portez des vêtements légers et clairs",
            "Évitez les sorties aux heures chaudes"
        ],
        'femme_enceinte': [
            "Consultez votre médecin en cas de malaise",
            "Évitez les efforts physiques",
            "Prenez des douches fraîches",
            "Reposez-vous fréquemment"
        ],
        'enfant': [
            "Surveillez les signes de déshydratation",
            "Proposez de l'eau régulièrement",
            "Évitez les jeux en extérieur",
            "Maintenez l'enfant au frais"
        ],
        'personne_risque': [
            "Respectez votre traitement médical",
            "Contactez votre médecin si nécessaire",
            "Évitez l'exposition directe au soleil",
            "Surveillez votre état de santé"
        ]
    }
    
    return recommendations.get(situation, [
        "Restez hydraté",
        "Évitez l'exposition au soleil",
        "Portez des vêtements adaptés"
    ])
