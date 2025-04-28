import dataManager from './dataManager.js';

class ProjetsManager {
    constructor() {
        this.dataManager = dataManager;
    }

    async ajouterProjet(projet) {
        const data = await this.dataManager.loadData();
        
        // Structure d'un projet
        const nouveauProjet = {
            id: Date.now().toString(),
            titre: projet.titre,
            description: projet.description,
            date_debut: projet.date_debut,
            date_fin: projet.date_fin,
            poids: projet.poids || 'standard',
            participants: projet.participants.map(p => ({
                id: p.id,
                role: p.role,
                pourcentage_implication: p.pourcentage_implication
            })),
            statut: 'en_cours'
        };

        // Ajouter le projet à la liste
        data.projets.liste.push(nouveauProjet);

        // Mettre à jour les statistiques d'implication
        await this.mettreAJourStatistiquesImplication();

        await this.dataManager.sauvegarderDonnees();
        return nouveauProjet.id;
    }

    async mettreAJourStatistiquesImplication() {
        const data = await this.dataManager.loadData();
        const stats = data.statistiques.implication_projets;
        const poids = data.parametres.poids_projets;

        // Réinitialiser les statistiques
        stats.global = {};
        stats.par_associe = {};
        stats.par_projet = {};

        // Calculer les implications pour chaque projet
        for (const projet of data.projets.liste) {
            const poidsProjet = poids[projet.poids];
            
            // Statistiques par projet
            stats.par_projet[projet.id] = {
                titre: projet.titre,
                poids: poidsProjet,
                implications: {}
            };

            // Calculer l'implication pour chaque participant
            for (const participant of projet.participants) {
                const implicationPonderee = (participant.pourcentage_implication * poidsProjet) / 100;

                // Mise à jour des stats globales
                if (!stats.global[participant.id]) {
                    stats.global[participant.id] = 0;
                }
                stats.global[participant.id] += implicationPonderee;

                // Mise à jour des stats par associé
                if (!stats.par_associe[participant.id]) {
                    stats.par_associe[participant.id] = {
                        total_pondere: 0,
                        projets: {}
                    };
                }
                stats.par_associe[participant.id].total_pondere += implicationPonderee;
                stats.par_associe[participant.id].projets[projet.id] = implicationPonderee;

                // Mise à jour des stats par projet
                stats.par_projet[projet.id].implications[participant.id] = implicationPonderee;
            }
        }

        await this.dataManager.sauvegarderDonnees();
    }

    async getImplicationParAssocie(associeId) {
        const data = await this.dataManager.loadData();
        return data.statistiques.implication_projets.par_associe[associeId] || {
            total_pondere: 0,
            projets: {}
        };
    }

    async getStatistiquesProjets() {
        const data = await this.dataManager.loadData();
        return data.statistiques.implication_projets;
    }

    async terminerProjet(projetId) {
        const data = await this.dataManager.loadData();
        const projet = data.projets.liste.find(p => p.id === projetId);
        if (projet) {
            projet.statut = 'termine';
            await this.mettreAJourStatistiquesImplication();
            await this.dataManager.sauvegarderDonnees();
        }
    }
}

export default new ProjetsManager(); 