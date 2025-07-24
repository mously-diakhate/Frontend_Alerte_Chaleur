from rest_framework import serializers
from .models import PersonalizedAlert, AlertTemplate, MultilingualAlert

class PersonalizedAlertSerializer(serializers.ModelSerializer):
    region_name = serializers.CharField(source='region.name', read_only=True)
    
    class Meta:
        model = PersonalizedAlert
        fields = '__all__'

class AlertTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlertTemplate
        fields = '__all__'

class MultilingualAlertSerializer(serializers.ModelSerializer):
    region_name = serializers.CharField(source='region.name', read_only=True)
    audio_url = serializers.SerializerMethodField()
    
    class Meta:
        model = MultilingualAlert
        fields = '__all__'
    
    def get_audio_url(self, obj):
        if obj.audio_message:
            return obj.audio_message.url
        return None
    
    def validate(self, attrs):
        # Au moins une description doit être fournie
        if not any([
            attrs.get('description_fr'),
            attrs.get('description_wolof'),
            attrs.get('description_poular')
        ]) and not attrs.get('audio_message'):
            raise serializers.ValidationError(
                "Au moins une description textuelle ou un message audio est requis"
            )
        return attrs
