from django.urls import path
from . import views

urlpatterns = [
    path('stats/', views.dashboard_stats, name='dashboard_stats'),
    path('refresh/', views.refresh_dashboard_data, name='refresh_dashboard'),
    path('health-reports/', views.HealthReportListView.as_view(), name='health_reports'),
    path('health-reports/<int:report_id>/verify/', views.verify_health_report, name='verify_health_report'),
    path('users/', views.AdminUserListView.as_view(), name='admin_users'),
    path('users/create/', views.create_user, name='create_user'),
    path('users/<int:pk>/', views.AdminUserDetailView.as_view(), name='admin_user_detail'),
    path('activity/', views.UserActivityListView.as_view(), name='user_activity'),
]
