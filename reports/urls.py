from django.urls import path
from . import views

urlpatterns = [
    path('health-reports/', views.PublicHealthReportListView.as_view(), name='health_reports'),
    path('health-reports/<int:report_id>/verify/', views.verify_health_report, name='verify_health_report'),
    path('emergency-alerts/', views.EmergencyAlertListView.as_view(), name='emergency_alerts'),
    path('stats/', views.health_reports_stats, name='health_reports_stats'),
]
