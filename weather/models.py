from django.db import models

class Region(models.Model):
    name = models.CharField(max_length=100, unique=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    population = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name

class WeatherData(models.Model):
    region = models.ForeignKey(Region, on_delete=models.CASCADE)
    temperature = models.FloatField()
    humidity = models.FloatField()
    weather_code = models.IntegerField()
    feels_like = models.FloatField(null=True, blank=True)
    wind_speed = models.FloatField(null=True, blank=True)
    uv_index = models.FloatField(null=True, blank=True)
    recorded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-recorded_at']
        
    def __str__(self):
        return f"{self.region.name} - {self.temperature}°C"

class WeatherAlert(models.Model):
    ALERT_LEVELS = [
        ('low', 'Faible'),
        ('medium', 'Modéré'),
        ('high', 'Élevé'),
        ('very_high', 'Très élevé'),
        ('extreme', 'Extrême'),
    ]
    
    region = models.ForeignKey(Region, on_delete=models.CASCADE)
    alert_level = models.CharField(max_length=20, choices=ALERT_LEVELS)
    temperature_threshold = models.FloatField()
    message = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    def __str__(self):
        return f"Alerte {self.alert_level} - {self.region.name}"
