from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import user_passes_test
from rest_framework import generics, status, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .models import User, AdminUser, SITUATION_CHOICES
from .serializers import UserProfileSerializer
import json

def is_admin(user):
    """Vérifie si l'utilisateur est admin"""
    return user.is_authenticated and (user.is_admin or user.is_staff)

class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer pour l'administration des utilisateurs"""
    last_login_formatted = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'full_name', 'situation', 'region',
            'phone_number', 'is_admin', 'is_staff', 'is_active', 
            'email_notifications', 'sms_notifications', 'created_at', 
            'updated_at', 'last_login', 'last_login_formatted', 'role'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_last_login_formatted(self, obj):
        if obj.last_login:
            return obj.last_login.strftime('%d/%m/%Y %H:%M')
        return 'Jamais'
    
    def get_role(self, obj):
        if obj.is_superuser:
            return 'super_admin'
        elif obj.is_admin or obj.is_staff:
            return 'admin'
        return 'user'

class AdminUserCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer des utilisateurs via l'admin"""
    password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'full_name', 'situation', 'region',
            'phone_number', 'is_admin', 'is_staff', 'is_active',
            'email_notifications', 'sms_notifications', 'password'
        ]
    
    def create(self, validated_data):
        password = validated_data.pop('password', 'karangue2025')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

@method_decorator(csrf_exempt, name='dispatch')
class AdminUserListView(generics.ListCreateAPIView):
    """Vue pour lister et créer des utilisateurs (admin)"""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if not is_admin(self.request.user):
            return User.objects.none()
        
        queryset = User.objects.all()
        
        # Filtres
        search = self.request.GET.get('search', '')
        role = self.request.GET.get('role', '')
        region = self.request.GET.get('region', '')
        status_filter = self.request.GET.get('status', '')
        
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(full_name__icontains=search) |
                Q(region__icontains=search)
            )
        
        if role and role != 'Tous':
            if role == 'admin':
                queryset = queryset.filter(Q(is_admin=True) | Q(is_staff=True))
            elif role == 'user':
                queryset = queryset.filter(is_admin=False, is_staff=False)
        
        if region and region != 'Tous':
            queryset = queryset.filter(region=region)
        
        if status_filter:
            if status_filter == 'active':
                queryset = queryset.filter(is_active=True)
            elif status_filter == 'inactive':
                queryset = queryset.filter(is_active=False)
        
        return queryset.order_by('-created_at')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AdminUserCreateSerializer
        return AdminUserSerializer
    
    def list(self, request, *args, **kwargs):
        try:
            if not is_admin(request.user):
                return Response(
                    {'error': 'Permissions insuffisantes'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            
            return Response({
                'results': serializer.data,
                'count': queryset.count()
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def create(self, request, *args, **kwargs):
        try:
            if not is_admin(request.user):
                return Response(
                    {'error': 'Permissions insuffisantes'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                user = serializer.save()
                return Response(
                    AdminUserSerializer(user).data,
                    status=status.HTTP_201_CREATED
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@method_decorator(csrf_exempt, name='dispatch')
class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vue pour récupérer, modifier et supprimer un utilisateur"""
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        if not is_admin(self.request.user):
            raise PermissionDenied('Permissions insuffisantes')
        return super().get_object()
    
    def update(self, request, *args, **kwargs):
        try:
            if not is_admin(request.user):
                return Response(
                    {'error': 'Permissions insuffisantes'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            partial = kwargs.pop('partial', True)
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            
            if serializer.is_valid():
                user = serializer.save()
                return Response(AdminUserSerializer(user).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def destroy(self, request, *args, **kwargs):
        try:
            if not is_admin(request.user):
                return Response(
                    {'error': 'Permissions insuffisantes'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            instance = self.get_object()
            
            if instance.id == request.user.id:
                return Response(
                    {'error': 'Vous ne pouvez pas supprimer votre propre compte'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def toggle_user_status(request, user_id):
    """Active/désactive un utilisateur"""
    try:
        if not is_admin(request.user):
            return JsonResponse({
                'success': False,
                'error': 'Permissions insuffisantes'
            }, status=403)
        
        user = User.objects.get(id=user_id)
        
        if user.id == request.user.id:
            return JsonResponse({
                'success': False,
                'error': 'Vous ne pouvez pas désactiver votre propre compte'
            }, status=400)
        
        user.is_active = not user.is_active
        user.save()
        
        return JsonResponse({
            'success': True,
            'is_active': user.is_active,
            'message': f'Utilisateur {"activé" if user.is_active else "désactivé"} avec succès'
        })
    except User.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Utilisateur non trouvé'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_statistics(request):
    """Statistiques des utilisateurs"""
    try:
        if not is_admin(request.user):
            return JsonResponse({
                'error': 'Permissions insuffisantes'
            }, status=403)
        
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        inactive_users = total_users - active_users
        
        admin_users = User.objects.filter(Q(is_admin=True) | Q(is_staff=True)).count()
        regular_users = total_users - admin_users
        
        users_by_role = [
            {'role': 'admin', 'count': admin_users},
            {'role': 'user', 'count': regular_users}
        ]
        
        users_by_situation = []
        for choice_value, choice_label in SITUATION_CHOICES:
            count = User.objects.filter(situation=choice_value).count()
            if count > 0:
                users_by_situation.append({
                    'situation': choice_value,
                    'label': choice_label,
                    'count': count
                })
        
        region_stats = User.objects.values('region').annotate(count=Count('id')).exclude(region='')
        
        return JsonResponse({
            'total_users': total_users,
            'active_users': active_users,
            'inactive_users': inactive_users,
            'users_by_role': users_by_role,
            'users_by_situation': users_by_situation,
            'users_by_region': list(region_stats)
        })
    except Exception as e:
        return JsonResponse({
            'error': str(e)
        }, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_regions_list(request):
    """Liste des régions du Sénégal"""
    try:
        regions = [
            'Dakar', 'Thiès', 'Saint-Louis', 'Diourbel', 'Louga', 
            'Fatick', 'Kaolack', 'Kaffrine', 'Tambacounda', 'Kédougou',
            'Kolda', 'Sédhiou', 'Ziguinchor', 'Matam'
        ]
        
        return JsonResponse({'regions': regions})
    except Exception as e:
        return JsonResponse({
            'error': str(e)
        }, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_situation_choices(request):
    """Liste des choix de situation"""
    try:
        choices = [
            {'value': choice[0], 'label': choice[1]} 
            for choice in SITUATION_CHOICES
        ]
        
        return JsonResponse({'choices': choices})
    except Exception as e:
        return JsonResponse({
            'error': str(e)
        }, status=500)
