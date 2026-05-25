"""
Script de données de démonstration.
Lance avec : python seed.py  (depuis le dossier backend/)
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agence_voyage.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from agence_voyage.apps.users.models import User
from agence_voyage.apps.destinations.models import Destination
from agence_voyage.apps.voyages.models import Voyage
from agence_voyage.apps.reservations.models import Reservation
from datetime import date

print("🌱 Création des données de démonstration…")

# ── 1. Utilisateurs ────────────────────────────────────────────────────────────
def create_user(username, first, last, email, role, pwd):
    u, created = User.objects.get_or_create(username=username, defaults={
        'first_name': first, 'last_name': last, 'email': email,
        'role': role, 'telephone': '+237 6' + username[:8].zfill(8),
        'is_active': True,
    })
    if created:
        u.set_password(pwd)
        u.save()
        print(f"  ✓ {role} créé : {username} / {pwd}")
    return u

admin  = create_user('admin',   'Admin',  'Système', 'admin@agence.cm',  'admin',  'admin123')
agent1 = create_user('agent1',  'Ibrahim','Koné',    'agent1@agence.cm', 'agent',  'agent123')
agent2 = create_user('agent2',  'Sophie', 'Mbeki',   'agent2@agence.cm', 'agent',  'agent123')
client1= create_user('client1', 'Marie',  'Dupont',  'marie@gmail.com',  'client', 'client123')
client2= create_user('client2', 'Jean',   'Bamba',   'jean@gmail.com',   'client', 'client123')
client3= create_user('client3', 'Fatou',  'Barry',   'fatou@gmail.com',  'client', 'client123')
client4= create_user('client4', 'Paul',   'Ngom',    'paul@gmail.com',   'client', 'client123')

# ── 2. Destinations ────────────────────────────────────────────────────────────
DESTINATIONS = [
    ('Paris',    'France',          'La ville lumière, capitale de la mode et de la gastronomie.'),
    ('Dubaï',    'Émirats Arabes',  'Une métropole ultramoderne entre désert et mer.'),
    ('Istanbul', 'Turquie',         'Au carrefour de l\'Europe et de l\'Asie, ville millénaire.'),
    ('Londres',  'Royaume-Uni',     'Histoire, culture et modernité sur les bords de la Tamise.'),
    ('Rome',     'Italie',          'La Ville Éternelle, berceau de la civilisation occidentale.'),
    ('Bangkok',  'Thaïlande',       'Ville animée entre temples bouddhistes et street food.'),
]

dests = {}
for nom, pays, desc in DESTINATIONS:
    d, created = Destination.objects.get_or_create(nom=nom, defaults={'pays': pays, 'description': desc})
    dests[nom] = d
    if created: print(f"  ✓ Destination : {nom}, {pays}")

# ── 3. Voyages ─────────────────────────────────────────────────────────────────
VOYAGES = [
    {
        'destination': 'Paris',
        'titre': 'Escapade romantique à Paris',
        'date_depart': date(2026, 6, 15),
        'date_retour': date(2026, 6, 22),
        'prix_par_personne': 850000,
        'places_total': 20, 'places_disponibles': 8,
        'inclus': 'Vol aller-retour\nHôtel 4 étoiles\nPetit-déjeuner inclus\nVisite guidée Paris',
        'description': 'Découvrez Paris en amoureux : Tour Eiffel, Montmartre, croisière sur la Seine.',
    },
    {
        'destination': 'Dubaï',
        'titre': 'Luxe et désert à Dubaï',
        'date_depart': date(2026, 6, 20),
        'date_retour': date(2026, 6, 30),
        'prix_par_personne': 1200000,
        'places_total': 15, 'places_disponibles': 6,
        'inclus': 'Vol aller-retour\nHôtel 5 étoiles\nSafari dans le désert\nVisite Burj Khalifa',
        'description': 'Le luxe absolu : gratte-ciels vertigineux, désert doré et plages paradisiaques.',
    },
    {
        'destination': 'Istanbul',
        'titre': 'Splendeurs ottomanes à Istanbul',
        'date_depart': date(2026, 7, 5),
        'date_retour': date(2026, 7, 13),
        'prix_par_personne': 900000,
        'places_total': 18, 'places_disponibles': 12,
        'inclus': 'Vol aller-retour\nHôtel 4 étoiles\nCroisière Bosphore\nVisite Sainte-Sophie',
        'description': 'Une cité millénaire entre Europe et Asie, entre minarets et bazars colorés.',
    },
    {
        'destination': 'Londres',
        'titre': 'Week-end à Londres',
        'date_depart': date(2026, 7, 1),
        'date_retour': date(2026, 7, 7),
        'prix_par_personne': 750000,
        'places_total': 25, 'places_disponibles': 5,
        'inclus': 'Vol aller-retour\nHôtel 3 étoiles\nCarte de transport\nVisite Big Ben',
        'description': 'Big Ben, Buckingham Palace, les marchés de Camden… Londres vous attend !',
    },
    {
        'destination': 'Rome',
        'titre': 'Rome Antique et Gastronomie',
        'date_depart': date(2026, 8, 10),
        'date_retour': date(2026, 8, 17),
        'prix_par_personne': 780000,
        'places_total': 20, 'places_disponibles': 20,
        'inclus': 'Vol aller-retour\nHôtel 4 étoiles\nVisites guidées\nDîner typique',
        'description': 'Colisée, Vatican, Fontaine de Trevi : plongez dans l\'histoire de la Rome antique.',
    },
]

voyages_obj = {}
for v in VOYAGES:
    dest = dests.get(v.pop('destination'))
    obj, created = Voyage.objects.get_or_create(titre=v['titre'], defaults={**v, 'destination': dest})
    voyages_obj[obj.titre] = obj
    if created: print(f"  ✓ Voyage : {obj.titre}")

# ── 4. Réservations ────────────────────────────────────────────────────────────
def make_res(client, voyage_titre, nb, statut, montant_paye):
    voyage = voyages_obj.get(voyage_titre)
    if not voyage: return
    if not Reservation.objects.filter(client=client, voyage=voyage).exists():
        r = Reservation(
            client=client, voyage=voyage,
            nb_personnes=nb,
            prix_total=voyage.prix_par_personne * nb,
            montant_paye=montant_paye,
            statut=statut,
            agent=agent1,
        )
        r.save()
        print(f"  ✓ Réservation : {r.numero} — {client.username} → {voyage_titre}")

make_res(client1, 'Escapade romantique à Paris',       2, 'confirme',  1700000)
make_res(client1, 'Splendeurs ottomanes à Istanbul',   1, 'en_attente',      0)
make_res(client2, 'Luxe et désert à Dubaï',            2, 'en_attente', 600000)
make_res(client3, 'Week-end à Londres',                1, 'confirme',   750000)
make_res(client4, 'Escapade romantique à Paris',       1, 'annule',          0)
make_res(client2, 'Rome Antique et Gastronomie',       2, 'en_attente',      0)

print("\n✅ Données de démonstration créées avec succès !")
print("\n📋 Comptes disponibles :")
print("   admin   / admin123  → Administrateur")
print("   agent1  / agent123  → Agent de voyage")
print("   client1 / client123 → Client (Marie Dupont)")
print("\n🌐 Accès :")
print("   Backend Django : http://localhost:8000")
print("   Admin Django   : http://localhost:8000/admin")
print("   Frontend React : http://localhost:5173")
