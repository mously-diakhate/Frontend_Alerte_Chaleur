from django.contrib.auth.models import AbstractUser
from django.db import models

# Définir les choix de situation comme constante
SITUATION_CHOICES = [
    ('personne_agee', 'Personne âgée'),
    ('femme_enceinte', 'Femme enceinte'),
    ('personne_risque', 'Personne à risque'),
    ('enfant', 'Enfant'),
    ('aucune', 'Aucune situation particulière'),
]

class User(AbstractUser):
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255, blank=True)
    situation = models.CharField(max_length=20, choices=SITUATION_CHOICES, default='aucune')
    region = models.CharField(max_length=100, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    is_admin = models.BooleanField(default=False)
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

class AdminUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    admin_level = models.CharField(max_length=20, choices=[
        ('super', 'Super Admin'),
        ('regional', 'Admin Régional'),
        ('local', 'Admin Local'),
    ], default='local')
    managed_regions = models.JSONField(default=list, blank=True)
    
    def __str__(self):
        return f"Admin: {self.user.email}"
