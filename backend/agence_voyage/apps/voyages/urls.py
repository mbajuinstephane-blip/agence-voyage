from django.urls import path, include
from django.contrib import admin
from rest_framework.routers import DefaultRouter
from .views import VoyageViewSet
from .models import Voyage

router = DefaultRouter()
router.register('', VoyageViewSet, basename='voyage')
urlpatterns = [path('', include(router.urls))]

@admin.register(Voyage)
class VoyageAdmin(admin.ModelAdmin):
    list_display = ['titre', 'destination', 'date_depart', 'prix_par_personne', 'places_disponibles', 'statut']
    list_filter = ['statut', 'destination']
    search_fields = ['titre']
