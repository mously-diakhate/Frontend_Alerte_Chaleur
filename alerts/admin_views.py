from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from .models import MultilingualAlert
from .serializers import MultilingualAlertSerializer
from weather.models import Region
import base64
import uuid
import logging

logger = logging.getLogger(__name__)

def is_admin_user(user):
    """Vérifier si l'utilisateur est admin"""
    return user.is_authenticated and (user.is_staff or user.is_superuser)

class AdminAlertListView(generics.ListCreateAPIView):
    serializer_class = MultilingualAlertSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = MultilingualAlert.objects.all().select_related('region')
        
        # Filtres
        level = self.request.query_params.get('level')
        region = self.request.query_params.get('region')
        status_param = self.request.query_params.get('status')
        
        if level and level != 'Tous':
            queryset = queryset.filter(alert_level=level)
        if region:
            queryset = queryset.filter(region__name__icontains=region)
        if status_param:
            queryset = queryset.filter(status=status_param)
            
        return queryset
    
    def create(self, request, *args, **kwargs):
        try:
            logger.info(f"Données reçues: {request.data}")
            logger.info(f"Utilisateur: {request.user}")
            
            # Copier les données pour les modifier
            data = request.data.copy()
            
            # Gérer la région - la trouver ou la créer avec des valeurs par défaut
            region_name = data.get('region')
            if region_name:
                try:
                    region = Region.objects.get(name=region_name)
                    data['region'] = region.id
                    logger.info(f"Région trouvée: {region.name} (ID: {region.id})")
                except Region.DoesNotExist:
                    # Créer la région avec des valeurs par défaut
                    region = Region.objects.create(
                        name=region_name,
                        latitude=14.6928,  # Coordonnées par défaut (Dakar)
                        longitude=-17.4467,
                        population=0,
                        is_active=True
                    )
                    data['region'] = region.id
                    logger.info(f"Région créée: {region.name} (ID: {region.id})")
            
            # Traiter l'audio si présent
            audio_data = data.get('audio_blob')
            if audio_data:
                try:
                    logger.info("Traitement de l'audio...")
                    if ';base64,' in audio_data:
                        format_part, audio_str = audio_data.split(';base64,')
                        audio_file = ContentFile(
                            base64.b64decode(audio_str),
                            name=f'alert_audio_{uuid.uuid4()}.webm'
                        )
                        data['audio_message'] = audio_file
                        logger.info("Audio traité avec succès")
                    data.pop('audio_blob', None)
                except Exception as e:
                    logger.error(f"Erreur audio: {e}")
                    data.pop('audio_blob', None)
            
            # S'assurer que admin_name est défini
            if 'admin_name' not in data or not data['admin_name']:
                data['admin_name'] = request.user.username or 'Admin'
            
            logger.info(f"Données finales: {dict(data)}")
            
            # Utiliser le sérialiseur
            serializer = self.get_serializer(data=data)
            if serializer.is_valid():
                instance = serializer.save()
                logger.info(f"Alerte créée avec ID: {instance.id}")
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                logger.error(f"Erreurs de validation: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Erreur création: {e}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return Response(
                {'error': f'Erreur interne: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AdminAlertDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MultilingualAlertSerializer
    permission_classes = [IsAuthenticated]
    queryset = MultilingualAlert.objects.all()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_audio_alert(request):
    """Upload d'un message audio pour une alerte"""
    audio_file = request.FILES.get('audio')
    if not audio_file:
        return Response({'error': 'Fichier audio requis'}, status=400)
    
    # Vérifier le type de fichier
    allowed_types = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/ogg']
    if audio_file.content_type not in allowed_types:
        return Response({'error': 'Type de fichier audio non autorisé'}, status=400)
    
    # Vérifier la taille (max 5MB)
    if audio_file.size > 5 * 1024 * 1024:
        return Response({'error': 'Fichier audio trop volumineux (max 5MB)'}, status=400)
    
    # Sauvegarder le fichier
    filename = f'alert_audio_{uuid.uuid4()}.{audio_file.name.split(".")[-1]}'
    file_path = default_storage.save(f'alerts/audio/{filename}', audio_file)
    
    return Response({
        'message': 'Audio uploadé avec succès',
        'file_path': file_path,
        'file_url': default_storage.url(file_path)
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def alert_statistics(request):
    """Statistiques des alertes pour admin"""
    from django.db.models import Count
    
    # Alertes par niveau
    alerts_by_level = list(
        MultilingualAlert.objects.values('alert_level')
        .annotate(count=Count('id'))
        .order_by('-count')
    )
    
    # Alertes par région
    alerts_by_region = list(
        MultilingualAlert.objects.values('region__name')
        .annotate(count=Count('id'))
        .order_by('-count')
    )
    
    # Alertes par statut
    alerts_by_status = list(
        MultilingualAlert.objects.values('status')
        .annotate(count=Count('id'))
    )
    
    return Response({
        'alerts_by_level': alerts_by_level,
        'alerts_by_region': alerts_by_region,
        'alerts_by_status': alerts_by_status,
        'total_alerts': MultilingualAlert.objects.count(),
        'active_alerts': MultilingualAlert.objects.filter(status='active').count()
    })
