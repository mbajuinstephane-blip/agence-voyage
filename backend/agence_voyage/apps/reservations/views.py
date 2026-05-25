from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Count

from .models import Reservation
from .serializers import ReservationSerializer, ReservationCreateSerializer
from agence_voyage.apps.users.permissions import IsAdmin, IsAgentOrAdmin


class ReservationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return ReservationCreateSerializer
        return ReservationSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Reservation.objects.select_related('client', 'voyage', 'voyage__destination')
        if user.is_admin:
            return qs.all()
        if user.is_agent:
            return qs.filter(agent=user) | qs.filter(agent=None)
        return qs.filter(client=user)

    @action(detail=True, methods=['post'], permission_classes=[IsAgentOrAdmin])
    def confirmer(self, request, pk=None):
        res = self.get_object()
        res.statut = Reservation.Statut.CONFIRME
        res.save()
        return Response({'statut': res.statut})

    @action(detail=True, methods=['post'], permission_classes=[IsAgentOrAdmin])
    def annuler(self, request, pk=None):
        res = self.get_object()
        res.statut = Reservation.Statut.ANNULE
        # Remet les places disponibles
        res.voyage.places_disponibles += res.nb_personnes
        res.voyage.save()
        res.save()
        return Response({'statut': res.statut})

    @action(detail=True, methods=['post'], permission_classes=[IsAgentOrAdmin])
    def paiement(self, request, pk=None):
        res = self.get_object()
        montant = request.data.get('montant', 0)
        res.montant_paye += float(montant)
        res.save()
        return Response(ReservationSerializer(res).data)

    @action(detail=False, methods=['get'], permission_classes=[IsAdmin])
    def dashboard_stats(self, request):
        from django.db.models.functions import TruncMonth
        return Response({
            'total': Reservation.objects.count(),
            'en_attente': Reservation.objects.filter(statut='en_attente').count(),
            'confirmees': Reservation.objects.filter(statut='confirme').count(),
            'ca_total': Reservation.objects.filter(statut_paiement='complet').aggregate(
                total=Sum('prix_total'))['total'] or 0,
        })
