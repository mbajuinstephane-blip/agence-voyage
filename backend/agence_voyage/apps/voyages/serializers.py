from rest_framework import serializers
from .models import Voyage
from agence_voyage.apps.destinations.serializers import DestinationSerializer


class VoyageSerializer(serializers.ModelSerializer):
    destination_detail = DestinationSerializer(source='destination', read_only=True)
    duree_jours = serializers.ReadOnlyField()

    class Meta:
        model = Voyage
        fields = '__all__'

class VoyageListSerializer(serializers.ModelSerializer):
    destination_nom = serializers.CharField(source='destination.nom', read_only=True)
    destination_pays = serializers.CharField(source='destination.pays', read_only=True)
    duree_jours = serializers.ReadOnlyField()

    class Meta:
        model = Voyage
        fields = [
            'id', 'titre', 'destination_nom', 'destination_pays',
            'date_depart', 'date_retour', 'duree_jours',
            'prix_par_personne', 'places_disponibles', 'statut', 'image'
        ]
