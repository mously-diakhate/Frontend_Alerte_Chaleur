from django.contrib import admin
from .models import Region, WeatherData, WeatherAlert

@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_display = ('name', 'latitude', 'longitude', 'population', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name',)

@admin.register(WeatherData)
class WeatherDataAdmin(admin.ModelAdmin):
    list_display = ('region', 'temperature', 'humidity', 'weather_code', 'recorded_at')
    list_filter = ('region', 'recorded_at')
    search_fields = ('region__name',)
    ordering = ('-recorded_at',)

@admin.register(WeatherAlert)
class WeatherAlertAdmin(admin.ModelAdmin):
    list_display = ('region', 'alert_level', 'temperature_threshold', 'is_active', 'created_at')
    list_filter = ('alert_level', 'is_active', 'region')
    search_fields = ('region__name', 'message')
