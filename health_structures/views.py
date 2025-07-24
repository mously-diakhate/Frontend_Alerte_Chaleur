from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from .models import HealthStructure, EmergencyContact
from .serializers import HealthStructureSerializer, EmergencyContactSerializer

class HealthStructureListView(generics.ListCreateAPIView):
    serializer_class = HealthStructureSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = HealthStructure.objects.filter(is_active=True)
        region = self.request.query_params.get('region', None)
        structure_type = self.request.query_params.get('type', None)
        
        if region:
            queryset = queryset.filter(region__name__icontains=region)
        if structure_type:
            queryset = queryset.filter(structure_type=structure_type)
            
        return queryset

@api_view(['GET'])
@permission_classes([AllowAny])
def emergency_contacts(request):
    """Récupère les contacts d'urgence"""
    region = request.query_params.get('region', None)
    
    contacts = EmergencyContact.objects.filter(
        Q(is_national=True) | Q(region__name__icontains=region) if region else Q(is_national=True)
    )
    
    serializer = EmergencyContactSerializer(contacts, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_health_structure(request):
    """Permet aux utilisateurs d'ajouter une structure de santé"""
    serializer = HealthStructureSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def nearby_structures(request):
    """Trouve les structures de santé à proximité"""
    lat = request.query_params.get('lat')
    lon = request.query_params.get('lon')
    
    if not lat or not lon:
        return Response({'error': 'Coordonnées requises'}, status=400)
    
    try:
        lat = float(lat)
        lon = float(lon)
        
        # Recherche simple par proximité (à améliorer avec calcul de distance réel)
        structures = HealthStructure.objects.filter(
            is_active=True,
            latitude__range=(lat-0.1, lat+0.1),
            longitude__range=(lon-0.1, lon+0.1)
        )[:10]
        
        serializer = HealthStructureSerializer(structures, many=True)
        return Response(serializer.data)
        
    except ValueError:
        return Response({'error': 'Coordonnées invalides'}, status=400)
