from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .serializers import UserSerializer, UserListSerializer, CustomTokenObtainPairSerializer
from .permissions import IsAdmin, IsAgentOrAdmin


class CustomTokenObtainPairView(TokenObtainPairView):
    """Login : retourne access + refresh + infos user."""
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    """Inscription client (public)."""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        serializer.save(role=User.Role.CLIENT)


class UserViewSet(viewsets.ModelViewSet):
    """
    CRUD complet sur les utilisateurs.
    - Admin : accès à tout
    - Agent : lecture seule des clients
    - Client : accès à son propre profil uniquement
    """
    queryset = User.objects.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return UserListSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action in ['list', 'create', 'destroy']:
            return [IsAdmin()]
        if self.action in ['retrieve', 'update', 'partial_update']:
            return [IsAuthenticated()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return User.objects.all()
        if user.is_agent:
            return User.objects.filter(role=User.Role.CLIENT)
        return User.objects.filter(pk=user.pk)

    @action(detail=False, methods=['get', 'put', 'patch'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Endpoint /api/auth/users/me/ — profil de l'utilisateur connecté."""
        if request.method == 'GET':
            serializer = UserSerializer(request.user)
            return Response(serializer.data)
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAdmin])
    def stats(self, request):
        """Statistiques globales des utilisateurs."""
        return Response({
            'total': User.objects.count(),
            'admins': User.objects.filter(role=User.Role.ADMIN).count(),
            'agents': User.objects.filter(role=User.Role.AGENT).count(),
            'clients': User.objects.filter(role=User.Role.CLIENT).count(),
            'actifs': User.objects.filter(is_active=True).count(),
        })
