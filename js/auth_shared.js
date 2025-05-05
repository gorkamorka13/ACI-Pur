document.addEventListener('DOMContentLoaded', () => {
    // Navbar Functionality
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (event) => {
            const page = event.target.dataset.page;
            if (page) { // Only prevent default if data-page exists
                event.preventDefault();
                switch (page) {
                    case 'accueil':
                        window.location.href = 'login.html';
                        break;
                    case 'fonctionnalites':
                        openDialog('fonctionnalitesDialog');
                        // Populate with README content later
                        break;
                    case 'a-propos':
                        openDialog('aProposDialog');
                        break;
                    case 'contact':
                        openDialog('contactDialog');
                        break;
                }
            }
            // If no data-page, default link behavior occurs (e.g., opening PDF)
        });
    });

    // Close Dialogs
    document.querySelectorAll('.dialog-close').forEach(closeButton => {
        closeButton.addEventListener('click', (event) => {
            const dialogId = event.target.closest('.dialog-content').parentNode.id;
            closeDialog(dialogId);
        });
    });

    // Open Dialog Function
    function openDialog(dialogId) {
        const dialog = document.getElementById(dialogId);
        if (dialog) {
            dialog.style.display = 'flex';
        }
    }

    // Close Dialog Function
    function closeDialog(dialogId) {
        const dialog = document.getElementById(dialogId);
        if (dialog) {
            dialog.style.display = 'none';
        }
    }

    // Hamburger menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
});
