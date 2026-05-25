from django.urls import path, include
from django.contrib import admin
from rest_framework.routers import DefaultRouter
from .views import ReservationViewSet
from .models import Reservation

router = DefaultRouter()
router.register('', ReservationViewSet, basename='reservation')
urlpatterns = [path('', include(router.urls))]

@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ['numero', 'client', 'voyage', 'nb_personnes', 'prix_total', 'statut', 'statut_paiement']
    list_filter = ['statut', 'statut_paiement']
    search_fields = ['numero', 'client__username', 'client__email']
    readonly_fields = ['numero', 'prix_total', 'date_reservation']
