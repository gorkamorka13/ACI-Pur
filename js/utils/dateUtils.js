export const dateUtils = {
    formatDate(date) {
        return new Date(date).toISOString().split('T')[0];
    },

    getCurrentDate() {
        return this.formatDate(new Date());
    },

    getMoisAnnee(date) {
        return new Date(date).toISOString().slice(0, 7);
    },

    isValidDate(date) {
        const d = new Date(date);
        return d instanceof Date && !isNaN(d);
    }
}; 