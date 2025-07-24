from django.urls import path
from . import views

urlpatterns = [
    path('', views.HealthStructureListView.as_view(), name='health_structures'),
    path('add/', views.add_health_structure, name='add_health_structure'),
    path('emergency-contacts/', views.emergency_contacts, name='emergency_contacts'),
    path('nearby/', views.nearby_structures, name='nearby_structures'),
]
