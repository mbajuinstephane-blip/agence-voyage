# serializers.py
from rest_framework import serializers
from .models import Destination

class DestinationSerializer(serializers.ModelSerializer):
    nb_voyages = serializers.ReadOnlyField()

    class Meta:
        model = Destination
        fields = '__all__'
