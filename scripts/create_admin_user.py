from django.contrib.auth import get_user_model
from accounts.models import AdminUser

User = get_user_model()

def create_admin():
    # Créer un super utilisateur admin
    admin_user, created = User.objects.get_or_create(
        username='admin',
        email='admin@karangue.sn',
        defaults={
            'full_name': 'Administrateur KARANGUE',
            'is_admin': True,
            'is_staff': True,
            'is_superuser': True
        }
    )
    
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        
        # Créer le profil admin
        AdminUser.objects.create(
            user=admin_user,
            admin_level='super',
            managed_regions=['Dakar', 'Thiès', 'Saint-Louis']
        )
        
        print("Administrateur créé avec succès")
        print("Username: admin")
        print("Password: admin123")
    else:
        print("Administrateur existe déjà")

if __name__ == "__main__":
    create_admin()
