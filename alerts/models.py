from django.db import models
from django.contrib.auth import get_user_model
from weather.models import Region

# Définir les choix de situation ici pour éviter les références circulaires
SITUATION_CHOICES = [
    ('personne_agee', 'Personne âgée'),
    ('femme_enceinte', 'Femme enceinte'),
    ('personne_risque', 'Personne à risque'),
    ('enfant', 'Enfant'),
    ('aucune', 'Aucune situation particulière'),
]

User = get_user_model()

class PersonalizedAlert(models.Model):
    ALERT_TYPES = [
        ('heat_wave', 'Vague de chaleur'),
        ('health_risk', 'Risque sanitaire'),
        ('weather_warning', 'Alerte météo'),
        ('emergency', 'Urgence'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    message_wolof = models.TextField(blank=True)
    message_poular = models.TextField(blank=True)
    audio_message = models.FileField(upload_to='alerts/audio/', null=True, blank=True)
    priority = models.CharField(max_length=20, choices=[
        ('low', 'Faible'),
        ('medium', 'Moyen'),
        ('high', 'Élevé'),
        ('urgent', 'Urgent')
    ], default='medium')
    region = models.ForeignKey(Region, on_delete=models.CASCADE, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    is_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.user.email}"

class AlertTemplate(models.Model):
    name = models.CharField(max_length=100)
    situation = models.CharField(max_length=20, choices=SITUATION_CHOICES)
    temperature_threshold = models.FloatField()
    message_template = models.TextField()
    recommendations = models.TextField()
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} - {self.situation}"

class MultilingualAlert(models.Model):
    """Alertes multilingues pour l'administration"""
    ALERT_LEVELS = [
        ('tres_dangereux', 'Très dangereux'),
        ('dangereux', 'Dangereux'),
        ('tres_inconfortable', 'Très inconfortable'),
        ('inconfortable', 'Inconfortable'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('expired', 'Expirée'),
    ]
    
    region = models.ForeignKey('weather.Region', on_delete=models.CASCADE)
    alert_level = models.CharField(max_length=20, choices=ALERT_LEVELS)
    
    # Messages multilingues
    description_fr = models.TextField(verbose_name="Description (Français)")
    description_wolof = models.TextField(blank=True, verbose_name="Description (Wolof)")
    description_poular = models.TextField(blank=True, verbose_name="Description (Poular)")
    
    # Message audio
    audio_message = models.FileField(upload_to='alerts/audio/', null=True, blank=True)
    
    admin_name = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.alert_level} - {self.region.name}"
