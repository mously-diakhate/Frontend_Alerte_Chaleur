from django.urls import path
from . import views

urlpatterns = [
    path('', views.MeteoBulletinListView.as_view(), name='bulletin_list'),
    path('create/', views.MeteoBulletinCreateView.as_view(), name='bulletin_create'),
    path('<int:pk>/', views.MeteoBulletinDetailView.as_view(), name='bulletin_detail'),
    path('<int:bulletin_id>/download/', views.download_bulletin, name='bulletin_download'),
    path('stats/', views.bulletin_stats, name='bulletin_stats'),
]
