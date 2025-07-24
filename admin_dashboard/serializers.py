from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import DashboardStats, HealthReport, UserActivity
from alerts.models import PersonalizedAlert
from weather.models import WeatherAlert, Region
from bulletins.models import MeteoBulletin

User = get_user_model()

class DashboardStatsSerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    active_users = serializers.IntegerField()
    active_alerts = serializers.IntegerField()
    total_bulletins = serializers.IntegerField()
    health_reports_today = serializers.IntegerField()
    alerts_by_region = serializers.ListField()
    health_impact_reports = serializers.ListField()
    user_profiles_stats = serializers.ListField()

class HealthReportSerializer(serializers.ModelSerializer):
    region_name = serializers.CharField(source='region.name', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    
    class Meta:
        model = HealthReport
        fields = '__all__'

class UserActivitySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = UserActivity
        fields = '__all__'

class AdminUserManagementSerializer(serializers.ModelSerializer):
    last_login_formatted = serializers.SerializerMethodField()
    role_display = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'situation', 'region', 
                 'is_admin', 'is_active', 'last_login', 'last_login_formatted', 
                 'role_display', 'status_display', 'created_at']
    
    def get_last_login_formatted(self, obj):
        if obj.last_login:
            return obj.last_login.strftime('%Y-%m-%d %H:%M')
        return 'Jamais connecté'
    
    def get_role_display(self, obj):
        if obj.is_superuser:
            return 'super_admin'
        elif obj.is_admin:
            return 'admin'
        elif hasattr(obj, 'adminuser'):
            return obj.adminuser.admin_level
        return 'user'
    
    def get_status_display(self, obj):
        return 'actif' if obj.is_active else 'inactif'

class UserCreateUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'full_name', 'situation', 'region', 
                 'is_admin', 'is_active', 'password']
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User.objects.create_user(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
