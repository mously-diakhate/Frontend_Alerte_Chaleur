from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import PublicHealthReport, EmergencyAlert
from .serializers import PublicHealthReportSerializer, EmergencyAlertSerializer
from admin_dashboard.views import is_admin_user

class PublicHealthReportListView(generics.ListCreateAPIView):
    serializer_class = PublicHealthReportSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = PublicHealthReport.objects.all().select_related('region', 'reporter')
        
        # Filtres pour admin
        if self.request.user.is_authenticated and is_admin_user(self.request.user):
            verified = self.request.query_params.get('verified')
            severity = self.request.query_params.get('severity')
            region = self.request.query_params.get('region')
            
            if verified is not None:
                queryset = queryset.filter(is_verified=verified.lower() == 'true')
            if severity:
                queryset = queryset.filter(severity=severity)
            if region:
                queryset = queryset.filter(region__name__icontains=region)
        else:
            # Pour le public, seulement les rapports vérifiés
            queryset = queryset.filter(is_verified=True)
            
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(
            reporter=self.request.user if self.request.user.is_authenticated else None
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_health_report(request, report_id):
    """Vérifier un rapport de santé publique"""
    if not is_admin_user(request.user):
        return Response({'error': 'Accès non autorisé'}, status=403)
    
    try:
        report = PublicHealthReport.objects.get(id=report_id)
        report.is_verified = True
        report.verified_by = request.user
        report.save()
        
        return Response({'message': 'Rapport vérifié avec succès'})
    except PublicHealthReport.DoesNotExist:
        return Response({'error': 'Rapport non trouvé'}, status=404)

class EmergencyAlertListView(generics.ListCreateAPIView):
    serializer_class = EmergencyAlertSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return EmergencyAlert.objects.filter(is_active=True).select_related('region', 'created_by')
    
    def perform_create(self, serializer):
        if not is_admin_user(self.request.user):
            raise PermissionError("Accès non autorisé")
        serializer.save(created_by=self.request.user)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def health_reports_stats(request):
    """Statistiques des rapports de santé pour admin"""
    if not is_admin_user(request.user):
        return Response({'error': 'Accès non autorisé'}, status=403)
    
    from django.db.models import Count
    from django.utils import timezone
    from datetime import timedelta
    
    # Rapports par sévérité
    reports_by_severity = list(
        PublicHealthReport.objects.values('severity')
        .annotate(count=Count('id'))
        .order_by('-count')
    )
    
    # Rapports des 30 derniers jours
    thirty_days_ago = timezone.now() - timedelta(days=30)
    recent_reports = PublicHealthReport.objects.filter(created_at__gte=thirty_days_ago)
    
    # Évolution temporelle
    daily_reports = []
    for i in range(30, 0, -1):
        date = timezone.now() - timedelta(days=i)
        count = recent_reports.filter(created_at__date=date.date()).count()
        daily_reports.append({
            'date': date.strftime('%Y-%m-%d'),
            'reports': count
        })
    
    return Response({
        'total_reports': PublicHealthReport.objects.count(),
        'verified_reports': PublicHealthReport.objects.filter(is_verified=True).count(),
        'pending_reports': PublicHealthReport.objects.filter(is_verified=False).count(),
        'reports_by_severity': reports_by_severity,
        'daily_reports': daily_reports,
        'active_emergency_alerts': EmergencyAlert.objects.filter(is_active=True).count()
    })
