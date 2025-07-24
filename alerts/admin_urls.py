from django.urls import path
from .admin_views import (
    AdminAlertListView, AdminAlertDetailView, 
    upload_audio_alert, alert_statistics
)

urlpatterns = [
    path('', AdminAlertListView.as_view(), name='admin_alerts'),
    path('<int:pk>/', AdminAlertDetailView.as_view(), name='admin_alert_detail'),
    path('upload-audio/', upload_audio_alert, name='upload_audio_alert'),
    path('statistics/', alert_statistics, name='alert_statistics'),
]
