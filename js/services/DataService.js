import { CONFIG } from '../config/config.js';

class DataService {
    constructor() {
        this.baseUrl = '/api';
        this.data = null;
        this.lastFetch = null;
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        // Initial data load will now be handled after successful login redirect
        // this.loadAllData(); 
    }

    // Helper function to handle fetch responses and authentication errors
    async handleResponse(response) {
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                console.error('Authentication failed. Redirecting to login.');
                localStorage.removeItem('token'); // Clear invalid token
                window.location.href = 'login.html'; // Redirect
                // Throw an error to stop further processing in the calling function
                throw new Error('Authentication required.'); 
            }
            // For other non-OK responses, throw a standard HTTP error
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
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
            // Only show alert if it's not an authentication error handled by handleResponse
            if (error.message !== 'Authentication required.') {
                 alert('Erreur lors du chargement des données. Détails: ' + error.message);
            }
            
            // Return default empty data on error, but only if not redirecting
            if (error.message !== 'Authentication required.') {
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
             // If it was an auth error, the redirect is happening, no need to return data
             throw error; // Re-throw the auth error to stop the promise chain
        }
    }

    async loadProfessionnels() {
        try {
            const headers = window.getAuthenticatedHeaders();
            const response = await fetch(`${this.baseUrl}/professionnels`, { headers });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Erreur lors du chargement des professionnels:', error);
            throw error; // Re-throw to be caught by loadAllData or other callers
        }
    }

    // Updated to accept an optional year parameter
    async loadCharges(year = null) {
        try {
            const headers = window.getAuthenticatedHeaders();
            let url = `${this.baseUrl}/charges`;
            if (year) {
                url += `?year=${year}`; // Append year query parameter if provided
            }
            const response = await fetch(url, { headers });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Erreur lors du chargement des charges:', error);
            throw error; // Re-throw
        }
    }

    async loadRevenus() {
        try {
            const headers = window.getAuthenticatedHeaders();
            const response = await fetch(`${this.baseUrl}/revenus`, { headers });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Erreur lors du chargement des revenus:', error);
            throw error; // Re-throw
        }
    }

    async loadRcpMeetings() {
        try {
            const headers = window.getAuthenticatedHeaders();
            // Include associated professionals when loading all meetings for the main table display
            const response = await fetch(`${this.baseUrl}/rcpMeetings?include=professionnels`, { headers });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Erreur lors du chargement des réunions RCP:', error);
            throw error; // Re-throw
        }
    }

    // Function to load a single RCP meeting by ID, including associated professionals
    async getRcpMeeting(id) {
        try {
            const headers = window.getAuthenticatedHeaders();
            // Include associated professionals when fetching a single meeting
            const response = await fetch(`${this.baseUrl}/rcpMeetings/${id}?include=professionnels`, { headers });
             // Handle 404 specifically before general response handling
            if (response.status === 404) {
                console.warn(`Réunion RCP avec ID ${id} non trouvée.`);
                return null; // Return null if not found
            }
            return await this.handleResponse(response);
        } catch (error) {
            console.error(`Erreur lors du chargement de la réunion RCP avec ID ${id}:`, error);
            throw error; // Re-throw
        }
    }

    async loadProjets() {
        try {
            const headers = window.getAuthenticatedHeaders();
            const response = await fetch(`${this.baseUrl}/projets`, { headers });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Erreur lors du chargement des projets:', error);
            throw error; // Re-throw
        }
    }

    async loadParametresRepartition() {
        try {
            const headers = window.getAuthenticatedHeaders();
            const response = await fetch(`${this.baseUrl}/parametresRepartition`, { headers });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Erreur lors du chargement des paramètres de répartition:', error);
            throw error; // Re-throw
        }
    }

    // Function to load a single Project by ID, including associated professionals
    async loadProjetById(id) {
        try {
            const headers = window.getAuthenticatedHeaders();
            const response = await fetch(`${this.baseUrl}/projets/${id}`, { headers }); // API endpoint includes associations now
             // Handle 404 specifically before general response handling
            if (response.status === 404) {
                console.warn(`Projet avec ID ${id} non trouvé.`);
                return null; // Return null if not found
            }
            return await this.handleResponse(response);
        } catch (error) {
            console.error(`Erreur lors du chargement du projet avec ID ${id}:`, error);
            throw error; // Re-throw
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
            const headers = window.getAuthenticatedHeaders();
            let method = 'POST';
            let url = `${this.baseUrl}/revenus`;
            
            if (revenu.id) {
                // Modification d'un revenu existant
                method = 'PUT';
                url = `${this.baseUrl}/revenus/${revenu.id}`;
            }
            
            const response = await fetch(url, {
                method,
                headers: { ...headers, 'Content-Type': 'application/json' }, // Merge headers
                body: JSON.stringify(revenu)
            });
            
            const result = await this.handleResponse(response);
            await this.loadAllData(); // Recharger toutes les données pour refléter les changements
            return result;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde du revenu:', error);
            throw error; // Re-throw
        }
    }

    async saveCharge(charge) {
        try {
            const headers = window.getAuthenticatedHeaders();
            let method = 'POST';
            let url = `${this.baseUrl}/charges`;
            
            if (charge.id) {
                // Modification d'une charge existante
                method = 'PUT';
                url = `${this.baseUrl}/charges/${charge.id}`;
            }
            
            const response = await fetch(url, {
                method,
                headers: { ...headers, 'Content-Type': 'application/json' }, // Merge headers
                body: JSON.stringify(charge)
            });
            
            const result = await this.handleResponse(response);
            await this.loadAllData(); // Recharger toutes les données pour refléter les changements
            return result;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de la charge:', error);
            throw error; // Re-throw
        }
    }

    async saveRcpMeeting(meeting) {
        try {
            const headers = window.getAuthenticatedHeaders();
            let method = 'POST';
            let url = `${this.baseUrl}/rcpMeetings`;
            
            if (meeting.id) {
                // Modification d'une réunion existante
                method = 'PUT';
                url = `${this.baseUrl}/rcpMeetings/${meeting.id}`;
            }
            
            const response = await fetch(url, {
                method,
                headers: { ...headers, 'Content-Type': 'application/json' }, // Merge headers
                body: JSON.stringify(meeting)
            });
            
            const result = await this.handleResponse(response);
            await this.loadAllData(); // Recharger toutes les données pour refléter les changements
            return result;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de la réunion:', error);
            throw error; // Re-throw
        }
    }

    async saveProjet(projet) {
        try {
            const headers = window.getAuthenticatedHeaders();
            let method = 'POST';
            let url = `${this.baseUrl}/projets`;
            
            if (projet.id) {
                // Modification d'un projet existant
                method = 'PUT';
                url = `${this.baseUrl}/projets/${projet.id}`;
            }
            
            const response = await fetch(url, {
                method,
                headers: { ...headers, 'Content-Type': 'application/json' }, // Merge headers
                body: JSON.stringify(projet)
            });
            
            const result = await this.handleResponse(response);
            await this.loadAllData(); // Recharger toutes les données pour refléter les changements
            return result;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde du projet:', error);
            throw error; // Re-throw
        }
    }

    async saveProfessionnel(professionnel) {
        try {
            const headers = window.getAuthenticatedHeaders();
            let method = 'POST';
            let url = `${this.baseUrl}/professionnels`;
            
            if (professionnel.id) {
                // Modification d'un professionnel existant
                method = 'PUT';
                url = `${this.baseUrl}/professionnels/${professionnel.id}`;
            }
            
            const response = await fetch(url, {
                method,
                headers: { ...headers, 'Content-Type': 'application/json' }, // Merge headers
                body: JSON.stringify(professionnel)
            });
            
            const result = await this.handleResponse(response);
            await this.loadAllData(); // Recharger toutes les données pour refléter les changements
            return result;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde du professionnel:', error);
            throw error; // Re-throw
        }
    }

    async saveParametresRepartition(parametres) {
        try {
            const headers = window.getAuthenticatedHeaders();
            const response = await fetch(`${this.baseUrl}/parametresRepartition`, {
                method: 'PUT',
                headers: { ...headers, 'Content-Type': 'application/json' }, // Merge headers
                body: JSON.stringify(parametres)
            });
            
            const result = await this.handleResponse(response);
            await this.loadAllData(); // Recharger toutes les données pour refléter les changements
            return result;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des paramètres:', error);
            throw error; // Re-throw
        }
    }

    async deleteRevenu(id) {
        try {
            const headers = window.getAuthenticatedHeaders();
            const response = await fetch(`${this.baseUrl}/revenus/${id}`, {
                method: 'DELETE',
                headers: headers // Add headers to delete requests
            });
            
            return await this.handleResponse(response);
             // Note: loadAllData is called after successful delete in the calling code, not here
        } catch (error) {
            console.error('Erreur lors de la suppression du revenu:', error);
            throw error; // Re-throw
        }
    }

    async deleteCharge(id) {
        try {
            const headers = window.getAuthenticatedHeaders();
            const response = await fetch(`${this.baseUrl}/charges/${id}`, {
                method: 'DELETE',
                 headers: headers // Add headers to delete requests
            });
            
            return await this.handleResponse(response);
             // Note: loadAllData is called after successful delete in the calling code, not here
        } catch (error) {
            console.error('Erreur lors de la suppression de la charge:', error);
            throw error; // Re-throw
        }
    }

    async deleteRcpMeeting(id) {
        try {
            const headers = window.getAuthenticatedHeaders();
            const response = await fetch(`${this.baseUrl}/rcpMeetings/${id}`, {
                method: 'DELETE',
                 headers: headers // Add headers to delete requests
            });
            
            return await this.handleResponse(response);
             // Note: loadAllData is called after successful delete in the calling code, not here
        } catch (error) {
            console.error('Erreur lors de la suppression de la réunion:', error);
            throw error; // Re-throw
        }
    }

    async deleteProjet(id) {
        try {
            const headers = window.getAuthenticatedHeaders();
            const response = await fetch(`${this.baseUrl}/projets/${id}`, {
                method: 'DELETE',
                 headers: headers // Add headers to delete requests
            });
            
            return await this.handleResponse(response);
             // Note: loadAllData is called after successful delete in the calling code, not here
        } catch (error) {
            console.error('Erreur lors de la suppression du projet:', error);
            throw error; // Re-throw
        }
    }

    async deleteProfessionnel(id) {
        try {
            const headers = window.getAuthenticatedHeaders();
            const response = await fetch(`${this.baseUrl}/professionnels/${id}`, {
                method: 'DELETE',
                 headers: headers // Add headers to delete requests
            });
            
            return await this.handleResponse(response);
             // Note: loadAllData is called after successful delete in the calling code, not here
        } catch (error) {
            console.error('Erreur lors de la suppression du professionnel:', error);
            throw error; // Re-throw
        }
    }

    // Function to load RCP presence data per professional
    async loadRcpPresenceData() {
        try {
            const headers = window.getAuthenticatedHeaders();
            const response = await fetch(`${this.baseUrl}/rcpMeetings/presence`, { headers });
            return await this.handleResponse(response);
        } catch (error) {
            console.error('Erreur lors du chargement des données de présence RCP:', error);
            throw error; // Re-throw
        }
    }
}

const dataService = new DataService();
export { dataService };
