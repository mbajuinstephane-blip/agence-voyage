from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Voyage
from .serializers import VoyageSerializer, VoyageListSerializer
from agence_voyage.apps.users.permissions import IsAgentOrAdmin


class VoyageViewSet(viewsets.ModelViewSet):
    queryset = Voyage.objects.filter(is_active=True).select_related('destination')
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['titre', 'destination__nom', 'destination__pays']
    ordering_fields = ['date_depart', 'prix_par_personne']

    def get_serializer_class(self):
        if self.action == 'list':
            return VoyageListSerializer
        return VoyageSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAgentOrAdmin()]
        return [IsAuthenticatedOrReadOnly()]

    def get_queryset(self):
        qs = super().get_queryset()
        destination = self.request.query_params.get('destination')
        statut = self.request.query_params.get('statut')
        prix_max = self.request.query_params.get('prix_max')

        if destination:
            qs = qs.filter(destination__id=destination)
        if statut:
            qs = qs.filter(statut=statut)
        if prix_max:
            qs = qs.filter(prix_par_personne__lte=prix_max)
        return qs
