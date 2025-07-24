from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.http import HttpResponse, Http404
from django.db.models import Q
from .models import MeteoBulletin, BulletinDownload
from .serializers import MeteoBulletinSerializer, BulletinUploadSerializer
from admin_dashboard.views import is_admin_user

class MeteoBulletinListView(generics.ListAPIView):
    serializer_class = MeteoBulletinSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = MeteoBulletin.objects.filter(is_active=True)
        
        # Filtres
        region = self.request.query_params.get('region')
        search = self.request.query_params.get('search')
        
        if region and region != 'Tous':
            queryset = queryset.filter(region__name__icontains=region)
        
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(region__name__icontains=search)
            )
        
        return queryset.select_related('region', 'created_by')

class MeteoBulletinCreateView(generics.CreateAPIView):
    serializer_class = BulletinUploadSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        if not is_admin_user(self.request.user):
            raise PermissionError("Accès non autorisé")
        
        serializer.save(created_by=self.request.user)

class MeteoBulletinDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MeteoBulletinSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if not is_admin_user(self.request.user):
            return MeteoBulletin.objects.none()
        return MeteoBulletin.objects.all()

@api_view(['GET'])
@permission_classes([AllowAny])
def download_bulletin(request, bulletin_id):
    """Télécharger un bulletin"""
    try:
        bulletin = MeteoBulletin.objects.get(id=bulletin_id, is_active=True)
        
        # Enregistrer le téléchargement
        BulletinDownload.objects.create(
            bulletin=bulletin,
            user=request.user if request.user.is_authenticated else None,
            ip_address=request.META.get('REMOTE_ADDR', '0.0.0.0')
        )
        
        # Incrémenter le compteur
        bulletin.download_count += 1
        bulletin.save()
        
        # Retourner le fichier
        response = HttpResponse(bulletin.file.read(), content_type='application/octet-stream')
        response['Content-Disposition'] = f'attachment; filename="{bulletin.file.name}"'
        return response
        
    except MeteoBulletin.DoesNotExist:
        raise Http404("Bulletin non trouvé")

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def bulletin_stats(request):
    """Statistiques des bulletins pour admin"""
    if not is_admin_user(request.user):
        return Response({'error': 'Accès non autorisé'}, status=403)
    
    total_bulletins = MeteoBulletin.objects.count()
    total_downloads = BulletinDownload.objects.count()
    
    # Bulletins par région
    bulletins_by_region = list(
        MeteoBulletin.objects.values('region__name')
        .annotate(count=models.Count('id'))
        .order_by('-count')
    )
    
    # Top bulletins téléchargés
    top_bulletins = MeteoBulletin.objects.order_by('-download_count')[:5]
    
    return Response({
        'total_bulletins': total_bulletins,
        'total_downloads': total_downloads,
        'bulletins_by_region': bulletins_by_region,
        'top_bulletins': MeteoBulletinSerializer(top_bulletins, many=True).data
    })
