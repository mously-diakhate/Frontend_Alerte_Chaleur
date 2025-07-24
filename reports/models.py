from django.db import models
from django.contrib.auth import get_user_model
from weather.models import Region

User = get_user_model()

class PublicHealthReport(models.Model):
    """Rapports de santé publique liés aux vagues de chaleur"""
    SEVERITY_LEVELS = [
        ('mild', 'Léger'),
        ('moderate', 'Modéré'),
        ('severe', 'Sévère'),
        ('critical', 'Critique'),
    ]
    
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    region = models.ForeignKey(Region, on_delete=models.CASCADE)
    severity = models.CharField(max_length=20, choices=SEVERITY_LEVELS)
    description = models.TextField()
    location_details = models.CharField(max_length=200, blank=True)
    temperature_reported = models.FloatField(null=True, blank=True)
    affected_people_count = models.IntegerField(default=1)
    symptoms_observed = models.JSONField(default=list, blank=True)
    actions_taken = models.TextField(blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, 
        related_name='verified_reports'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Rapport {self.severity} - {self.region.name}"

class EmergencyAlert(models.Model):
    """Alertes d'urgence pour situations critiques"""
    region = models.ForeignKey(Region, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    message = models.TextField()
    alert_type = models.CharField(max_length=50, choices=[
        ('heat_emergency', 'Urgence canicule'),
        ('health_crisis', 'Crise sanitaire'),
        ('evacuation', 'Évacuation'),
        ('medical_emergency', 'Urgence médicale'),
    ])
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.title} - {self.region.name}"
