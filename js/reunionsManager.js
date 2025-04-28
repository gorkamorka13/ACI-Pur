import dataManager from './dataManager.js';

class ReunionsManager {
    constructor() {
        this.dataManager = dataManager;
    }

    async ajouterReunion(reunion) {
        const data = await this.dataManager.loadData();
        
        // Structure d'une réunion
        const nouvelleReunion = {
            date: reunion.date,
            duree_minutes: reunion.duree_minutes,
            type: reunion.type,
            participants: reunion.participants,
            sujet: reunion.sujet,
            compte_rendu: reunion.compte_rendu
        };

        // Ajouter la réunion à l'historique
        data.reunions.historique.push(nouvelleReunion);

        // Mettre à jour les statistiques de participation
        this.mettreAJourStatistiquesParticipation(nouvelleReunion);

        await this.dataManager.sauvegarderDonnees();
    }

    async mettreAJourStatistiquesParticipation(reunion) {
        const data = await this.dataManager.loadData();
        const stats = data.statistiques.temps_reunion;
        const dureeHeures = reunion.duree_minutes / 60;

        // Mise à jour du total des heures
        stats.total_heures += dureeHeures;

        // Mise à jour par associé
        for (const participant of reunion.participants) {
            if (!stats.par_associe[participant]) {
                stats.par_associe[participant] = 0;
            }
            stats.par_associe[participant] += dureeHeures;
        }

        // Mise à jour moyenne mensuelle
        const moisAnnee = new Date(reunion.date).toISOString().slice(0, 7);
        if (!stats.moyenne_mensuelle[moisAnnee]) {
            stats.moyenne_mensuelle[moisAnnee] = {
                total_heures: 0,
                nombre_reunions: 0
            };
        }
        stats.moyenne_mensuelle[moisAnnee].total_heures += dureeHeures;
        stats.moyenne_mensuelle[moisAnnee].nombre_reunions++;

        await this.dataManager.sauvegarderDonnees();
    }

    async getTempsReunionParAssocie(associeId) {
        const data = await this.dataManager.loadData();
        return data.statistiques.temps_reunion.par_associe[associeId] || 0;
    }

    async getStatistiquesReunions() {
        const data = await this.dataManager.loadData();
        return data.statistiques.temps_reunion;
    }
}

export default new ReunionsManager(); 