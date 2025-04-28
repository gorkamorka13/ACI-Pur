import { CONFIG } from '../config/config.js';
import { validationUtils } from '../utils/validationUtils.js';
import { dateUtils } from '../utils/dateUtils.js';
import { dataService } from './DataService.js';

class AssocieService {
    constructor() {
        this.dataService = dataService;
    }

    async ajouterAssocie(associe) {
        // Validation
        const validation = validationUtils.validateAssocie(associe);
        if (!validation.isValid) {
            throw new Error(`Validation échouée: ${validation.errors.join(', ')}`);
        }

        const data = await this.dataService.loadData();
        
        // Générer ID unique
        const prefix = this.getPrefixFromProfession(associe.profession);
        const id = await this.genererIdUnique(prefix);

        // Créer le nouvel associé
        const nouvelAssocie = {
            id,
            nom: associe.nom,
            profession: associe.profession,
            email: associe.email,
            telephone: associe.telephone,
            statut: associe.statut || CONFIG.STATUTS.ASSOCIE,
            date_adhesion: associe.date_adhesion || dateUtils.getCurrentDate(),
            actif: true
        };

        try {
            // Ajouter à la liste principale
            data.associes.liste.push(nouvelAssocie);

            // Ajouter à la liste par profession
            const professionKey = this.getProfessionKey(associe.profession);
            if (!data.associes.par_profession[professionKey]) {
                data.associes.par_profession[professionKey] = [];
            }
            data.associes.par_profession[professionKey].push(id);

            // Initialiser les statistiques
            this.initialiserStatistiques(id);

            await this.dataService.saveData();
            return nouvelAssocie;

        } catch (error) {
            console.error('Erreur lors de l\'ajout de l\'associé:', error);
            throw new Error('Impossible d\'ajouter l\'associé');
        }
    }

    async getAssocie(id) {
        const data = await this.dataService.loadData();
        return data.associes.liste.find(a => a.id === id);
    }

    async getAssociesParProfession(profession) {
        const data = await this.dataService.loadData();
        const professionKey = this.getProfessionKey(profession);
        const ids = data.associes.par_profession[professionKey] || [];
        return data.associes.liste.filter(a => ids.includes(a.id));
    }

    async mettreAJourAssocie(id, modifications) {
        // Validation des modifications
        const validation = validationUtils.validateAssocie({
            ...await this.getAssocie(id),
            ...modifications
        });
        if (!validation.isValid) {
            throw new Error(`Validation échouée: ${validation.errors.join(', ')}`);
        }

        const data = await this.dataService.loadData();
        const associe = data.associes.liste.find(a => a.id === id);
        
        if (!associe) {
            throw new Error('Associé non trouvé');
        }

        try {
            // Gérer le changement de profession
            if (modifications.profession && modifications.profession !== associe.profession) {
                await this.changerProfession(associe, modifications.profession);
            }

            // Mettre à jour les propriétés
            Object.assign(associe, modifications);
            await this.dataService.saveData();
            return associe;

        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            throw new Error('Impossible de mettre à jour l\'associé');
        }
    }

    async desactiverAssocie(id) {
        try {
            const associe = await this.getAssocie(id);
            if (!associe) {
                throw new Error('Associé non trouvé');
            }

            associe.actif = false;
            await this.dataService.saveData();
            return true;

        } catch (error) {
            console.error('Erreur lors de la désactivation:', error);
            throw new Error('Impossible de désactiver l\'associé');
        }
    }

    // Méthodes privées
    async changerProfession(associe, nouvelleProfession) {
        const data = await this.dataService.loadData();
        
        // Retirer de l'ancienne profession
        const ancienneProfession = this.getProfessionKey(associe.profession);
        data.associes.par_profession[ancienneProfession] = 
            data.associes.par_profession[ancienneProfession].filter(id => id !== associe.id);

        // Ajouter à la nouvelle profession
        const nouvelleProfessionKey = this.getProfessionKey(nouvelleProfession);
        if (!data.associes.par_profession[nouvelleProfessionKey]) {
            data.associes.par_profession[nouvelleProfessionKey] = [];
        }
        data.associes.par_profession[nouvelleProfessionKey].push(associe.id);
    }

    async initialiserStatistiques(associeId) {
        const data = await this.dataService.loadData();
        
        // Temps de réunion
        if (!data.statistiques.temps_reunion.par_associe[associeId]) {
            data.statistiques.temps_reunion.par_associe[associeId] = 0;
        }

        // Implication projets
        if (!data.statistiques.implication_projets.par_associe[associeId]) {
            data.statistiques.implication_projets.par_associe[associeId] = {
                total_pondere: 0,
                projets: {}
            };
        }
    }

    async genererIdUnique(prefix) {
        const data = await this.dataService.loadData();
        const existingIds = new Set(data.associes.liste.map(a => a.id));
        let counter = 1;
        
        while (true) {
            const id = `${prefix}_${counter.toString().padStart(3, '0')}`;
            if (!existingIds.has(id)) {
                return id;
            }
            counter++;
        }
    }

    getPrefixFromProfession(profession) {
        const key = Object.entries(CONFIG.PROFESSIONS)
            .find(([_, value]) => value === profession)?.[0];
        return CONFIG.PREFIXES[key] || CONFIG.PREFIXES.AUTRE;
    }

    getProfessionKey(profession) {
        return Object.entries(CONFIG.PROFESSIONS)
            .find(([_, value]) => value === profession)?.[0]?.toLowerCase() + 's' || 'autres';
    }
}

export default new AssocieService(); 