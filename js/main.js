import { dataService } from './services/DataService.js'; // Importer dataService

document.addEventListener('DOMContentLoaded', async function() {
    console.log('[main.js] DOMContentLoaded fired.');

    // --- Sidebar Toggle Logic ---
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    if (sidebarToggle && sidebar && mainContent) {
        // Function to toggle sidebar state
        const toggleSidebar = () => {
            sidebar.classList.toggle('sidebar-collapsed');
            mainContent.classList.toggle('main-content-collapsed');
            console.log('Sidebar toggled. Collapsed:', sidebar.classList.contains('sidebar-collapsed'));
        };

        // Add click listener to the button
        sidebarToggle.addEventListener('click', toggleSidebar);
        console.log('Sidebar toggle listener added.');

        // Function to set initial state based on screen width
        const setInitialSidebarState = () => {
            if (window.innerWidth <= 768) {
                if (!sidebar.classList.contains('sidebar-collapsed')) {
                    sidebar.classList.add('sidebar-collapsed');
                    mainContent.classList.add('main-content-collapsed');
                    console.log('Initial state set to collapsed for small screen.');
                }
            } else {
                // Optional: Ensure it's expanded on larger screens if needed
                // sidebar.classList.remove('sidebar-collapsed');
                // mainContent.classList.remove('main-content-collapsed');
            }
        };

        // Set initial state on load
        setInitialSidebarState();

        // Optional: Adjust state on window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(setInitialSidebarState, 250); // Debounce resize event
        });

    } else {
        console.warn('Sidebar toggle elements not found. Toggle functionality disabled.');
    }
    // --- End Sidebar Toggle Logic ---


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
                console.log("Delete confirmation accepted."); // Log confirmation
                try {
                    const result = await dataService.deleteUsers(userIdsToDelete);

                    // Check if the result indicates a 403 Forbidden response
                    if (result && result.status === 403) {
                        showAlert(result.message || "Vous n'avez pas la permission de supprimer des utilisateurs.", 'danger');
                    } else {
                        // If not 403, assume success (or handled elsewhere) and refresh list
                        showAlert("Utilisateurs supprimés avec succès.", 'success');
                        // Refresh user list
                        const users = await dataService.loadUsers();
                        console.log("Reloaded users after deletion:", users); // Log reloaded users
                        displayUsers(users);
                    }
                } catch (error) {
                    console.error("Erreur lors de la suppression des utilisateurs:", error);
                    // This catch block will now handle errors *not* specifically returned as { status: 403 }
                    // This includes network errors or other API errors handled by dataService.handleResponse
                    showAlert("Erreur lors de la suppression des utilisateurs: " + error.message, 'danger');
                }
            });
        });
    } else {
        // This log remains valid
        console.warn("Delete user button (#delete-user-button) not found on this page.");
    }

    // --- Logic moved from parametres.html inline script ---

    // Check if we are on the parametres page before running specific logic
    if (window.location.pathname.endsWith('parametres.html')) {
        console.log("Detected parametres.html, running specific initialization..."); // More specific log
        initializeParametresPage();
    } else {
        console.log("Not on parametres.html, skipping specific initialization."); // Log skip
    }
    // --- End moved logic ---

});

