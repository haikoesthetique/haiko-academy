// Catalogue des formations vendues en ligne. MODIFIEZ ICI les prix et les dates de session.
// Ce fichier est lu par le site (panier) ET par le serveur (montant, places) : une seule source.
// sessions : [{ id: '2027-03-21', label: 'Dimanche 21 mars 2027' }, ...]. Liste vide = « Date à fixer avec l’équipe ».
// places : nombre maximum d'inscrites par session (la session passe « complet » automatiquement).
// almaActif : true pour afficher le paiement Alma (2, 3, 4 fois) une fois les clés Alma ajoutées dans Netlify.
// almaMax : au-delà de ce montant (en €), le paiement Alma en 2, 3 ou 4 fois n'est pas proposé.
(function (cat) {
  if (typeof module !== 'undefined' && module.exports) module.exports = cat;
  else window.HAIKO_CATALOGUE = cat;
})({
  "sansDate": "Date à fixer avec l’équipe",
  "produits": [
    {
      "id": "cap-elearning",
      "groupe": "cap",
      "nom": "CAP esthétique – Formule E-learning",
      "detail": "200 h de théorie en ligne, accès 24 mois",
      "prix": 1590,
      "sessions": [
        {
          "id": "examen-2027",
          "label": "Examen session 2027"
        },
        {
          "id": "examen-2028",
          "label": "Examen session 2028"
        }
      ]
    },
    {
      "id": "cap-reguliere",
      "groupe": "cap",
      "nom": "CAP esthétique – Formule Pratique Régulière",
      "detail": "65 h de pratique à Marseille, 1 dimanche sur 2",
      "prix": 1990,
      "sessions": [
        {
          "id": "2027-nov-2026",
          "label": "Session 2027 - Démarrage des cours en novembre 2026"
        },
        {
          "id": "2027-dec-2026",
          "label": "Session 2027 - Démarrage des cours en décembre 2026"
        },
        {
          "id": "2027-jan-2027",
          "label": "Session 2027 - Démarrage des cours en janvier 2027"
        },
        {
          "id": "2028-nov-2027",
          "label": "Session 2028 - Démarrage des cours en novembre 2027"
        }
      ]
    },
    {
      "id": "cap-intensive",
      "groupe": "cap",
      "nom": "CAP esthétique – Formule Pratique Intensive",
      "detail": "65 h de pratique à Marseille, en deux semaines",
      "prix": 1990,
      "sessions": [
        {
          "id": "session-2027-du-22-au-26-fevrier-et-du-1",
          "label": "Session 2027 : du 22 au 26 février et du 19 au 22 avril 2027"
        }
      ]
    },
    {
      "id": "cap-combo",
      "groupe": "cap",
      "nom": "CAP esthétique – Formule Combo Théorie + Pratique",
      "detail": "200 h de théorie + 65 h de pratique à Marseille",
      "prix": 2990,
      "prixBarre": 3580,
      "sessions": [
        {
          "id": "reguliere-2027-nov-2026",
          "label": "Pratique Régulière · Session 2027 - Démarrage des cours en novembre 2026"
        },
        {
          "id": "reguliere-2027-dec-2026",
          "label": "Pratique Régulière · Session 2027 - Démarrage des cours en décembre 2026"
        },
        {
          "id": "reguliere-2027-jan-2027",
          "label": "Pratique Régulière · Session 2027 - Démarrage des cours en janvier 2027"
        },
        {
          "id": "reguliere-2028-nov-2027",
          "label": "Pratique Régulière · Session 2028 - Démarrage des cours en novembre 2027"
        },
        {
          "id": "combo-avec-pratique-intensive-fevrier-et",
          "label": "Pratique Intensive · Session 2027 (février et avril 2027)"
        }
      ]
    },
    {
      "id": "drainage",
      "groupe": "courte",
      "nom": "Formation drainage lymphatique brésilien",
      "detail": "1 journée · 7 h · Marseille",
      "prix": 790,
      "sessions": [
        {
          "id": "2027-03-21",
          "label": "Dimanche 21 mars 2027"
        },
        {
          "id": "2027-10-17",
          "label": "Dimanche 17 octobre 2027"
        }
      ],
      "places": 6
    },
    {
      "id": "kobido",
      "groupe": "courte",
      "nom": "Formation Kobido",
      "detail": "2 jours · Marseille · kit offert",
      "prix": 990,
      "sessions": [
        {
          "id": "2027-05-08",
          "label": "Samedi 8 et dimanche 9 mai 2027"
        },
        {
          "id": "2027-11-27",
          "label": "Samedi 27 et dimanche 28 novembre 2027"
        }
      ],
      "places": 6
    },
    {
      "id": "maderotherapie",
      "groupe": "courte",
      "nom": "Formation madérothérapie",
      "detail": "1 journée · Marseille · kit en bois offert",
      "prix": 790,
      "sessions": [
        {
          "id": "2027-04-04",
          "label": "Dimanche 4 avril 2027"
        },
        {
          "id": "2027-11-14",
          "label": "Dimanche 14 novembre 2027"
        }
      ],
      "places": 6
    },
    {
      "id": "hydraface",
      "groupe": "courte",
      "nom": "Formation Hydraface",
      "detail": "1 journée · Marseille · machine incluse",
      "prix": 990,
      "sessions": [
        {
          "id": "2027-05-23",
          "label": "Dimanche 23 mai 2027"
        },
        {
          "id": "2027-12-05",
          "label": "Dimanche 5 décembre 2027"
        }
      ],
      "places": 6
    },
    {
      "id": "nanoneedling",
      "groupe": "courte",
      "nom": "Formation nanoneedling",
      "detail": "1 journée · Marseille · kit offert",
      "prix": 790,
      "sessions": [
        {
          "id": "2027-06-06",
          "label": "Dimanche 6 juin 2027"
        },
        {
          "id": "2027-12-12",
          "label": "Dimanche 12 décembre 2027"
        }
      ],
      "places": 6
    },
    {
      "id": "peeling",
      "groupe": "courte",
      "nom": "Formation peeling esthétique",
      "detail": "1 journée · Marseille",
      "prix": 790,
      "sessions": [
        {
          "id": "2027-06-20",
          "label": "Dimanche 20 juin 2027"
        }
      ],
      "places": 6
    },
    {
      "id": "pack-expert-minceur",
      "groupe": "pack",
      "nom": "Pack Expert Minceur",
      "detail": "Drainage lymphatique brésilien + Madérothérapie · -20 %",
      "prix": 1264,
      "prixBarre": 1580,
      "sessions": [
        {
          "id": "2027-03-21_2027-04-04",
          "label": "Drainage : dimanche 21 mars 2027 · Madérothérapie : dimanche 4 avril 2027"
        },
        {
          "id": "2027-03-21_2027-11-14",
          "label": "Drainage : dimanche 21 mars 2027 · Madérothérapie : dimanche 14 novembre 2027"
        },
        {
          "id": "2027-10-17_2027-04-04",
          "label": "Drainage : dimanche 17 octobre 2027 · Madérothérapie : dimanche 4 avril 2027"
        },
        {
          "id": "2027-10-17_2027-11-14",
          "label": "Drainage : dimanche 17 octobre 2027 · Madérothérapie : dimanche 14 novembre 2027"
        }
      ]
    },
    {
      "id": "pack-facialiste-1",
      "groupe": "pack",
      "nom": "Pack Facialiste – Niveau 1",
      "detail": "Hydraface + Kobido · -20 % · bonus : apprentissage du protocole signature Haïko « Korean Glass Skin »",
      "prix": 1584,
      "prixBarre": 1980,
      "sessions": [
        {
          "id": "2027-05-23_2027-05-08",
          "label": "Hydraface : dimanche 23 mai 2027 · Kobido : samedi 8 et dimanche 9 mai 2027"
        },
        {
          "id": "2027-05-23_2027-11-27",
          "label": "Hydraface : dimanche 23 mai 2027 · Kobido : samedi 27 et dimanche 28 novembre 2027"
        },
        {
          "id": "2027-12-05_2027-05-08",
          "label": "Hydraface : dimanche 5 décembre 2027 · Kobido : samedi 8 et dimanche 9 mai 2027"
        },
        {
          "id": "2027-12-05_2027-11-27",
          "label": "Hydraface : dimanche 5 décembre 2027 · Kobido : samedi 27 et dimanche 28 novembre 2027"
        }
      ]
    },
    {
      "id": "pack-facialiste-2",
      "groupe": "pack",
      "nom": "Pack Facialiste – Niveau 2",
      "detail": "Nanoneedling + Peeling esthétique · -20 %",
      "prix": 1264,
      "prixBarre": 1580,
      "sessions": [
        {
          "id": "2027-06-06_2027-06-20",
          "label": "Nanoneedling : dimanche 6 juin 2027 · Peeling : dimanche 20 juin 2027"
        },
        {
          "id": "2027-12-12_2027-06-20",
          "label": "Nanoneedling : dimanche 12 décembre 2027 · Peeling : dimanche 20 juin 2027"
        }
      ]
    },
    {
      "id": "cap-offre-speciale",
      "groupe": "cap",
      "prive": true,
      "fin": "2026-11-01T20:00:00+01:00",
      "nom": "CAP esthétique – Formule Combo Théorie + Pratique · Offre spéciale + formation courte offerte",
      "detail": "200 h de théorie + 65 h de pratique à Marseille + 1 formation courte offerte · offre réservée, jusqu'au dimanche 1er novembre 2026 à 20 h",
      "prix": 2390,
      "prixBarre": 2990,
      "sessions": [
        {
          "id": "reguliere-2027-nov-2026+drainage",
          "label": "Pratique Régulière · Session 2027 - Démarrage des cours en novembre 2026 · Formation offerte : Drainage lymphatique brésilien"
        },
        {
          "id": "reguliere-2027-nov-2026+kobido",
          "label": "Pratique Régulière · Session 2027 - Démarrage des cours en novembre 2026 · Formation offerte : Kobido"
        },
        {
          "id": "reguliere-2027-nov-2026+maderotherapie",
          "label": "Pratique Régulière · Session 2027 - Démarrage des cours en novembre 2026 · Formation offerte : Madérothérapie"
        },
        {
          "id": "reguliere-2027-nov-2026+hydraface",
          "label": "Pratique Régulière · Session 2027 - Démarrage des cours en novembre 2026 · Formation offerte : Hydraface (formation, sans la machine)"
        },
        {
          "id": "reguliere-2027-nov-2026+nanoneedling",
          "label": "Pratique Régulière · Session 2027 - Démarrage des cours en novembre 2026 · Formation offerte : Nanoneedling (après obtention du CAP)"
        },
        {
          "id": "reguliere-2027-nov-2026+peeling",
          "label": "Pratique Régulière · Session 2027 - Démarrage des cours en novembre 2026 · Formation offerte : Peeling esthétique (après obtention du CAP)"
        },
        {
          "id": "reguliere-2027-dec-2026+drainage",
          "label": "Pratique Régulière · Session 2027 - Démarrage des cours en décembre 2026 · Formation offerte : Drainage lymphatique brésilien"
        },
        {
          "id": "reguliere-2027-dec-2026+kobido",
          "label": "Pratique Régulière · Session 2027 - Démarrage des cours en décembre 2026 · Formation offerte : Kobido"
        },
        {
          "id": "reguliere-2027-dec-2026+maderotherapie",
          "label": "Pratique Régulière · Session 2027 - Démarrage des cours en décembre 2026 · Formation offerte : Madérothérapie"
        },
        {
          "id": "reguliere-2027-dec-2026+hydraface",
          "label": "Pratique Régulière · Session 2027 - Démarrage des cours en décembre 2026 · Formation offerte : Hydraface (formation, sans la machine)"
        },
        {
          "id": "reguliere-2027-dec-2026+nanoneedling",
          "label": "Pratique Régulière · Session 2027 - Démarrage des cours en décembre 2026 · Formation offerte : Nanoneedling (après obtention du CAP)"
        },
        {
          "id": "reguliere-2027-dec-2026+peeling",
          "label": "Pratique Régulière · Session 2027 - Démarrage des cours en décembre 2026 · Formation offerte : Peeling esthétique (après obtention du CAP)"
        },
        {
          "id": "reguliere-2027-jan-2027+drainage",
          "label": "Pratique Régulière · Session 2027 - Démarrage des cours en janvier 2027 · Formation offerte : Drainage lymphatique brésilien"
        },
        {
          "id": "reguliere-2027-jan-2027+kobido",
          "label": "Pratique Régulière · Session 2027 - Démarrage des cours en janvier 2027 · Formation offerte : Kobido"
        },
        {
          "id": "reguliere-2027-jan-2027+maderotherapie",
          "label": "Pratique Régulière · Session 2027 - Démarrage des cours en janvier 2027 · Formation offerte : Madérothérapie"
        },
        {
          "id": "reguliere-2027-jan-2027+hydraface",
          "label": "Pratique Régulière · Session 2027 - Démarrage des cours en janvier 2027 · Formation offerte : Hydraface (formation, sans la machine)"
        },
        {
          "id": "reguliere-2027-jan-2027+nanoneedling",
          "label": "Pratique Régulière · Session 2027 - Démarrage des cours en janvier 2027 · Formation offerte : Nanoneedling (après obtention du CAP)"
        },
        {
          "id": "reguliere-2027-jan-2027+peeling",
          "label": "Pratique Régulière · Session 2027 - Démarrage des cours en janvier 2027 · Formation offerte : Peeling esthétique (après obtention du CAP)"
        },
        {
          "id": "reguliere-2028-nov-2027+drainage",
          "label": "Pratique Régulière · Session 2028 - Démarrage des cours en novembre 2027 · Formation offerte : Drainage lymphatique brésilien"
        },
        {
          "id": "reguliere-2028-nov-2027+kobido",
          "label": "Pratique Régulière · Session 2028 - Démarrage des cours en novembre 2027 · Formation offerte : Kobido"
        },
        {
          "id": "reguliere-2028-nov-2027+maderotherapie",
          "label": "Pratique Régulière · Session 2028 - Démarrage des cours en novembre 2027 · Formation offerte : Madérothérapie"
        },
        {
          "id": "reguliere-2028-nov-2027+hydraface",
          "label": "Pratique Régulière · Session 2028 - Démarrage des cours en novembre 2027 · Formation offerte : Hydraface (formation, sans la machine)"
        },
        {
          "id": "reguliere-2028-nov-2027+nanoneedling",
          "label": "Pratique Régulière · Session 2028 - Démarrage des cours en novembre 2027 · Formation offerte : Nanoneedling (après obtention du CAP)"
        },
        {
          "id": "reguliere-2028-nov-2027+peeling",
          "label": "Pratique Régulière · Session 2028 - Démarrage des cours en novembre 2027 · Formation offerte : Peeling esthétique (après obtention du CAP)"
        },
        {
          "id": "combo-avec-pratique-intensive-fevrier-et+drainage",
          "label": "Pratique Intensive · Session 2027 (février et avril 2027) · Formation offerte : Drainage lymphatique brésilien"
        },
        {
          "id": "combo-avec-pratique-intensive-fevrier-et+kobido",
          "label": "Pratique Intensive · Session 2027 (février et avril 2027) · Formation offerte : Kobido"
        },
        {
          "id": "combo-avec-pratique-intensive-fevrier-et+maderotherapie",
          "label": "Pratique Intensive · Session 2027 (février et avril 2027) · Formation offerte : Madérothérapie"
        },
        {
          "id": "combo-avec-pratique-intensive-fevrier-et+hydraface",
          "label": "Pratique Intensive · Session 2027 (février et avril 2027) · Formation offerte : Hydraface (formation, sans la machine)"
        },
        {
          "id": "combo-avec-pratique-intensive-fevrier-et+nanoneedling",
          "label": "Pratique Intensive · Session 2027 (février et avril 2027) · Formation offerte : Nanoneedling (après obtention du CAP)"
        },
        {
          "id": "combo-avec-pratique-intensive-fevrier-et+peeling",
          "label": "Pratique Intensive · Session 2027 (février et avril 2027) · Formation offerte : Peeling esthétique (après obtention du CAP)"
        }
      ]
    }
  ],
  "almaMax": 2000,
  "noteSessions": "",
  "almaActif": true
});
