import { CONFIG } from '../config/config.js';

class DataService {
    constructor() {
        this.baseUrl = '/api';
        this.data = null;
        this.lastFetch = null;
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.loadAllData();
    }

    async loadAllData() {
        try {
            // Chargement parallèle de toutes les données
            const [revenus, charges, rcpMeetings, professionnels, projets, parametresRepartition] = await Promise.all([
                this.loadRevenus(),
                this.loadCharges(),
                this.loadRcpMeetings(),
                this.loadProfessionnels(),
                this.loadProjets(),
                this.loadParametresRepartition()
            ]);

            this.data = {
                revenus,
                charges,
                rcpMeetings,
                professionnels,
                parametresRepartition,
                projets
            };

            this.lastFetch = Date.now();
            return this.data;
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            alert('Erreur lors du chargement des données. Détails: ' + error.message);
            this.data = {
                revenus: [],
                charges: [],
                rcpMeetings: [],
                professionnels: [],
                parametresRepartition: {
                    partFixe: 50,
                    facteurCogerant: 1.7,
                    partRCP: 25,
                    partProjets: 25
                },
                projets: []
            };
            return this.data;
        }
    }

    async loadProfessionnels() {
        try {
            const response = await fetch(`${this.baseUrl}/professionnels`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Erreur lors du chargement des professionnels:', error);
            throw error;
        }
    }

    async loadCharges() {
        try {
            const response = await fetch(`${this.baseUrl}/charges`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Erreur lors du chargement des charges:', error);
            throw error;
        }
    }

    async loadRevenus() {
        try {
            const response = await fetch(`${this.baseUrl}/revenus`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Erreur lors du chargement des revenus:', error);
            throw error;
        }
    }

    async loadRcpMeetings() {
        try {
            // Include associated professionals when loading all meetings for the main table display
            const response = await fetch(`${this.baseUrl}/rcpMeetings?include=professionnels`); 
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Erreur lors du chargement des réunions RCP:', error);
            throw error;
        }
    }

    // Function to load a single RCP meeting by ID, including associated professionals
    async getRcpMeeting(id) {
        try {
            // Include associated professionals when fetching a single meeting
            const response = await fetch(`${this.baseUrl}/rcpMeetings/${id}?include=professionnels`); 
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const meetingData = await response.json();
            console.log('DataService fetched meeting data:', meetingData); // Log the fetched data
            return meetingData;
        } catch (error) {
            console.error(`Erreur lors du chargement de la réunion RCP avec ID ${id}:`, error);
            throw error;
        }
    }

    async loadProjets() {
        try {
            const response = await fetch(`${this.baseUrl}/projets`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Erreur lors du chargement des projets:', error);
            throw error;
        }
    }

    async loadParametresRepartition() {
        try {
            const response = await fetch(`${this.baseUrl}/parametresRepartition`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Erreur lors du chargement des paramètres de répartition:', error);
            throw error;
        }
    }

    // Méthodes utilitaires pour formater les données
    formatMontant(montant) {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant);
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('fr-FR');
    }

    // Revenus
    getRevenus() {
        return this.data.revenus;
    }

    // Charges
    getCharges() {
        return this.data.charges;
    }

    // RCP Meetings
    getRcpMeetings() {
        return this.data.rcpMeetings;
    }

    // Professionnels
    getProfessionnels() {
        return this.data.professionnels;
    }

    // Paramètres de répartition
    getParametresRepartition() {
        return this.data.parametresRepartition;
    }

    // Projets
    getProjets() {
        return this.data.projets;
    }

    async saveRevenu(revenu) {
        try {
            let response;
            let method = 'POST';
            let url = `${this.baseUrl}/revenus`;
            
            if (revenu.id) {
                // Modification d'un revenu existant
                method = 'PUT';
                url = `${this.baseUrl}/revenus/${revenu.id}`;
            }
            
            response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(revenu)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            await this.loadAllData(); // Recharger toutes les données pour refléter les changements
            return result;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde du revenu:', error);
            throw error;
        }
    }

    async saveCharge(charge) {
        try {
            let response;
            let method = 'POST';
            let url = `${this.baseUrl}/charges`;
            
            if (charge.id) {
                // Modification d'une charge existante
                method = 'PUT';
                url = `${this.baseUrl}/charges/${charge.id}`;
            }
            
            response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(charge)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            await this.loadAllData(); // Recharger toutes les données pour refléter les changements
            return result;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de la charge:', error);
            throw error;
        }
    }

    async saveRcpMeeting(meeting) {
        try {
            let response;
            let method = 'POST';
            let url = `${this.baseUrl}/rcpMeetings`;
            
            if (meeting.id) {
                // Modification d'une réunion existante
                method = 'PUT';
                url = `${this.baseUrl}/rcpMeetings/${meeting.id}`;
            }
            
            response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(meeting)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            await this.loadAllData(); // Recharger toutes les données pour refléter les changements
            return result;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de la réunion:', error);
            throw error;
        }
    }

    async saveProjet(projet) {
        try {
            let response;
            let method = 'POST';
            let url = `${this.baseUrl}/projets`;
            
            if (projet.id) {
                // Modification d'un projet existant
                method = 'PUT';
                url = `${this.baseUrl}/projets/${projet.id}`;
            }
            
            response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projet)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            await this.loadAllData(); // Recharger toutes les données pour refléter les changements
            return result;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde du projet:', error);
            throw error;
        }
    }

    async saveProfessionnel(professionnel) {
        try {
            let response;
            let method = 'POST';
            let url = `${this.baseUrl}/professionnels`;
            
            if (professionnel.id) {
                // Modification d'un professionnel existant
                method = 'PUT';
                url = `${this.baseUrl}/professionnels/${professionnel.id}`;
            }
            
            response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(professionnel)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            await this.loadAllData(); // Recharger toutes les données pour refléter les changements
            return result;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde du professionnel:', error);
            throw error;
        }
    }

    async saveParametresRepartition(parametres) {
        try {
            const response = await fetch(`${this.baseUrl}/parametresRepartition`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parametres)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            await this.loadAllData(); // Recharger toutes les données pour refléter les changements
            return result;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des paramètres:', error);
            throw error;
        }
    }

    async deleteRevenu(id) {
        try {
            const response = await fetch(`${this.baseUrl}/revenus/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            await this.loadAllData(); // Recharger toutes les données pour refléter les changements
        } catch (error) {
            console.error('Erreur lors de la suppression du revenu:', error);
            throw error;
        }
    }

    async deleteCharge(id) {
        try {
            const response = await fetch(`${this.baseUrl}/charges/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            await this.loadAllData(); // Recharger toutes les données pour refléter les changements
        } catch (error) {
            console.error('Erreur lors de la suppression de la charge:', error);
            throw error;
        }
    }

    async deleteRcpMeeting(id) {
        try {
            const response = await fetch(`${this.baseUrl}/rcpMeetings/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            await this.loadAllData(); // Recharger toutes les données pour refléter les changements
        } catch (error) {
            console.error('Erreur lors de la suppression de la réunion:', error);
            throw error;
        }
    }

    async deleteProjet(id) {
        try {
            const response = await fetch(`${this.baseUrl}/projets/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            await this.loadAllData(); // Recharger toutes les données pour refléter les changements
        } catch (error) {
            console.error('Erreur lors de la suppression du projet:', error);
            throw error;
        }
    }

    async deleteProfessionnel(id) {
        try {
            const response = await fetch(`${this.baseUrl}/professionnels/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            await this.loadAllData(); // Recharger toutes les données pour refléter les changements
        } catch (error) {
            console.error('Erreur lors de la suppression du professionnel:', error);
            throw error;
        }
    }

    // Function to load RCP presence data per professional
    async loadRcpPresenceData() {
        try {
            const response = await fetch(`${this.baseUrl}/rcpMeetings/presence`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Erreur lors du chargement des données de présence RCP:', error);
            throw error;
        }
    }
}

const dataService = new DataService();
export { dataService };
