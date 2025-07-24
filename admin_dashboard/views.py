from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta, datetime
from .models import DashboardStats, HealthReport, UserActivity
from .serializers import (
    DashboardStatsSerializer, HealthReportSerializer, 
    UserActivitySerializer, AdminUserManagementSerializer,
    UserCreateUpdateSerializer
)
from alerts.models import PersonalizedAlert
from weather.models import WeatherAlert, Region
from bulletins.models import MeteoBulletin

User = get_user_model()

def is_admin_user(user):
    """Vérifie si l'utilisateur est admin"""
    return user.is_authenticated and (user.is_admin or user.is_superuser)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Statistiques pour le dashboard admin"""
    if not is_admin_user(request.user):
        return Response({'error': 'Accès non autorisé'}, status=403)
    
    # Statistiques générales
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    active_alerts = WeatherAlert.objects.filter(is_active=True).count()
    total_bulletins = MeteoBulletin.objects.count()
    
    # Rapports sanitaires aujourd'hui
    today = timezone.now().date()
    health_reports_today = HealthReport.objects.filter(created_at__date=today).count()
    
    # Alertes par région (30 derniers jours)
    thirty_days_ago = timezone.now() - timedelta(days=30)
    alerts_by_region = list(
        WeatherAlert.objects.filter(created_at__gte=thirty_days_ago)
        .values('region__name')
        .annotate(alerts=Count('id'))
        .order_by('-alerts')[:10]
    )
    
    # Formatage pour le frontend
    alerts_by_region = [
        {'region': item['region__name'], 'alerts': item['alerts']}
        for item in alerts_by_region
    ]
    
    # Rapports sanitaires des 30 derniers jours
    health_impact_reports = []
    for i in range(30, 0, -5):  # Tous les 5 jours
        date = timezone.now() - timedelta(days=i)
        reports_count = HealthReport.objects.filter(
            created_at__date=date.date()
        ).count()
        health_impact_reports.append({
            'date': date.strftime('%Y-%m-%d'),
            'reports': reports_count
        })
    
    # Statistiques des profils utilisateurs
    user_profiles_stats = list(
        User.objects.values('situation')
        .annotate(count=Count('id'))
        .exclude(situation='')
    )
    
    # Formatage des profils
    profile_mapping = {
        'personne_agee': 'Personnes âgées',
        'femme_enceinte': 'Femmes enceintes',
        'enfant': 'Enfants',
        'personne_risque': 'Maladies chroniques',
        'aucune': 'Aucune situation particulière'
    }
    
    user_profiles_stats = [
        {
            'profile': profile_mapping.get(item['situation'], item['situation']),
            'count': item['count']
        }
        for item in user_profiles_stats
    ]
    
    data = {
        'total_users': total_users,
        'active_users': active_users,
        'active_alerts': active_alerts,
        'total_bulletins': total_bulletins,
        'health_reports_today': health_reports_today,
        'alerts_by_region': alerts_by_region,
        'health_impact_reports': health_impact_reports,
        'user_profiles_stats': user_profiles_stats
    }
    
    serializer = DashboardStatsSerializer(data)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def refresh_dashboard_data(request):
    """Rafraîchit les données du dashboard"""
    if not is_admin_user(request.user):
        return Response({'error': 'Accès non autorisé'}, status=403)
    
    # Enregistrer l'activité
    UserActivity.objects.create(
        user=request.user,
        action='Dashboard data refresh',
        ip_address=request.META.get('REMOTE_ADDR')
    )
    
    return Response({'message': 'Données rafraîchies avec succès'})

class HealthReportListView(generics.ListCreateAPIView):
    serializer_class = HealthReportSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if not is_admin_user(self.request.user):
            return HealthReport.objects.none()
        
        queryset = HealthReport.objects.all().select_related('user', 'region')
        
        # Filtres
        region = self.request.query_params.get('region')
        report_type = self.request.query_params.get('type')
        verified = self.request.query_params.get('verified')
        
        if region:
            queryset = queryset.filter(region__name__icontains=region)
        if report_type:
            queryset = queryset.filter(report_type=report_type)
        if verified is not None:
            queryset = queryset.filter(is_verified=verified.lower() == 'true')
            
        return queryset

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_health_report(request, report_id):
    """Vérifier un rapport sanitaire"""
    if not is_admin_user(request.user):
        return Response({'error': 'Accès non autorisé'}, status=403)
    
    try:
        report = HealthReport.objects.get(id=report_id)
        report.is_verified = True
        report.save()
        
        UserActivity.objects.create(
            user=request.user,
            action=f'Verified health report {report_id}',
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return Response({'message': 'Rapport vérifié avec succès'})
    except HealthReport.DoesNotExist:
        return Response({'error': 'Rapport non trouvé'}, status=404)

class AdminUserListView(generics.ListAPIView):
    serializer_class = AdminUserManagementSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if not is_admin_user(self.request.user):
            return User.objects.none()
        
        queryset = User.objects.all().order_by('-created_at')
        
        # Filtres
        role = self.request.query_params.get('role')
        search = self.request.query_params.get('search')
        status = self.request.query_params.get('status')
        
        if role and role != 'Tous':
            if role.lower() == 'admin':
                queryset = queryset.filter(is_admin=True)
            elif role.lower() == 'user':
                queryset = queryset.filter(is_admin=False)
        
        if search:
            queryset = queryset.filter(
                Q(full_name__icontains=search) |
                Q(email__icontains=search) |
                Q(region__icontains=search)
            )
        
        if status:
            if status.lower() == 'actif':
                queryset = queryset.filter(is_active=True)
            elif status.lower() == 'inactif':
                queryset = queryset.filter(is_active=False)
        
        return queryset

class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserCreateUpdateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if not is_admin_user(self.request.user):
            return User.objects.none()
        return User.objects.all()
    
    def perform_update(self, serializer):
        UserActivity.objects.create(
            user=self.request.user,
            action=f'Updated user {serializer.instance.email}',
            ip_address=self.request.META.get('REMOTE_ADDR')
        )
        serializer.save()
    
    def perform_destroy(self, instance):
        UserActivity.objects.create(
            user=self.request.user,
            action=f'Deleted user {instance.email}',
            ip_address=self.request.META.get('REMOTE_ADDR')
        )
        instance.delete()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_user(request):
    """Créer un nouvel utilisateur"""
    if not is_admin_user(request.user):
        return Response({'error': 'Accès non autorisé'}, status=403)
    
    serializer = UserCreateUpdateSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        UserActivity.objects.create(
            user=request.user,
            action=f'Created user {user.email}',
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return Response(AdminUserManagementSerializer(user).data, status=201)
    return Response(serializer.errors, status=400)

class UserActivityListView(generics.ListAPIView):
    serializer_class = UserActivitySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if not is_admin_user(self.request.user):
            return UserActivity.objects.none()
        
        return UserActivity.objects.all().select_related('user')[:100]
