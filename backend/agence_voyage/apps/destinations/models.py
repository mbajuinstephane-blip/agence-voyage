from django.db import models


class Destination(models.Model):
    nom = models.CharField(max_length=100, verbose_name='Nom')
    pays = models.CharField(max_length=100, verbose_name='Pays')
    description = models.TextField(verbose_name='Description')
    image = models.ImageField(upload_to='destinations/', blank=True, null=True)
    is_active = models.BooleanField(default=True, verbose_name='Active')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Destination'
        verbose_name_plural = 'Destinations'
        ordering = ['nom']

    def __str__(self):
        return f"{self.nom}, {self.pays}"

    @property
    def nb_voyages(self):
        return self.voyages.filter(is_active=True).count()
