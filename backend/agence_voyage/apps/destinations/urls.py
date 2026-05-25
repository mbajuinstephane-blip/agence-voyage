from django.urls import path, include
from django.contrib import admin
from rest_framework.routers import DefaultRouter
from .views import DestinationViewSet
from .models import Destination

router = DefaultRouter()
router.register('', DestinationViewSet, basename='destination')

urlpatterns = [path('', include(router.urls))]

# Admin
admin.site.register(Destination)
