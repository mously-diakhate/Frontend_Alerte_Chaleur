from celery import shared_task
from django.utils import timezone
from datetime import timedelta
import requests
from .models import Region, WeatherData, WeatherAlert
from alerts.models import PersonalizedAlert, AlertTemplate
from django.contrib.auth import get_user_model

User = get_user_model()

@shared_task
def fetch_weather_data():
    """Tâche périodique pour récupérer les données météo"""
    regions = Region.objects.filter(is_active=True)
    
    for region in regions:
        try:
            url = "https://api.open-meteo.com/v1/forecast"
            params = {
                'latitude': region.latitude,
                'longitude': region.longitude,
                'current': 'temperature_2m,relative_humidity_2m,weathercode,apparent_temperature'
            }
            
            response = requests.get(url, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                current = data.get('current', {})
                
                WeatherData.objects.create(
                    region=region,
                    temperature=current.get('temperature_2m', 0),
                    humidity=current.get('relative_humidity_2m', 0),
                    weather_code=current.get('weathercode', 0),
                    feels_like=current.get('apparent_temperature')
                )
                
                # Vérifier si une alerte doit être créée
                check_weather_alerts.delay(region.id, current.get('temperature_2m', 0))
                
        except Exception as e:
            print(f"Erreur météo pour {region.name}: {e}")

@shared_task
def check_weather_alerts(region_id, temperature):
    """Vérifie et crée des alertes météo si nécessaire"""
    try:
        region = Region.objects.get(id=region_id)
        
        # Seuils d'alerte
        if temperature > 40:
            alert_level = 'extreme'
            message = f"Alerte extrême pour {region.name}: {temperature}°C"
        elif temperature > 35:
            alert_level = 'very_high'
            message = f"Alerte très élevée pour {region.name}: {temperature}°C"
        elif temperature > 30:
            alert_level = 'high'
            message = f"Alerte élevée pour {region.name}: {temperature}°C"
        else:
            return
        
        # Créer l'alerte météo
        expires_at = timezone.now() + timedelta(hours=6)
        weather_alert, created = WeatherAlert.objects.get_or_create(
            region=region,
            alert_level=alert_level,
            temperature_threshold=temperature,
            defaults={
                'message': message,
                'expires_at': expires_at
            }
        )
        
        if created:
            # Créer des alertes personnalisées pour les utilisateurs de cette région
            create_personalized_alerts.delay(region.id, alert_level, temperature)
            
    except Region.DoesNotExist:
        pass

@shared_task
def create_personalized_alerts(region_id, alert_level, temperature):
    """Crée des alertes personnalisées pour les utilisateurs"""
    try:
        region = Region.objects.get(id=region_id)
        users = User.objects.filter(region=region.name, email_notifications=True)
        
        for user in users:
            # Générer message personnalisé selon la situation
            template = AlertTemplate.objects.filter(
                situation=user.situation,
                temperature_threshold__lte=temperature,
                is_active=True
            ).first()
            
            if template:
                message = template.message_template.format(
                    name=user.full_name or user.username,
                    temperature=temperature,
                    region=region.name
                )
                
                PersonalizedAlert.objects.create(
                    user=user,
                    alert_type='heat_wave',
                    title=f"Alerte canicule - {region.name}",
                    message=message,
                    region=region
                )
                
    except Region.DoesNotExist:
        pass

@shared_task
def cleanup_old_weather_data():
    """Nettoie les anciennes données météo (garde 30 jours)"""
    cutoff_date = timezone.now() - timedelta(days=30)
    deleted_count = WeatherData.objects.filter(recorded_at__lt=cutoff_date).delete()[0]
    print(f"Supprimé {deleted_count} anciennes données météo")

@shared_task
def cleanup_expired_alerts():
    """Désactive les alertes expirées"""
    expired_alerts = WeatherAlert.objects.filter(
        expires_at__lt=timezone.now(),
        is_active=True
    )
    count = expired_alerts.update(is_active=False)
    print(f"Désactivé {count} alertes expirées")
