from django.urls import path
from .admin_views import (
    AdminAlertListView, 
    AdminAlertDetailView,
    AdminAlertSendView,  # NOUVEAU
    targeted_users_count,  # NOUVEAU
    upload_audio_alert, 
    alert_statistics
)

urlpatterns = [
    path('', AdminAlertListView.as_view(), name='admin_alerts'),
    path('send/', AdminAlertSendView.as_view(), name='admin_alert_send'),  # NOUVEAU
    path('targeted-users/', targeted_users_count, name='targeted_users'),  # NOUVEAU
    path('<int:pk>/', AdminAlertDetailView.as_view(), name='admin_alert_detail'),
    path('upload-audio/', upload_audio_alert, name='upload_audio_alert'),
    path('statistics/', alert_statistics, name='alert_statistics'),
]
