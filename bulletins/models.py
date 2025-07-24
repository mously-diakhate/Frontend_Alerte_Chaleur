from django.db import models
from django.contrib.auth import get_user_model
from weather.models import Region
import os

User = get_user_model()

def bulletin_upload_path(instance, filename):
    """Chemin de téléchargement des bulletins"""
    return f'bulletins/{instance.region.name}/{filename}'

class MeteoBulletin(models.Model):
    title = models.CharField(max_length=200)
    region = models.ForeignKey(Region, on_delete=models.CASCADE)
    file = models.FileField(upload_to=bulletin_upload_path)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    download_count = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.title} - {self.region.name}"
    
    @property
    def file_size(self):
        if self.file:
            return self.file.size
        return 0
    
    @property
    def file_extension(self):
        if self.file:
            return os.path.splitext(self.file.name)[1]
        return ''

class BulletinDownload(models.Model):
    """Suivi des téléchargements de bulletins"""
    bulletin = models.ForeignKey(MeteoBulletin, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    downloaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.bulletin.title} - {self.downloaded_at}"
