from django.contrib import admin
from .models import DashboardStats, HealthReport, UserActivity

@admin.register(DashboardStats)
class DashboardStatsAdmin(admin.ModelAdmin):
    list_display = ('date', 'total_users', 'active_alerts', 'total_bulletins', 'health_reports')
    list_filter = ('date',)
    ordering = ('-date',)

@admin.register(HealthReport)
class HealthReportAdmin(admin.ModelAdmin):
    list_display = ('region', 'report_type', 'temperature_at_time', 'is_verified', 'created_at')
    list_filter = ('report_type', 'is_verified', 'region', 'created_at')
    search_fields = ('description', 'region__name')
    actions = ['mark_as_verified']
    
    def mark_as_verified(self, request, queryset):
        queryset.update(is_verified=True)
    mark_as_verified.short_description = "Marquer comme vérifié"

@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'timestamp', 'ip_address')
    list_filter = ('timestamp', 'action')
    search_fields = ('user__email', 'action')
    readonly_fields = ('timestamp',)
