from rest_framework import serializers
from .models import HealthStructure, EmergencyContact

class HealthStructureSerializer(serializers.ModelSerializer):
    region_name = serializers.CharField(source='region.name', read_only=True)
    
    class Meta:
        model = HealthStructure
        fields = '__all__'

class EmergencyContactSerializer(serializers.ModelSerializer):
    region_name = serializers.CharField(source='region.name', read_only=True)
    
    class Meta:
        model = EmergencyContact
        fields = '__all__'
