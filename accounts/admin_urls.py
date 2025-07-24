from django.urls import path
from .admin_views import (
    AdminUserListView,
    AdminUserDetailView,
    user_statistics,
    toggle_user_status,
    get_regions_list,
    get_situation_choices
)

urlpatterns = [
    path('', AdminUserListView.as_view(), name='admin_users'),
    path('<int:pk>/', AdminUserDetailView.as_view(), name='admin_user_detail'),
    path('<int:user_id>/toggle-status/', toggle_user_status, name='toggle_user_status'),
    path('statistics/', user_statistics, name='user_statistics'),
    path('regions/', get_regions_list, name='regions_list'),
    path('situation-choices/', get_situation_choices, name='situation_choices'),
]
