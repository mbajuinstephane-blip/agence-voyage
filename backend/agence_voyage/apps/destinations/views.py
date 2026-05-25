from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Destination
from .serializers import DestinationSerializer
from agence_voyage.apps.users.permissions import IsAgentOrAdmin


class DestinationViewSet(viewsets.ModelViewSet):
    queryset = Destination.objects.filter(is_active=True)
    serializer_class = DestinationSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAgentOrAdmin()]
        return [IsAuthenticatedOrReadOnly()]