// Function to initialize logic specific to parametres.html
async function initializeParametresPage() {
    console.log(">>> initializeParametresPage started"); // Log start
    // Paramètres (sera chargé depuis l'API ou utilisera les valeurs HTML par défaut)
    let parametres = null;
    // Éléments DOM (ensure these are accessible)
    console.log("Selecting DOM elements for parametres page..."); // Log element selection start
    const sliderCogerant = document.getElementById('slider-cogerant');
    const sliderRCP = document.getElementById('slider-rcp');
    const sliderProjets = document.getElementById('slider-projets');
    const barPartFixe = document.querySelector('.part-fixe');
    const barPartRCP = document.querySelector('.part-rcp');
    const barPartProjets = document.querySelector('.part-projets');
    const saveParamsButton = document.getElementById('save-params-button');
    const tabs = document.querySelectorAll('.tab');
    const contentSections = document.querySelectorAll('.content-section');
    const reportSelectionFrame = document.getElementById('report-selection-frame');
    const btnDownloadReports = document.getElementById('btn-download-reports');
    const checkboxCharges = document.getElementById('checkbox-charges-report');
    const checkboxRevenus = document.getElementById('checkbox-revenus-report');
    const checkboxAssociates = document.getElementById('checkbox-associates-report');
    const checkboxProjets = document.getElementById('checkbox-projets-report');
    const checkboxRcpMeetings = document.getElementById('checkbox-rcp-meetings-report');
    const exportDataBtn = document.getElementById('exportDataBtn');
    const exportDialog = document.getElementById('exportDialog');
    const confirmExportBtn = document.getElementById('confirmExportBtn');
    const cancelExportBtn = document.getElementById('cancelExportBtn');
    const modalCloseButtons = exportDialog ? exportDialog.querySelectorAll('.modal-close') : [];

    // Log selected elements to verify they exist
    console.log({ sliderCogerant, sliderRCP, sliderProjets, saveParamsButton, tabs, contentSections });

    // Ensure all required elements are present before proceeding
    if (!sliderCogerant || !sliderRCP || !sliderProjets || !barPartFixe || !barPartRCP || !barPartProjets || !saveParamsButton || tabs.length === 0 || contentSections.length === 0) {
        console.error("!!! One or more essential elements for parametres page initialization are missing. Aborting initialization. !!!"); // Highlight error
        return;
    }
    console.log("Essential elements found. Proceeding with initialization..."); // Log success

    // Charger les valeurs depuis l'API via DataService
    console.log("Loading initial parameters via dataService..."); // Log API call start
    try {
        parametres = await dataService.loadParametresRepartition();
        if (parametres) {
            console.log("API parameters loaded:", parametres); // Log loaded params
            sliderCogerant.value = parametres.facteurCogerant;
            sliderRCP.value = parametres.partRCP;
            sliderProjets.value = parametres.partProjets;
        } else {
            console.warn("No initial parameters loaded from API, using HTML defaults."); // Log warning
            parametres = {
                 partFixe: 100 - (parseInt(sliderRCP.value) + parseInt(sliderProjets.value)), // Ensure sliders have values
                 facteurCogerant: parseFloat(sliderCogerant.value), // Ensure sliders have values
                 partRCP: parseInt(sliderRCP.value), // Ensure sliders have values
                 partProjets: parseInt(sliderProjets.value) // Ensure sliders have values
            };
            console.log("Default parameters object created:", parametres); // Log default params
        }
    } catch (error) {
         console.error("Error loading initial parameters:", error); // Log error
         alert("Erreur chargement paramètres: " + error.message + "\nUtilisation des valeurs par défaut.");
         // Ensure sliders have values before reading them
         parametres = {
              partFixe: 100 - (parseInt(sliderRCP?.value || '0') + parseInt(sliderProjets?.value || '0')), // Add null checks and defaults
              facteurCogerant: parseFloat(sliderCogerant?.value || '1'), // Add null checks and defaults
              partRCP: parseInt(sliderRCP?.value || '0'), // Add null checks and defaults
              partProjets: parseInt(sliderProjets?.value || '0') // Add null checks and defaults
         };
         console.log("Default parameters object created after error:", parametres); // Log error default params
    }

    // Load all data for export functionality (Consider if this needs to be global or passed)
    let globalData = {}; // Keep it local to this scope for now
    console.log("Loading data for export..."); // Log export data loading
    try {
        globalData.revenus = await dataService.loadRevenus();
        globalData.charges = await dataService.loadCharges();
        globalData.associes = await dataService.loadProfessionnels();
        globalData.rcpmeetings = await dataService.loadRcpMeetings();
        globalData.projets = await dataService.loadProjets();
        // Add parametres to globalData for export
        globalData.parametres = parametres;
        console.log("Data successfully loaded for export:", globalData); // Log success
    } catch (error) {
        console.error("Error loading data for export:", error); // Log error
    }

    // Mettre à jour l'affichage initial APRES avoir défini les valeurs des sliders
    console.log("Calling updateDisplay for initial setup..."); // Log initial display update
    updateDisplay(); // Call the function now defined within main.js

    // Attacher les écouteurs d'événements ICI, après l'initialisation
    console.log("Attaching event listeners for parametres page elements..."); // Log listener attachment start
    console.log("Attaching listener to sliderCogerant:", sliderCogerant);
    sliderCogerant.addEventListener('input', updateDisplay);
    console.log("Attaching listener to sliderRCP:", sliderRCP);
    sliderRCP.addEventListener('input', handleVariableSliderInput);
    console.log("Attaching listener to sliderProjets:", sliderProjets);
    sliderProjets.addEventListener('input', handleVariableSliderInput);
    console.log("Attaching listener to saveParamsButton:", saveParamsButton);
    saveParamsButton.addEventListener('click', handleSaveClick);

    // Tab listeners
    console.log(`Attaching listeners to ${tabs.length} tabs...`);
    tabs.forEach((tab, index) => {
        console.log(`Attaching listener to tab ${index}:`, tab);
        tab.addEventListener('click', async function() { // Make the handler async
            const tabText = this.textContent.trim();
            console.log(`>>> Tab clicked: ${tabText} (event listener fired)`); // Log tab click

            tabs.forEach(t => t.classList.remove('active'));
            contentSections.forEach(section => section.style.display = 'none');
            this.classList.add('active');

            let sectionToShowId = '';
            if (tabText === 'Facteurs de répartition') sectionToShowId = 'facteurs-repartition-section';
            else if (tabText === 'Paramètres généraux') sectionToShowId = 'parametres-generaux-section';
            else if (tabText === 'Génération de rapports') sectionToShowId = 'sauvegarde-export-section';
            else if (tabText === 'Gestion des utilisateurs') sectionToShowId = 'Gestion-utilisateurs-section';

            console.log(`Attempting to show section: #${sectionToShowId}`); // Log section to show
            const sectionToShow = document.getElementById(sectionToShowId);

            if (sectionToShow) {
                sectionToShow.style.display = 'block';
                console.log(`Section #${sectionToShowId} displayed.`); // Log display success

                // Special handling for tabs
                if (tabText === 'Génération de rapports') {
                    if (reportSelectionFrame) {
                         reportSelectionFrame.style.display = 'block';
                         console.log("Report selection frame displayed.");
                    } else console.warn("Report selection frame not found when showing 'Génération de rapports' tab.");
                } else if (tabText === 'Gestion des utilisateurs') {
                    try {
                        console.log("Loading users for display (triggered by tab click)..."); // Log user load trigger
                        const users = await dataService.loadUsers();
                        console.log("Users loaded for tab display:", users); // Log loaded users
                        displayUsers(users); // Call displayUsers defined in main.js
                    } catch (error) {
                        console.error("Failed to load or display users on tab click:", error); // Log error
                        const container = document.getElementById('user-list-container');
                        if (container) container.innerHTML = '<p style="color: red;">Erreur lors du chargement des utilisateurs.</p>';
                    }
                }
            } else {
                 console.error(`Content section with ID #${sectionToShowId} not found!`); // Log section not found
            }

            // Hide report frame if not on the correct tab
            if (tabText !== 'Génération de rapports' && reportSelectionFrame) {
                reportSelectionFrame.style.display = 'none';
            }
        });
    });

    // Report download listener
    console.log("Checking elements for report download listener:", { btnDownloadReports, checkboxCharges, checkboxRevenus /* ... add others */ }); // Log elements
    if (btnDownloadReports && checkboxCharges && checkboxRevenus && checkboxAssociates && checkboxProjets && checkboxRcpMeetings) {
        console.log("Attaching listener to btnDownloadReports:", btnDownloadReports); // Log attachment
        btnDownloadReports.addEventListener('click', function() {
            console.log(">>> Download reports button clicked (event listener fired)."); // Log click
            if (checkboxCharges.checked) downloadReport('charges');
            if (checkboxRevenus.checked) downloadReport('revenus');
            if (checkboxAssociates.checked) downloadReport('associates');
            if (checkboxProjets.checked) downloadReport('projets');
            if (checkboxRcpMeetings.checked) downloadReport('rcp-meetings');
        });
    } else {
        console.warn("One or more report download elements not found. Download listener not attached."); // Use warn
    }

    // Export data listeners
    console.log("Checking elements for export data listeners:", { exportDataBtn, exportDialog, confirmExportBtn /* ... */ }); // Log elements
    if (exportDataBtn && exportDialog && confirmExportBtn && cancelExportBtn) {
        console.log("Attaching listeners for export data modal."); // Log attachment
        exportDataBtn.addEventListener('click', () => {
             console.log(">>> Export data button clicked (event listener fired)."); // Log click
             exportDialog.style.display = 'block';
        });
        confirmExportBtn.addEventListener('click', () => {
             console.log(">>> Confirm export button clicked (event listener fired)."); // Log click
             exportData(globalData); // Pass globalData
        });
        cancelExportBtn.addEventListener('click', () => {
             console.log(">>> Cancel export button clicked (event listener fired)."); // Log click
             exportDialog.style.display = 'none';
        });
        modalCloseButtons.forEach(button => {
             button.addEventListener('click', () => {
                 console.log(">>> Modal close button clicked (event listener fired)."); // Log click
                 exportDialog.style.display = 'none';
             });
        });
        window.addEventListener('click', (event) => {
             if (event.target === exportDialog) {
                 console.log(">>> Click outside export modal detected (event listener fired)."); // Log click
                 exportDialog.style.display = 'none';
             }
        });
    } else {
        console.warn("One or more export modal elements not found. Export listeners not attached."); // Use warn
    }

    console.log("<<< initializeParametresPage finished"); // Log end
}


