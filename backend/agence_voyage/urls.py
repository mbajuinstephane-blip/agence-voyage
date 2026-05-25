from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth JWT
    path('api/auth/', include('agence_voyage.apps.users.urls')),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Applications métier
    path('api/destinations/', include('agence_voyage.apps.destinations.urls')),
    path('api/voyages/', include('agence_voyage.apps.voyages.urls')),
    path('api/reservations/', include('agence_voyage.apps.reservations.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
