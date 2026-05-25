from rest_framework import serializers
from .models import Reservation
from agence_voyage.apps.users.serializers import UserListSerializer
from agence_voyage.apps.voyages.serializers import VoyageListSerializer


class ReservationSerializer(serializers.ModelSerializer):
    client_detail = UserListSerializer(source='client', read_only=True)
    voyage_detail = VoyageListSerializer(source='voyage', read_only=True)

    class Meta:
        model = Reservation
        fields = '__all__'
        read_only_fields = ['numero', 'prix_total', 'statut_paiement', 'date_reservation']


class ReservationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = ['voyage', 'nb_personnes', 'notes']

    def validate(self, data):
        voyage = data['voyage']
        nb = data['nb_personnes']
        if voyage.places_disponibles < nb:
            raise serializers.ValidationError(
                f"Seulement {voyage.places_disponibles} places disponibles."
            )
        return data

    def create(self, validated_data):
        voyage = validated_data['voyage']
        nb = validated_data['nb_personnes']
        reservation = Reservation(
            **validated_data,
            client=self.context['request'].user,
            prix_total=voyage.prix_par_personne * nb
        )
        reservation.save()
        # Décrémente les places disponibles
        voyage.places_disponibles -= nb
        voyage.save()
        return reservation
