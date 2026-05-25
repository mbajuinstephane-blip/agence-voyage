from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Seul l'administrateur peut accéder."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin


class IsAgentOrAdmin(BasePermission):
    """Agent ou administrateur."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_agent or request.user.is_admin
        )


class IsOwnerOrAdmin(BasePermission):
    """Le propriétaire de la ressource ou l'admin."""
    def has_object_permission(self, request, view, obj):
        if request.user.is_admin:
            return True
        return obj.client == request.user
