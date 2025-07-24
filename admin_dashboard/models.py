from django.db import models
from django.contrib.auth import get_user_model
from weather.models import Region

User = get_user_model()

class DashboardStats(models.Model):
    """Modèle pour stocker les statistiques du dashboard"""
    date = models.DateField(auto_now_add=True)
    total_users = models.IntegerField(default=0)
    active_alerts = models.IntegerField(default=0)
    total_bulletins = models.IntegerField(default=0)
    health_reports = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-date']
        
    def __str__(self):
        return f"Stats {self.date}"

class HealthReport(models.Model):
    """Rapports sanitaires liés aux vagues de chaleur"""
    REPORT_TYPES = [
        ('heat_exhaustion', 'Épuisement par la chaleur'),
        ('dehydration', 'Déshydratation'),
        ('heat_stroke', 'Coup de chaleur'),
        ('other', 'Autre'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    region = models.ForeignKey(Region, on_delete=models.CASCADE)
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    description = models.TextField()
    temperature_at_time = models.FloatField(null=True, blank=True)
    age_group = models.CharField(max_length=50, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Rapport {self.report_type} - {self.region.name}"

class UserActivity(models.Model):
    """Suivi de l'activité des utilisateurs"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    action = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-timestamp']
        
    def __str__(self):
        return f"{self.user.email} - {self.action}"
