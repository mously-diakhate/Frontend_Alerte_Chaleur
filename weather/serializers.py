from rest_framework import serializers
from .models import Region, WeatherData, WeatherAlert

class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = '__all__'

class WeatherDataSerializer(serializers.ModelSerializer):
    region_name = serializers.CharField(source='region.name', read_only=True)
    
    class Meta:
        model = WeatherData
        fields = '__all__'

class WeatherAlertSerializer(serializers.ModelSerializer):
    region_name = serializers.CharField(source='region.name', read_only=True)
    
    class Meta:
        model = WeatherAlert
        fields = '__all__'
