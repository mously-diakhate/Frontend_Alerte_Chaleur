from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
import requests
from .models import Region, WeatherData, WeatherAlert
from .serializers import RegionSerializer, WeatherDataSerializer, WeatherAlertSerializer

class RegionListView(generics.ListAPIView):
    queryset = Region.objects.filter(is_active=True)
    serializer_class = RegionSerializer
    permission_classes = [AllowAny]

@api_view(['GET'])
@permission_classes([AllowAny])
def weather_data(request):
    """Récupère les données météo actuelles pour toutes les régions"""
    regions = Region.objects.filter(is_active=True)
    weather_data = {}
    
    for region in regions:
        try:
            # Appel à l'API Open-Meteo
            url = f"https://api.open-meteo.com/v1/forecast"
            params = {
                'latitude': region.latitude,
                'longitude': region.longitude,
                'current': 'temperature_2m,relative_humidity_2m,weathercode,apparent_temperature,windspeed_10m,uv_index'
            }
            
            response = requests.get(url, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                current = data.get('current', {})
                
                # Sauvegarder en base
                weather_record = WeatherData.objects.create(
                    region=region,
                    temperature=current.get('temperature_2m', 0),
                    humidity=current.get('relative_humidity_2m', 0),
                    weather_code=current.get('weathercode', 0),
                    feels_like=current.get('apparent_temperature'),
                    wind_speed=current.get('windspeed_10m'),
                    uv_index=current.get('uv_index')
                )
                
                weather_data[region.name] = {
                    'temperature': current.get('temperature_2m'),
                    'humidity': current.get('relative_humidity_2m'),
                    'weather_code': current.get('weathercode'),
                    'feels_like': current.get('apparent_temperature'),
                    'wind_speed': current.get('windspeed_10m'),
                    'uv_index': current.get('uv_index'),
                    'conseils': get_health_advice(current)
                }
                
        except Exception as e:
            print(f"Erreur météo pour {region.name}: {e}")
            weather_data[region.name] = {'error': 'Données indisponibles'}
    
    return Response(weather_data)

def get_health_advice(weather_data):
    """Génère des conseils de santé basés sur les données météo"""
    conseils = []
    temp = weather_data.get('temperature_2m', 0)
    humidity = weather_data.get('relative_humidity_2m', 0)
    weather_code = weather_data.get('weathercode', 0)
    uv_index = weather_data.get('uv_index', 0)
    
    if temp > 40:
        conseils.append("🚨 Température extrême ! Restez à l'intérieur.")
    elif temp > 35:
        conseils.append("🥵 Buvez beaucoup d'eau et évitez le soleil.")
    elif temp > 30:
        conseils.append("☀️ Portez des vêtements légers et hydratez-vous.")
    
    if humidity > 80:
        conseils.append("🦟 Humidité élevée, risque de moustiques.")
    
    if uv_index and uv_index > 7:
        conseils.append("🧴 Indice UV élevé, utilisez de la crème solaire.")
    
    if weather_code in [61, 63, 65]:
        conseils.append("🌧 Pluie prévue, attention au paludisme.")
    elif weather_code == 3:
        conseils.append("🌬 Air poussiéreux, portez un masque.")
    
    return conseils if conseils else ["✅ Conditions météo normales."]

@api_view(['GET'])
@permission_classes([AllowAny])
def active_alerts(request):
    """Récupère les alertes météo actives"""
    alerts = WeatherAlert.objects.filter(
        is_active=True,
        expires_at__gt=timezone.now()
    ).select_related('region')
    
    serializer = WeatherAlertSerializer(alerts, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def region_weather_history(request, region_id):
    """Historique météo d'une région"""
    try:
        region = Region.objects.get(id=region_id)
        # Données des 7 derniers jours
        since = timezone.now() - timedelta(days=7)
        weather_history = WeatherData.objects.filter(
            region=region,
            recorded_at__gte=since
        ).order_by('-recorded_at')
        
        serializer = WeatherDataSerializer(weather_history, many=True)
        return Response(serializer.data)
    except Region.DoesNotExist:
        return Response({'error': 'Région non trouvée'}, status=404)
