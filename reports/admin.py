from django.contrib import admin
from .models import PublicHealthReport, EmergencyAlert

@admin.register(PublicHealthReport)
class PublicHealthReportAdmin(admin.ModelAdmin):
    list_display = ('region', 'severity', 'affected_people_count', 'is_verified', 'created_at')
    list_filter = ('severity', 'is_verified', 'region', 'created_at')
    search_fields = ('description', 'location_details', 'region__name')
    actions = ['mark_as_verified']
    
    def mark_as_verified(self, request, queryset):
        queryset.update(is_verified=True, verified_by=request.user)
    mark_as_verified.short_description = "Marquer comme vérifié"

@admin.register(EmergencyAlert)
class EmergencyAlertAdmin(admin.ModelAdmin):
    list_display = ('title', 'region', 'alert_type', 'is_active', 'created_at', 'expires_at')
    list_filter = ('alert_type', 'is_active', 'region', 'created_at')
    search_fields = ('title', 'message', 'region__name')
