from health_structures.models import HealthStructure, EmergencyContact
from weather.models import Region

def populate_health_structures():
    # Structures de santé principales
    structures_data = [
        {
            "name": "Hôpital Principal de Dakar",
            "structure_type": "hospital",
            "address": "Avenue Pasteur, Dakar",
            "latitude": 14.6641,
            "longitude": -17.4371,
            "phone": "+221 33 839 50 50",
            "region": "Dakar"
        },
        {
            "name": "Hôpital Aristide Le Dantec",
            "structure_type": "hospital", 
            "address": "Avenue Pasteur, Dakar",
            "latitude": 14.6892,
            "longitude": -17.4419,
            "phone": "+221 33 839 50 00",
            "region": "Dakar"
        },
        {
            "name": "Centre Hospitalier Régional de Saint-Louis",
            "structure_type": "hospital",
            "address": "Saint-Louis",
            "latitude": 16.0179,
            "longitude": -16.4896,
            "phone": "+221 33 961 10 85",
            "region": "Saint-Louis"
        }
    ]
    
    for structure_data in structures_data:
        try:
            region = Region.objects.get(name=structure_data["region"])
            structure, created = HealthStructure.objects.get_or_create(
                name=structure_data["name"],
                defaults={
                    "structure_type": structure_data["structure_type"],
                    "address": structure_data["address"],
                    "latitude": structure_data["latitude"],
                    "longitude": structure_data["longitude"],
                    "phone": structure_data["phone"],
                    "region": region
                }
            )
            if created:
                print(f"Structure {structure.name} créée")
        except Region.DoesNotExist:
            print(f"Région {structure_data['region']} non trouvée")

def populate_emergency_contacts():
    # Contacts d'urgence nationaux
    emergency_data = [
        {
            "name": "SAMU National",
            "phone": "15",
            "is_national": True,
            "description": "Service d'Aide Médicale Urgente"
        },
        {
            "name": "Pompiers",
            "phone": "18", 
            "is_national": True,
            "description": "Service des Sapeurs-Pompiers"
        },
        {
            "name": "Police Secours",
            "phone": "17",
            "is_national": True,
            "description": "Police Nationale - Urgences"
        }
    ]
    
    for contact_data in emergency_data:
        contact, created = EmergencyContact.objects.get_or_create(
            name=contact_data["name"],
            defaults=contact_data
        )
        if created:
            print(f"Contact d'urgence {contact.name} créé")

if __name__ == "__main__":
    populate_health_structures()
    populate_emergency_contacts()
