from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, AdminUser

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'full_name', 'situation', 'region', 'is_admin', 'is_staff', 'is_active')
    list_filter = ('situation', 'region', 'is_admin', 'is_staff', 'is_active', 'created_at')
    search_fields = ('username', 'email', 'full_name')
    ordering = ('-created_at',)

    readonly_fields = ('last_login', 'created_at')  # <-- Bien déclaré ici, mais pas dans fieldsets !

    fieldsets = (
        (None, {'fields': ('username', 'password')}),  
        ('Informations KARANGUE', {
            'fields': ('full_name', 'situation', 'region', 'phone_number', 'is_admin', 
                       'email_notifications', 'sms_notifications')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Dates importantes', {'fields': ('last_login',)})  # <-- retire 'created_at' ici
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'full_name', 'situation', 'region', 'password1', 'password2', 'is_admin', 'is_staff', 'is_active'),
        }),
    )


@admin.register(AdminUser)
class AdminUserAdmin(admin.ModelAdmin):
    list_display = ('user', 'admin_level', 'managed_regions')
    list_filter = ('admin_level',)
    search_fields = ('user__email', 'user__username')