// --- Helper functions moved from parametres.html ---

// Function to handle report download
async function downloadReport(reportType) {
    console.log(`Attempting to download report: ${reportType}`); // Log download attempt
    try {
        const token = localStorage.getItem('token');
        let endpoint = '';
        // Simplified endpoint logic
        const reportEndpoints = {
            'associates': '/api/associates/report',
            'charges': '/api/charges/report/pdf',
            'revenus': '/api/revenus/report/pdf',
            'projets': '/api/projets/report/pdf',
            'rcp-meetings': '/api/rcpMeetings/report/pdf'
        };
        endpoint = reportEndpoints[reportType];

        if (!endpoint) { console.error(`Unknown or unset endpoint for report type: ${reportType}`); return; }
        console.log(`Using endpoint ${endpoint} for ${reportType} report.`); // Log endpoint

        const response = await fetch(endpoint, { headers: { 'Authorization': `Bearer ${token}` } });
        console.log(`Report download response status for ${reportType}: ${response.status}`); // Log status
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}_report.pdf`;
        document.body.appendChild(a);
        console.log(`Triggering download for ${reportType}...`); // Log download trigger
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        console.log(`Download link cleaned up for ${reportType}.`); // Log cleanup
    } catch (error) {
        console.error(`Error downloading report ${reportType}:`, error); // Log error
        showAlert(`Erreur lors du téléchargement du rapport ${reportType}: ` + error.message, 'danger');
    }
}

// Fonction pour mettre à jour l'affichage des paramètres
function updateDisplay() {
    // console.log("updateDisplay called"); // Optional: uncomment if needed for deep debugging
    const sliderCogerant = document.getElementById('slider-cogerant');
    const sliderRCP = document.getElementById('slider-rcp');
    const sliderProjets = document.getElementById('slider-projets');
    const barPartFixe = document.querySelector('.part-fixe');
    const barPartRCP = document.querySelector('.part-rcp');
    const barPartProjets = document.querySelector('.part-projets');
    const saveParamsButton = document.getElementById('save-params-button');

    // Ensure elements exist before proceeding - crucial check
    if (!sliderCogerant || !sliderRCP || !sliderProjets || !barPartFixe || !barPartRCP || !barPartProjets || !saveParamsButton) {
        console.error("!!! Required elements for updateDisplay not found. Cannot update display. !!!"); // Highlight error
        return false; // Indicate failure
    }

    const valueCogerant = sliderCogerant.value;
    const valueRCP = sliderRCP.value;
    const valueProjets = sliderProjets.value;
    const partFixe = 100 - (parseInt(valueRCP || '0') + parseInt(valueProjets || '0')); // Add defaults

    // Update text content safely
    const sliderValueElements = document.querySelectorAll('.slider-value');
    if (sliderValueElements.length >= 3) {
        sliderValueElements[0].textContent = '×' + valueCogerant;
        sliderValueElements[1].textContent = valueRCP + '%';
        sliderValueElements[2].textContent = valueProjets + '%';
    } else {
        console.error("Could not find all slider-value elements to update text.");
    }

    barPartFixe.style.width = partFixe + '%';
    barPartFixe.textContent = 'Part fixe: ' + partFixe + '%';
    barPartRCP.style.width = valueRCP + '%';
    barPartRCP.textContent = 'RCP: ' + valueRCP + '%';
    barPartProjets.style.width = valueProjets + '%';
    barPartProjets.textContent = 'Projets: ' + valueProjets + '%';

    const total = partFixe + parseInt(valueRCP || '0') + parseInt(valueProjets || '0'); // Add defaults
    saveParamsButton.disabled = total !== 100;
    saveParamsButton.style.opacity = total !== 100 ? '0.5' : '1';

    sliderValueElements.forEach(value => { value.style.color = total === 100 ? '#2196F3' : '#f44336'; });
    // console.log(`updateDisplay finished. Total: ${total}`); // Optional log
    return total === 100;
}

// Fonction séparée pour gérer l'input des sliders RCP/Projets
function handleVariableSliderInput() {
    // console.log(`handleVariableSliderInput called by: ${this.id}`); // Optional log
    const sliderRCP = document.getElementById('slider-rcp');
    const sliderProjets = document.getElementById('slider-projets');
    if (!sliderRCP || !sliderProjets) {
         console.error("RCP or Projets slider not found in handleVariableSliderInput.");
         return; // Guard clause
    }

    const currentRCP = parseInt(sliderRCP.value || '0'); // Add default
    const currentProjets = parseInt(sliderProjets.value || '0'); // Add default
    const total = currentRCP + currentProjets;
    // console.log(`Slider input - RCP: ${currentRCP}, Projets: ${currentProjets}, Total: ${total}`); // Optional log

    if (total > 100) {
        console.log(`Total ${total} > 100, adjusting...`); // Log adjustment
        if (this.id === 'slider-rcp') { // Check which slider triggered the event
            sliderProjets.value = Math.max(0, 100 - currentRCP);
            console.log(`Adjusted Projets slider to: ${sliderProjets.value}`); // Log adjustment value
        } else if (this.id === 'slider-projets') {
            sliderRCP.value = Math.max(0, 100 - currentProjets);
            console.log(`Adjusted RCP slider to: ${sliderRCP.value}`); // Log adjustment value
        } else {
             console.warn("handleVariableSliderInput called with unexpected 'this' context:", this); // Log unexpected context
        }
    }
    updateDisplay();
}

// Fonction séparée pour gérer le clic sur le bouton de sauvegarde des paramètres
async function handleSaveClick() {
    console.log(">>> Save parameters button clicked (event listener fired)."); // Log click
    const sliderCogerant = document.getElementById('slider-cogerant');
    const sliderRCP = document.getElementById('slider-rcp');
    const sliderProjets = document.getElementById('slider-projets');
    if (!sliderCogerant || !sliderRCP || !sliderProjets) {
         console.error("!!! Slider elements not found for saving parameters. Aborting save. !!!"); // Highlight error
         return;
    }

    console.log("Calling updateDisplay to check validity before saving..."); // Log validity check
    if (updateDisplay()) {
        const partFixe = 100 - (parseInt(sliderRCP.value || '0') + parseInt(sliderProjets.value || '0')); // Add defaults
        const newParams = {
            partFixe: partFixe,
            facteurCogerant: parseFloat(sliderCogerant.value || '1'), // Add default
            partRCP: parseInt(sliderRCP.value || '0'), // Add default
            partProjets: parseInt(sliderProjets.value || '0') // Add default
        };
        console.log("Parameters are valid (total 100%). Attempting to save:", newParams); // Log save attempt

        try {
            const savedParams = await dataService.saveParametresRepartition(newParams);
            // Update local 'parametres' variable if needed, maybe pass it or make it accessible
            console.log("API save successful:", savedParams); // Log success
            showAlert('Paramètres enregistrés avec succès!', 'success');
            console.log("Calling updateDisplay after successful save..."); // Log display update
            updateDisplay();
        } catch (error) {
            console.error("Error saving parameters via API:", error); // Log API error
            showAlert("Erreur sauvegarde: " + error.message, 'danger');
        }
    } else {
         console.log("Save prevented: Total is not 100%."); // Log prevention
    }
}

// --- Export Data Functionality ---
async function exportData(dataToExport) { // Accept data as argument
    console.log("exportData function called."); // Log function call
    const selectedData = {};
    const checkboxes = document.querySelectorAll('#exportDialog input[type="checkbox"]');
    console.log(`Found ${checkboxes.length} checkboxes for export.`); // Log checkbox count

    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const dataType = checkbox.id.replace('export-checkbox-', '');
            console.log(`Checkbox ${dataType} is checked.`); // Log checked type
            if (dataToExport && dataToExport[dataType]) { // Check dataToExport exists
                selectedData[dataType] = dataToExport[dataType];
                console.log(`Added ${dataType} to selectedData.`); // Log data addition
            } else {
                 console.warn(`Data type ${dataType} selected but not found in provided data:`, dataToExport); // Log missing data
            }
        }
    });

    if (Object.keys(selectedData).length === 0) {
        console.log("No data selected for export."); // Log no selection
        alert("Veuillez sélectionner au moins un type de données à exporter.");
        return;
    }

    console.log("Preparing JSON data for export:", selectedData); // Log data to be exported
    const dataStr = JSON.stringify(selectedData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `msp_gestion_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    console.log("Triggering export download..."); // Log download trigger
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log("Export download triggered and link cleaned up."); // Log cleanup

    const exportDialog = document.getElementById('exportDialog');
    if (exportDialog) {
        exportDialog.style.display = 'none';
        console.log("Export dialog closed."); // Log dialog close
    }
}
// --- End Export Data Functionality ---


