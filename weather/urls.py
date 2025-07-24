from django.urls import path
from . import views

urlpatterns = [
    path('regions/', views.RegionListView.as_view(), name='region_list'),
    path('current/', views.weather_data, name='weather_data'),
    path('alerts/', views.active_alerts, name='active_alerts'),
    path('history/<int:region_id>/', views.region_weather_history, name='weather_history'),
]
