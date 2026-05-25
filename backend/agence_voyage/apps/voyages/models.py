from django.db import models
from agence_voyage.apps.destinations.models import Destination


class Voyage(models.Model):

    class Statut(models.TextChoices):
        DISPONIBLE = 'disponible', 'Disponible'
        COMPLET = 'complet', 'Complet'
        ANNULE = 'annule', 'Annulé'
        TERMINE = 'termine', 'Terminé'

    destination = models.ForeignKey(
        Destination, on_delete=models.CASCADE,
        related_name='voyages', verbose_name='Destination'
    )
    titre = models.CharField(max_length=200, verbose_name='Titre')
    description = models.TextField(verbose_name='Description')
    image = models.ImageField(upload_to='voyages/', blank=True, null=True)
    date_depart = models.DateField(verbose_name='Date de départ')
    date_retour = models.DateField(verbose_name='Date de retour')
    prix_par_personne = models.DecimalField(
        max_digits=12, decimal_places=2, verbose_name='Prix par personne (F CFA)'
    )
    places_total = models.PositiveIntegerField(verbose_name='Nombre de places total')
    places_disponibles = models.PositiveIntegerField(verbose_name='Places disponibles')
    statut = models.CharField(
        max_length=15, choices=Statut.choices,
        default=Statut.DISPONIBLE, verbose_name='Statut'
    )
    inclus = models.TextField(
        blank=True,
        verbose_name='Ce qui est inclus',
        help_text='Vol, hôtel, repas... (un élément par ligne)'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Voyage'
        verbose_name_plural = 'Voyages'
        ordering = ['date_depart']

    def __str__(self):
        return f"{self.titre} — {self.date_depart}"

    @property
    def duree_jours(self):
        return (self.date_retour - self.date_depart).days

    def save(self, *args, **kwargs):
        if self.places_disponibles == 0:
            self.statut = self.Statut.COMPLET
        super().save(*args, **kwargs)
