from django.contrib import admin
from .models import HealthStructure, EmergencyContact

@admin.register(HealthStructure)
class HealthStructureAdmin(admin.ModelAdmin):
    list_display = ('name', 'structure_type', 'region', 'phone', 'is_active')
    list_filter = ('structure_type', 'region', 'is_active')
    search_fields = ('name', 'address')

@admin.register(EmergencyContact)
class EmergencyContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'region', 'is_national')
    list_filter = ('is_national', 'region')
    search_fields = ('name', 'phone')
