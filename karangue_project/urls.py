from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/weather/', include('weather.urls')),
    path('api/alerts/', include('alerts.urls')),
    path('api/health-structures/', include('health_structures.urls')),
    path('api/admin/', include('admin_dashboard.urls')),
    path('api/bulletins/', include('bulletins.urls')),
    path('api/reports/', include('reports.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