// Fonction pour initialiser le menu actif
function initActiveMenu() {
    // console.log("initActiveMenu called"); // Optional log
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

// Function to display users in the list container
export function displayUsers(users) {
    console.log("displayUsers called with users:", users); // Add this log
    const container = document.getElementById('user-list-container');
    if (!container) {
        console.error("User list container not found.");
        return;
    }
    container.innerHTML = ''; // Clear previous content

    if (!users || users.length === 0) {
        container.innerHTML = '<p>Aucun utilisateur trouvé.</p>';
        return;
    }

    const list = document.createElement('ul');
    list.style.listStyle = 'none';
    list.style.padding = '0';

    users.forEach(user => {
        console.log('Processing user:', user); // Add console log here
        const listItem = document.createElement('li');
        listItem.style.display = 'flex';
        listItem.style.alignItems = 'center';
        listItem.style.marginBottom = '10px';
        listItem.style.padding = '10px';
        listItem.style.border = '1px solid #eee';
        listItem.style.borderRadius = '4px';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `user-checkbox-${user.id}`; // Assign a unique ID
        checkbox.value = user.id;
        checkbox.style.marginRight = '10px'; // Add some space between checkbox and avatar
        checkbox.style.verticalAlign = 'middle'; // Align checkbox vertically

        // Disable checkbox if the user is 'Admin'
        if (user.username === 'Admin') {
            checkbox.disabled = true;
            // Optional: Add a visual indicator (e.g., change cursor, add title)
            listItem.style.cursor = 'not-allowed';
            listItem.title = 'L\'utilisateur Admin ne peut pas être supprimé.';
        }

        const avatar = document.createElement('img');
        // Use user.avatar directly if it exists, otherwise use default.
        // The user.avatar field seems to already contain the '/images/' path.
        avatar.src = user.avatar ? user.avatar : '/images/default_avatar.png';
        avatar.alt = `Avatar de ${user.email}`;
        avatar.style.width = '40px';
        avatar.style.height = '40px';
        avatar.style.borderRadius = '50%';
        avatar.style.marginRight = '15px';
        avatar.style.verticalAlign = 'middle'; // Align avatar vertically
        // Add error handling for broken image links
        avatar.onerror = function() { this.src = '/images/default_avatar.png'; };

        const emailSpan = document.createElement('span');
        emailSpan.textContent = user.email;
        emailSpan.style.fontSize = '0.9em';
        emailSpan.style.color = '#333';
        emailSpan.style.verticalAlign = 'middle'; // Align email vertically
        emailSpan.style.marginRight = '10px'; // Add some space after email

        const usernameSpan = document.createElement('span');
        usernameSpan.textContent = `(${user.username || 'N/A'})`; // Display username, fallback if missing
        usernameSpan.style.fontSize = '0.8em';
        usernameSpan.style.color = '#666';
        usernameSpan.style.verticalAlign = 'middle';

        listItem.appendChild(checkbox); // Add checkbox first
        listItem.appendChild(avatar);
        listItem.appendChild(emailSpan);
        listItem.appendChild(usernameSpan); // Add username span
        list.appendChild(listItem);
    });

    container.appendChild(list);
}

// Exporter les fonctions potentiellement utiles globalement (à évaluer)
window.formatMontant = formatMontant;
window.formatDate = formatDate;
window.showAlert = showAlert;
window.confirmAction = confirmAction;
