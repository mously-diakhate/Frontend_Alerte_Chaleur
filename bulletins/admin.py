from django.contrib import admin
from .models import MeteoBulletin, BulletinDownload

@admin.register(MeteoBulletin)
class MeteoBulletinAdmin(admin.ModelAdmin):
    list_display = ('title', 'region', 'created_by', 'created_at', 'download_count', 'is_active')
    list_filter = ('region', 'is_active', 'created_at')
    search_fields = ('title', 'description', 'region__name')
    readonly_fields = ('download_count', 'created_at', 'updated_at')

@admin.register(BulletinDownload)
class BulletinDownloadAdmin(admin.ModelAdmin):
    list_display = ('bulletin', 'user', 'ip_address', 'downloaded_at')
    list_filter = ('downloaded_at',)
    search_fields = ('bulletin__title', 'user__email')
    readonly_fields = ('downloaded_at',)
