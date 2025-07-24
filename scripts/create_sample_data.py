from django.utils import timezone
from datetime import timedelta
from weather.models import Region
from alerts.models import MultilingualAlert
from bulletins.models import MeteoBulletin
from reports.models import PublicHealthReport
from admin_dashboard.models import HealthReport
from django.contrib.auth import get_user_model

User = get_user_model()

def create_sample_alerts():
    """Créer des alertes d'exemple"""
    regions = Region.objects.all()[:3]
    admin_user = User.objects.filter(is_admin=True).first()
    
    if not admin_user:
        print("Aucun utilisateur admin trouvé")
        return
    
    alerts_data = [
        {
            'region': regions[0],
            'alert_level': 'tres_dangereux',
            'description_fr': 'Vague de chaleur extrême prévue. Risques sanitaires très élevés.',
            'description_wolof': 'Mbiir bu bees rekk ci yooni jafe-jafe yi.',
            'description_poular': 'Ndiyam ɗiɗo nder ndiyam faaɓi.',
            'admin_name': admin_user.full_name or admin_user.username,
            'status': 'active'
        },
        {
            'region': regions[1],
            'alert_level': 'dangereux',
            'description_fr': 'Températures élevées attendues. Précautions recommandées.',
            'description_wolof': 'Jafe-jafe yu bari, dikkal bu mag.',
            'description_poular': 'Cokkiraaɗe fii, jokkondiral moƴƴi.',
            'admin_name': admin_user.full_name or admin_user.username,
            'status': 'active'
        }
    ]
    
    for alert_data in alerts_data:
        alert, created = MultilingualAlert.objects.get_or_create(
            region=alert_data['region'],
            alert_level=alert_data['alert_level'],
            defaults=alert_data
        )
        if created:
            print(f"Alerte créée pour {alert.region.name}")

def create_sample_health_reports():
    """Créer des rapports sanitaires d'exemple"""
    regions = Region.objects.all()[:5]
    
    for i, region in enumerate(regions):
        # Créer plusieurs rapports par région
        for j in range(3):
            date = timezone.now() - timedelta(days=i*2 + j)
            HealthReport.objects.create(
                region=region,
                report_type='heat_exhaustion',
                description=f'Cas d\'épuisement par la chaleur signalé dans {region.name}',
                temperature_at_time=38 + i,
                age_group='adulte',
                created_at=date
            )
    
    print("Rapports sanitaires d'exemple créés")

def create_sample_bulletins():
    """Créer des bulletins d'exemple"""
    regions = Region.objects.all()[:3]
    admin_user = User.objects.filter(is_admin=True).first()
    
    if not admin_user:
        return
    
    for region in regions:
        MeteoBulletin.objects.create(
            title=f'Bulletin Canicule - {region.name} - {timezone.now().strftime("%B %Y")}',
            region=region,
            description=f'Bulletin météorologique pour la région de {region.name}',
            created_by=admin_user
        )
    
    print("Bulletins d'exemple créés")

if __name__ == "__main__":
    create_sample_alerts()
    create_sample_health_reports()
    create_sample_bulletins()
    print("Données d'exemple créées avec succès")
