from django.db import models
from weather.models import Region

class HealthStructure(models.Model):
    STRUCTURE_TYPES = [
        ('hospital', 'Hôpital'),
        ('clinic', 'Clinique'),
        ('health_center', 'Centre de santé'),
        ('pharmacy', 'Pharmacie'),
        ('emergency', 'Service d\'urgence'),
    ]
    
    name = models.CharField(max_length=200)
    structure_type = models.CharField(max_length=20, choices=STRUCTURE_TYPES)
    address = models.TextField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    region = models.ForeignKey(Region, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    emergency_contact = models.CharField(max_length=20, blank=True)
    capacity = models.IntegerField(null=True, blank=True)
    specialties = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} - {self.region.name}"

class EmergencyContact(models.Model):
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    region = models.ForeignKey(Region, on_delete=models.CASCADE, null=True, blank=True)
    is_national = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.name} - {self.phone}"
