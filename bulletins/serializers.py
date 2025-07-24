from rest_framework import serializers
from .models import MeteoBulletin, BulletinDownload

class MeteoBulletinSerializer(serializers.ModelSerializer):
    region_name = serializers.CharField(source='region.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    file_size_mb = serializers.SerializerMethodField()
    
    class Meta:
        model = MeteoBulletin
        fields = ['id', 'title', 'region', 'region_name', 'file', 'description',
                 'created_by', 'created_by_name', 'created_at', 'updated_at',
                 'is_active', 'download_count', 'file_size_mb', 'file_extension']
        read_only_fields = ['created_by', 'download_count']
    
    def get_file_size_mb(self, obj):
        if obj.file_size:
            return round(obj.file_size / (1024 * 1024), 2)
        return 0

class BulletinUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeteoBulletin
        fields = ['title', 'region', 'file', 'description']
    
    def validate_file(self, value):
        # Vérifier l'extension du fichier
        allowed_extensions = ['.pdf', '.doc', '.docx']
        file_extension = value.name.split('.')[-1].lower()
        
        if f'.{file_extension}' not in allowed_extensions:
            raise serializers.ValidationError(
                f"Type de fichier non autorisé. Extensions autorisées: {', '.join(allowed_extensions)}"
            )
        
        # Vérifier la taille du fichier (max 10MB)
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("Le fichier ne peut pas dépasser 10MB.")
        
        return value
