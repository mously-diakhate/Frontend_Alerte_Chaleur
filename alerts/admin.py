from django.contrib import admin
from .models import PersonalizedAlert, AlertTemplate

@admin.register(PersonalizedAlert)
class PersonalizedAlertAdmin(admin.ModelAdmin):
    list_display = ('user', 'alert_type', 'title', 'region', 'is_read', 'is_sent', 'created_at')
    list_filter = ('alert_type', 'is_read', 'is_sent', 'created_at')
    search_fields = ('user__email', 'title', 'message')

@admin.register(AlertTemplate)
class AlertTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'situation', 'temperature_threshold', 'is_active')
    list_filter = ('situation', 'is_active')
    search_fields = ('name', 'message_template')
