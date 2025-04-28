import { CONFIG } from '../config/config.js';

export const validationUtils = {
    isValidEmail(email) {
        if (!email) return true; // Email peut être null
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    isValidPhone(phone) {
        if (!phone) return true; // Téléphone peut être null
        const phoneRegex = /^[0-9]{9,10}$/;
        return phoneRegex.test(phone);
    },

    isValidProfession(profession) {
        return Object.values(CONFIG.PROFESSIONS).includes(profession);
    },

    isValidStatut(statut) {
        return Object.values(CONFIG.STATUTS).includes(statut);
    },

    isValidPoidsProjet(poids) {
        return Object.keys(CONFIG.POIDS_PROJETS).map(k => k.toLowerCase()).includes(poids.toLowerCase());
    },

    validateAssocie(associe) {
        const errors = [];

        if (!associe.nom) {
            errors.push('Le nom est requis');
        }

        if (!this.isValidProfession(associe.profession)) {
            errors.push('Profession invalide');
        }

        if (!this.isValidEmail(associe.email)) {
            errors.push('Email invalide');
        }

        if (!this.isValidPhone(associe.telephone)) {
            errors.push('Numéro de téléphone invalide');
        }

        if (!this.isValidStatut(associe.statut)) {
            errors.push('Statut invalide');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}; 