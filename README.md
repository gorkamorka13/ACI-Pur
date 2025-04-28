# MSP Gestion - Gestion des Accords Cadres Interprofessionnels (ACI)

Application web conçue pour les Maisons de Santé Pluriprofessionnelles (MSP) afin de simplifier la gestion et la répartition des financements issus de l'Accord Cadre Interprofessionnel (ACI).

## Objectif

L'ACI vise à valoriser le travail en équipe et les actions coordonnées des professionnels de santé au sein des MSP. Cette application a pour but de :
- Centraliser les informations relatives aux activités financées par l'ACI.
- Faciliter le suivi des revenus, des charges, et des différentes activités (projets, réunions).
- Automatiser la répartition des fonds ACI entre les professionnels selon des critères paramétrables.
- Offrir une meilleure visibilité sur l'utilisation des fonds et la contribution de chacun.

## Fonctionnalités Principales

- **Gestion des Revenus ACI:** Enregistrement et suivi des différentes sources de revenus liées à l'ACI.
- **Gestion des Charges:** Suivi des dépenses engagées dans le cadre des activités ACI.
- **Gestion des Associés et Professionnels:** Répertoire des professionnels de santé membres de la MSP participant aux activités ACI.
- **Suivi des Réunions de Coordination Pluriprofessionnelles (RCP):** Enregistrement des dates, participants et éventuellement des points clés des réunions pertinentes pour l'ACI.
- **Gestion des Projets et Missions:** Suivi des projets spécifiques financés ou co-financés par l'ACI, incluant leur description, budget, et participants.
- **Répartition Automatique des Revenus:** Calcul automatisé de la distribution des fonds ACI restants (après déduction des charges) entre les professionnels, basé sur les règles définies.
- **Paramétrage des Critères de Répartition:** Interface permettant de configurer les règles et pondérations pour la répartition des fonds (ex: participation aux réunions, implication dans les projets, etc.).
- **Visualisation:** (Potentiellement via Chart.js ou similaire) Graphiques et tableaux de bord pour visualiser les données financières et la répartition.

## Technologies utilisées

- **Frontend:** HTML5, CSS3, JavaScript Vanilla
- **Backend:** Node.js, Express.js
- **Base de données:** SQLite3
- **ORM (Object-Relational Mapper):** Sequelize

## Installation et Lancement en Local

1.  **Cloner le repository :**
    ```bash
    git clone https://github.com/aspart-am/ACI-Pur.git
    cd ACI-Pur
    ```

2.  **Installer les dépendances :**
    Installe les packages nécessaires pour le frontend et le backend.
    ```bash
    npm install
    ```

3.  **Lancer le serveur de développement :**
    Démarre le serveur Node.js/Express.
    - Pour un lancement simple :
      ```bash
      npm start
      ```
    - Pour un lancement avec redémarrage automatique lors des modifications de fichiers (recommandé pour le développement) :
      ```bash
      npm run dev
      ```
      *(Ce script utilise `nodemon`)*

4.  **Accéder à l'application :**
    Ouvrez votre navigateur web et allez à l'adresse `http://localhost:3000` (ou le port configuré si différent).

## Utilisation

Une fois l'application lancée, vous pouvez naviguer entre les différentes sections via le menu principal pour :
- Ajouter/modifier/supprimer des revenus, charges, professionnels, projets, réunions.
- Consulter les données enregistrées.
- Configurer les paramètres de répartition dans la section dédiée.
- Lancer le calcul de la répartition des fonds ACI.

## Déploiement

L'application est également déployée et accessible via GitHub Pages à l'adresse : https://aspart-am.github.io/ACI-Pur/
*(Note: Le déploiement sur GitHub Pages concerne généralement des sites statiques. La version déployée pourrait ne pas inclure les fonctionnalités backend dépendant de Node.js et de la base de données SQLite, à moins d'une configuration spécifique type backend-as-a-service ou API externe.)*

## Licence

MIT License
