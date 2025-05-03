import { dataService } from './services/DataService.js'; // Importer dataService

document.addEventListener('DOMContentLoaded', async function() {
    console.log('[main.js] DOMContentLoaded fired.');
    // Initialisation des menus actifs
    initActiveMenu();

    // Initialisation des graphiques si nous sommes sur la page d'accueil
    if (document.getElementById('profession-chart')) {
        try {
            // Charger les professionnels via dataService
            const professionnels = await dataService.loadProfessionnels(); 
            initProfessionChart(professionnels); // Passer les professionnels chargés
        } catch (error) {
             console.error("Erreur chargement professionnels pour graphique:", error);
             const chartElement = document.getElementById('profession-chart');
             if(chartElement) chartElement.innerHTML = '<p class="no-data" style="color:red;">Erreur chargement données.</p>';
        }
    }

    // Initialisation des modales
    initModals();

    // Gestion du bouton de suppression d'utilisateurs
    const deleteUserButton = document.getElementById('delete-user-button');
    if (deleteUserButton) {
        deleteUserButton.addEventListener('click', async function() {
            console.log("Delete user button clicked.");
            const userCheckboxes = document.querySelectorAll('#user-list-container input[type="checkbox"]:checked');
            const userIdsToDelete = Array.from(userCheckboxes).map(checkbox => checkbox.value);

            if (userIdsToDelete.length === 0) {
                showAlert("Veuillez sélectionner au moins un utilisateur à supprimer.", 'warning');
                return;
            }

            confirmAction(`Êtes-vous sûr de vouloir supprimer les utilisateurs sélectionnés (${userIdsToDelete.length}) ?`, async () => {
                try {
                    await dataService.deleteUsers(userIdsToDelete);
                    showAlert("Utilisateurs supprimés avec succès.", 'success');
                    // Refresh user list
                    const users = await dataService.loadUsers();
                    displayUsers(users);
                } catch (error) {
                    console.error("Erreur lors de la suppression des utilisateurs:", error);
                    showAlert("Erreur lors de la suppression des utilisateurs: " + error.message, 'danger');
                }
            });
        });
    } else {
        console.warn("Le bouton de suppression d'utilisateurs n'a pas été trouvé.");
    }
});

// Fonction pour initialiser le menu actif
function initActiveMenu() {
    const currentPage = window.location.pathname;
    document.querySelectorAll('nav ul li').forEach(item => {
        const link = item.querySelector('a');
        if (!link) return;
        const linkHref = link.getAttribute('href');
        if (linkHref && (currentPage.endsWith(linkHref) || (currentPage.endsWith('/') && linkHref.endsWith('index.html')))) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Fonction pour initialiser les graphiques
function initProfessionChart(professionnels) {
    const chartElement = document.getElementById('profession-chart');
    if (!chartElement) return;
    
    if (professionnels && professionnels.length > 0) {
        const professions = {};
        professionnels.forEach(pro => {
            if (pro.profession) {
                professions[pro.profession] = (professions[pro.profession] || 0) + 1;
            }
        });

        const labels = Object.keys(professions);
        const data = Object.values(professions);
        const colors = generateColors(labels.length);

        try {
             new Chart(chartElement.getContext('2d'), {
                 type: 'doughnut',
                 data: {
                     labels: labels,
                     datasets: [{
                         data: data,
                         backgroundColor: colors,
                         borderWidth: 1
                     }]
                 },
                 options: {
                     responsive: true,
                     maintainAspectRatio: false,
                     plugins: {
                         legend: {
                             position: 'right',
                         }
                     }
                 }
             });
        } catch(chartError) {
            console.error("Erreur création graphique professions:", chartError);
            chartElement.innerHTML = '<p class="no-data" style="color:red;">Erreur affichage graphique.</p>';
        }
    } else {
        chartElement.innerHTML = '<p class="no-data">Aucune donnée de profession disponible</p>';
    }
}

// Fonction pour générer des couleurs aléatoires
function generateColors(count) {
    const predefinedColors = [
        '#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6',
        '#1abc9c', '#d35400', '#34495e', '#16a085', '#c0392b'
    ];

    if (count <= predefinedColors.length) {
        return predefinedColors.slice(0, count);
    }

    const colors = [...predefinedColors];
    for (let i = predefinedColors.length; i < count; i++) {
        const r = Math.floor(Math.random() * 200);
        const g = Math.floor(Math.random() * 200);
        const b = Math.floor(Math.random() * 200);
        colors.push(`rgb(${r}, ${g}, ${b})`);
    }
    return colors;
}

// Gestion des modales
function initModals() {
    document.querySelectorAll('[data-toggle="modal"]').forEach(button => {
        button.addEventListener('click', function() {
            const targetSelector = this.getAttribute('data-target');
            if (!targetSelector) {
                return;
            }
            const target = document.querySelector(targetSelector);
            if (target) {
                target.style.display = 'block';
            }
        });
    });

    document.querySelectorAll('.modal-close').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });
}

// Fonctions utilitaires pour le formatage des données
function formatMontant(montant) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('fr-FR');
}

// Fonction pour afficher les alertes
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;

    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.insertBefore(alertDiv, mainContent.firstChild);
        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    } else {
        console.warn("Élément .main-content non trouvé pour afficher l'alerte.");
    }
}

// Fonction pour confirmer une action
function confirmAction(message, callback) {
    if (confirm(message)) {
        if (typeof callback === 'function') {
            callback();
        }
    }
}

// Exporter les fonctions potentiellement utiles globalement (à évaluer)
window.formatMontant = formatMontant;
window.formatDate = formatDate;
window.showAlert = showAlert;
window.confirmAction = confirmAction;
