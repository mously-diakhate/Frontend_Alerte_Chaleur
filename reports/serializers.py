from rest_framework import serializers
from .models import PublicHealthReport, EmergencyAlert

class PublicHealthReportSerializer(serializers.ModelSerializer):
    region_name = serializers.CharField(source='region.name', read_only=True)
    reporter_name = serializers.CharField(source='reporter.full_name', read_only=True)
    verified_by_name = serializers.CharField(source='verified_by.full_name', read_only=True)
    
    class Meta:
        model = PublicHealthReport
        fields = '__all__'

class EmergencyAlertSerializer(serializers.ModelSerializer):
    region_name = serializers.CharField(source='region.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    
    class Meta:
        model = EmergencyAlert
        fields = '__all__'
