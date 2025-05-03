require('dotenv').config();
const express = require('express');
const fs = require('fs'); // Import fs module
const app = express();
const port = 3000;
const os = require('os');
const path = require('path');


// Importer les modèles Sequelize
const db = require('./models');

// Importer les routes API
// Clear require cache for rcpMeetings to ensure latest version is loaded
delete require.cache[require.resolve('./api/rcpMeetings')]; 
const rcpMeetingsRouter = require('./api/rcpMeetings');
console.log('rcpMeetingsRouter after require:', rcpMeetingsRouter); // Log the router object

const revenusRouter = require('./api/revenus');
const chargesRouter = require('./api/charges');
const professionnelsRouter = require('./api/professionnels');
const projetsRouter = require('./api/projets');
const parametresRepartitionRouter = require('./api/parametresRepartition'); // Importer le nouveau routeur
const authRouter = require('./api/auth'); // Importer le routeur d'authentification
const usersRouter = require('./api/users'); // Importer le routeur des utilisateurs
const associatesReportRouter = require('./api/associates/report'); // Importer le routeur du rapport des associés

const authenticateToken = require('./middleware/authenticateToken'); // Importer le middleware d'authentification

const nodeEnv = process.env.NODE_ENV; // Will be 'development' based on the .env file
const jwtSecret = process.env.JWT_SECRET; // Will be 'your_super_secret_...'

if (nodeEnv === 'development') {
  console.log('Running in development mode.');
}
else if (nodeEnv === 'production') {
  console.log('Running in production mode.');
}
// Fonction pour obtenir l'adresse IP locale
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Ignorer les interfaces non IPv4 et les interfaces loopback
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '0.0.0.0';
}

// Middleware pour parser le JSON
app.use(express.json());

// Middleware de logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Servir les fichiers statiques
app.use(express.static('.', {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
        }
    }
}));

// Routes API - Protected routes use authenticateToken middleware
app.use('/api/rcpMeetings', authenticateToken, rcpMeetingsRouter);
app.use('/api/revenus', authenticateToken, revenusRouter);
app.use('/api/charges', authenticateToken, chargesRouter);
app.use('/api/professionnels', authenticateToken, professionnelsRouter);
app.use('/api/projets', authenticateToken, projetsRouter);
app.use('/api/parametresRepartition', authenticateToken, parametresRepartitionRouter); // Utiliser le routeur dédié
app.use('/api/users', authenticateToken, usersRouter); // Utiliser le routeur des utilisateurs
// Add route for associates report
app.get('/api/associates/report', authenticateToken, async (req, res) => {
    try {
        const pdfBuffer = await associatesReportRouter.generateAssociatesReportPDF();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="associates_report.pdf"');
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating associates report:', error);
        res.status(500).send('Error generating report');
    }
});

// Add route for projets report
app.get('/api/projets/report/pdf', authenticateToken, async (req, res) => {
    try {
        const { generateProjetsReportPDF } = require('./api/projets/report');
        const pdfBuffer = await generateProjetsReportPDF();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="projets_report.pdf"');
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating projets report:', error);
        res.status(500).send('Error generating report');
    }
});


// Public authentication routes
app.use('/api/auth', authRouter); // Utiliser le routeur d'authentification

// Ensure images directory exists
const imagesDir = path.join(__dirname, 'images'); // Use 'images' directory name
if (!fs.existsSync(imagesDir)){
    fs.mkdirSync(imagesDir, { recursive: true });
    console.log(`Created directory: ${imagesDir}`);
}

// Serve static files for avatars from 'images' directory
app.use('/images', express.static(imagesDir)); // Use 'images' directory variable


// Synchronisation de la base de données et démarrage du serveur
db.sequelize.sync().then(() => {
    const localIP = getLocalIP();
    app.listen(port, '0.0.0.0', () => {
        console.log(`Serveur démarré sur:`);
        console.log(`- Local: http://localhost:${port}`);
        console.log(`- Réseau: http://${localIP}:${port}`);
        console.log('\nPour accéder depuis un autre ordinateur, utilisez l\'adresse Réseau');
    });
}).catch(err => {
    console.error('Erreur lors de la synchronisation de la base de données:', err);
});
