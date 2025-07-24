from django.urls import path, include
from . import views

urlpatterns = [
    path('user/', views.UserAlertsView.as_view(), name='user_alerts'),
    path('personalized/', views.user_personalized_alert, name='personalized_alert'),
    path('<int:alert_id>/read/', views.mark_alert_read, name='mark_alert_read'),
    path('admin/', include('alerts.admin_urls')),
]
