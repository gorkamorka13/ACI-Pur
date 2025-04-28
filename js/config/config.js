export const CONFIG = {
    VERSION: '1.1',
    API: {
        BASE_URL: '/api',
        ENDPOINTS: {
            // Revenus
            REVENUS: '/api/revenus',
            REVENU_BY_ID: (id) => `/api/revenus/${id}`,
            
            // Charges
            CHARGES: '/api/charges',
            CHARGE_BY_ID: (id) => `/api/charges/${id}`,
            
            // Réunions RCP
            RCP_MEETINGS: '/api/rcpMeetings',
            RCP_MEETING_BY_ID: (id) => `/api/rcpMeetings/${id}`,
            
            // Professionnels
            PROFESSIONNELS: '/api/professionnels',
            PROFESSIONNEL_BY_ID: (id) => `/api/professionnels/${id}`,
            
            // Projets
            PROJETS: '/api/projets',
            PROJET_BY_ID: (id) => `/api/projets/${id}`,
            
            // Paramètres de répartition
            PARAMETRES_REPARTITION: '/api/parametresRepartition'
        }
    },
    PROFESSIONS: {
        MEDECIN: 'Médecin',
        PHARMACIEN: 'Pharmacien',
        INFIRMIERE: 'Infirmière',
        KINESITHERAPEUTE: 'Kinésithérapeute',
        DENTISTE: 'Dentiste',
        PODOLOGUE: 'Pédicure podologue'
    },
    PREFIXES: {
        MEDECIN: 'med',
        PHARMACIEN: 'pha',
        INFIRMIERE: 'inf',
        KINESITHERAPEUTE: 'kin',
        DENTISTE: 'den',
        PODOLOGUE: 'pod',
        AUTRE: 'aut'
    },
    POIDS_PROJETS: {
        STANDARD: 1,
        PRIORITAIRE: 2,
        STRATEGIQUE: 3
    },
    STATUTS: {
        ASSOCIE: 'Associé',
        COGERANT: 'Cogérant'
    }
}; 