from weather.models import Region

# Données des 14 régions du Sénégal
regions_data = [
    {"name": "Dakar", "lat": 14.7167, "lon": -17.4677, "population": 3732284},
    {"name": "Diourbel", "lat": 14.6600, "lon": -16.2300, "population": 1497455},
    {"name": "Fatick", "lat": 14.3392, "lon": -16.4113, "population": 714392},
    {"name": "Kaffrine", "lat": 14.1050, "lon": -15.5500, "population": 566992},
    {"name": "Kaolack", "lat": 14.1825, "lon": -16.2533, "population": 960875},
    {"name": "Kédougou", "lat": 12.5500, "lon": -12.1833, "population": 151715},
    {"name": "Kolda", "lat": 12.8833, "lon": -14.9500, "population": 714392},
    {"name": "Louga", "lat": 15.6167, "lon": -16.2167, "population": 874193},
    {"name": "Matam", "lat": 15.6600, "lon": -13.2500, "population": 562539},
    {"name": "Saint-Louis", "lat": 16.0179, "lon": -16.4896, "population": 908942},
    {"name": "Sédhiou", "lat": 12.7081, "lon": -15.5569, "population": 452994},
    {"name": "Tambacounda", "lat": 13.7700, "lon": -13.6670, "population": 681310},
    {"name": "Thiès", "lat": 14.7908, "lon": -16.9250, "population": 1788864},
    {"name": "Ziguinchor", "lat": 12.5833, "lon": -16.2667, "population": 549151}
]

def populate_regions():
    for region_data in regions_data:
        region, created = Region.objects.get_or_create(
            name=region_data["name"],
            defaults={
                "latitude": region_data["lat"],
                "longitude": region_data["lon"],
                "population": region_data["population"]
            }
        )
        if created:
            print(f"Région {region.name} créée")
        else:
            print(f"Région {region.name} existe déjà")

if __name__ == "__main__":
    populate_regions()
