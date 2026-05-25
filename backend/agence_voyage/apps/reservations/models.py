from django.db import models
from django.conf import settings
from agence_voyage.apps.voyages.models import Voyage


class Reservation(models.Model):

    class Statut(models.TextChoices):
        EN_ATTENTE = 'en_attente', 'En attente'
        CONFIRME = 'confirme', 'Confirmé'
        EN_COURS = 'en_cours', 'En cours'
        TERMINE = 'termine', 'Terminé'
        ANNULE = 'annule', 'Annulé'

    class StatutPaiement(models.TextChoices):
        NON_PAYE = 'non_paye', 'Non payé'
        PARTIEL = 'partiel', 'Partiel'
        COMPLET = 'complet', 'Complet'
        REMBOURSE = 'rembourse', 'Remboursé'

    # Numéro unique auto-généré
    numero = models.CharField(max_length=20, unique=True, blank=True)

    client = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='reservations', verbose_name='Client'
    )
    agent = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='reservations_gerees',
        verbose_name='Agent responsable'
    )
    voyage = models.ForeignKey(
        Voyage, on_delete=models.CASCADE,
        related_name='reservations', verbose_name='Voyage'
    )

    nb_personnes = models.PositiveIntegerField(default=1, verbose_name='Nombre de personnes')
    prix_total = models.DecimalField(max_digits=12, decimal_places=2, verbose_name='Prix total (F CFA)')
    montant_paye = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    statut = models.CharField(
        max_length=15, choices=Statut.choices,
        default=Statut.EN_ATTENTE, verbose_name='Statut'
    )
    statut_paiement = models.CharField(
        max_length=15, choices=StatutPaiement.choices,
        default=StatutPaiement.NON_PAYE, verbose_name='Statut paiement'
    )

    notes = models.TextField(blank=True, verbose_name='Notes')
    date_reservation = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Réservation'
        verbose_name_plural = 'Réservations'
        ordering = ['-date_reservation']

    def __str__(self):
        return f"{self.numero} — {self.client} → {self.voyage}"

    def save(self, *args, **kwargs):
        # Génère le numéro automatiquement
        if not self.numero:
            last = Reservation.objects.order_by('id').last()
            next_id = (last.id + 1) if last else 1
            self.numero = f"RES{next_id:04d}"

        # Calcul automatique du prix total
        if not self.prix_total:
            self.prix_total = self.voyage.prix_par_personne * self.nb_personnes

        # Statut paiement automatique
        if self.montant_paye >= self.prix_total:
            self.statut_paiement = self.StatutPaiement.COMPLET
        elif self.montant_paye > 0:
            self.statut_paiement = self.StatutPaiement.PARTIEL

        super().save(*args, **kwargs)
