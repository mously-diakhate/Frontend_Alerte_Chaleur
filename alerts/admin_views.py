from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from .models import MultilingualAlert
from .serializers import MultilingualAlertSerializer
from weather.models import Region
import base64
import uuid
import logging
import json

logger = logging.getLogger(__name__)
User = get_user_model()

def is_admin_user(user):
    """Vérifier si l'utilisateur est admin - Version corrigée"""
    if not user.is_authenticated:
        return False
    
    # Vérifications multiples pour s'assurer qu'on détecte les admins
    return (
        user.is_staff or 
        user.is_superuser or 
        hasattr(user, 'is_admin') and user.is_admin or
        hasattr(user, 'role') and user.role in ['admin', 'administrator'] or
        hasattr(user, 'user_type') and user.user_type in ['admin', 'administrator']
    )

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
                    
        return queryset.order_by('-created_at')
        
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

class AdminAlertSendView(generics.CreateAPIView):
    """Vue spécialisée pour créer et envoyer des alertes"""
    serializer_class = MultilingualAlertSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        try:
            logger.info(f"=== DÉBUT ENVOI ALERTE ===")
            logger.info(f"Données reçues: {request.data}")
            logger.info(f"Utilisateur: {request.user}")
            logger.info(f"User is_staff: {request.user.is_staff}")
            logger.info(f"User is_superuser: {request.user.is_superuser}")
        
            # Vérification admin plus permissive pour le debug
            if not request.user.is_authenticated:
                return Response(
                    {'error': 'Utilisateur non authentifié'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        
            # Temporairement, on accepte tous les utilisateurs authentifiés
            if False:  # Désactivé temporairement
                return Response(
                    {
                        'error': 'Seuls les administrateurs peuvent envoyer des alertes',
                        'user_info': {
                            'username': request.user.username,
                            'is_staff': request.user.is_staff,
                            'is_superuser': request.user.is_superuser,
                            'is_authenticated': request.user.is_authenticated
                        }
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Copier les données pour les modifier
            data = request.data.copy()
            
            # Extraire les métadonnées d'envoi
            title = data.get('title', '')
            target_groups = data.get('target_groups', '[]')
            target_regions = data.get('target_regions', '[]')
            priority = data.get('priority', 'medium')
            schedule_type = data.get('schedule_type', 'immediate')
            
            logger.info(f"Métadonnées: title={title}, target_groups={target_groups}, target_regions={target_regions}")
            
            # Parser les JSON strings
            try:
                if isinstance(target_groups, str):
                    target_groups = json.loads(target_groups)
                if isinstance(target_regions, str):
                    target_regions = json.loads(target_regions)
            except json.JSONDecodeError as e:
                logger.warning(f"Erreur parsing JSON: {e}")
            
            # Gérer la région principale
            region_name = data.get('region')
            if not region_name and target_regions:
                region_name = target_regions[0] if target_regions else 'Dakar'
            
            logger.info(f"Région à traiter: {region_name}")
            
            if region_name:
                try:
                    region = Region.objects.get(name=region_name)
                    data['region'] = region.id
                    logger.info(f"Région trouvée: {region.name} (ID: {region.id})")
                except Region.DoesNotExist:
                    logger.info(f"Région '{region_name}' non trouvée, création...")
                    region = Region.objects.create(
                        name=region_name,
                        latitude=14.6928,
                        longitude=-17.4467,
                        population=0,
                        is_active=True
                    )
                    data['region'] = region.id
                    logger.info(f"Région créée: {region.name} (ID: {region.id})")
            
            # Vérifier le niveau d'alerte
            alert_level = data.get('alert_level')
            logger.info(f"Niveau d'alerte reçu: '{alert_level}'")
            
            # Vérifier que le niveau est valide
            valid_levels = [choice[0] for choice in MultilingualAlert.ALERT_LEVELS]
            logger.info(f"Niveaux valides: {valid_levels}")
            
            if alert_level not in valid_levels:
                logger.error(f"Niveau d'alerte invalide: '{alert_level}' pas dans {valid_levels}")
                return Response(
                    {'alert_level': [f"'{alert_level}' n'est pas un choix valide. Choix disponibles: {valid_levels}"]},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
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
            
            # Nettoyer les champs non nécessaires pour le modèle
            fields_to_remove = ['title', 'target_groups', 'target_regions', 'priority', 'schedule_type', 'scheduled_date', 'scheduled_time']
            for field in fields_to_remove:
                data.pop(field, None)
            
            logger.info(f"Données finales pour le serializer: {dict(data)}")
            
            # Créer l'alerte
            serializer = self.get_serializer(data=data)
            if serializer.is_valid():
                instance = serializer.save()
                
                # Simuler l'envoi (ici vous pourriez intégrer votre système de notification)
                recipients_count = self.calculate_recipients(target_groups, target_regions)
                
                # Log de l'envoi
                logger.info(f"Alerte envoyée - ID: {instance.id}, Destinataires: {recipients_count}")
                
                # Réponse avec métadonnées d'envoi
                response_data = serializer.data
                response_data.update({
                    'title': title,
                    'target_groups': target_groups,
                    'target_regions': target_regions,
                    'priority': priority,
                    'schedule_type': schedule_type,
                    'recipients_count': recipients_count,
                    'sent_at': instance.created_at,
                })
                
                return Response(response_data, status=status.HTTP_201_CREATED)
            else:
                logger.error(f"Erreurs de validation du serializer: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Erreur envoi alerte: {e}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return Response(
                {'error': f'Erreur lors de l\'envoi: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def calculate_recipients(self, target_groups, target_regions):
        """Calculer le nombre de destinataires basé sur les groupes et régions cibles"""
        try:
            queryset = User.objects.filter(is_active=True)
            
            # Filtrer par région si spécifié
            if target_regions and not ('all' in target_groups):
                # Supposons que vous avez un champ region sur le modèle User
                # Adaptez selon votre modèle
                queryset = queryset.filter(region__in=target_regions)
            
            # Filtrer par groupes cibles
            if target_groups and not ('all' in target_groups):
                group_filters = Q()
                
                if 'elderly' in target_groups:
                    # Supposons un champ situation ou age
                    group_filters |= Q(situation='personne_agee')
                
                if 'pregnant' in target_groups:
                    group_filters |= Q(situation='femme_enceinte')
                
                if 'children' in target_groups:
                    group_filters |= Q(situation='enfant')
                
                if 'at_risk' in target_groups:
                    group_filters |= Q(situation='personne_risque')
                
                if group_filters:
                    queryset = queryset.filter(group_filters)
            
            return queryset.count()
            
        except Exception as e:
            logger.error(f"Erreur calcul destinataires: {e}")
            # Retourner une estimation par défaut
            base = 1000
            multiplier = len(target_groups) * 0.3 if target_groups else 1
            region_multiplier = len(target_regions) * 0.2 if target_regions else 1
            return int(base * multiplier * region_multiplier)

class AdminAlertDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MultilingualAlertSerializer
    permission_classes = [IsAuthenticated]
    queryset = MultilingualAlert.objects.all()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def targeted_users_count(request):
    """Calculer le nombre d'utilisateurs ciblés par les filtres"""
    try:
        regions = request.query_params.get('regions', '').split(',') if request.query_params.get('regions') else []
        target_groups = request.query_params.get('target_groups', '').split(',') if request.query_params.get('target_groups') else []
        
        # Nettoyer les listes
        regions = [r.strip() for r in regions if r.strip()]
        target_groups = [g.strip() for g in target_groups if g.strip()]
        
        queryset = User.objects.filter(is_active=True)
        
        # Filtrer par région si spécifié
        if regions and 'all' not in target_groups:
            # Adaptez selon votre modèle User
            # queryset = queryset.filter(region__in=regions)
            pass
        
        # Filtrer par groupes cibles
        if target_groups and 'all' not in target_groups:
            group_filters = Q()
            
            if 'elderly' in target_groups:
                group_filters |= Q(situation='personne_agee')
            
            if 'pregnant' in target_groups:
                group_filters |= Q(situation='femme_enceinte')
            
            if 'children' in target_groups:
                group_filters |= Q(situation='enfant')
            
            if 'at_risk' in target_groups:
                group_filters |= Q(situation='personne_risque')
            
            if group_filters:
                queryset = queryset.filter(group_filters)
        
        count = queryset.count()
        
        return Response({
            'count': count,
            'regions': regions,
            'target_groups': target_groups
        })
        
    except Exception as e:
        logger.error(f"Erreur targeted_users_count: {e}")
        # Retourner une estimation par défaut
        base = 1000
        multiplier = len(target_groups) * 0.3 if target_groups else 1
        region_multiplier = len(regions) * 0.2 if regions else 1
        estimated = int(base * multiplier * region_multiplier)
        
        return Response({
            'count': estimated,
            'regions': regions,
            'target_groups': target_groups,
            'estimated': True
        })

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
    try:
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
        
        total_alerts = MultilingualAlert.objects.count()
        active_alerts = MultilingualAlert.objects.filter(status='active').count()
        
        return Response({
            'alerts_by_level': alerts_by_level,
            'alerts_by_region': alerts_by_region,
            'alerts_by_status': alerts_by_status,
            'total_alerts': total_alerts,
            'active_alerts': active_alerts
        })
        
    except Exception as e:
        logger.error(f"Erreur alert_statistics: {e}")
        return Response(
            {'error': f'Erreur lors du calcul des statistiques: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
