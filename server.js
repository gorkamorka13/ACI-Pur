require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
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

// Routes API
app.use('/api/rcpMeetings', rcpMeetingsRouter);
app.use('/api/revenus', revenusRouter);
app.use('/api/charges', chargesRouter);
app.use('/api/professionnels', professionnelsRouter);
app.use('/api/projets', projetsRouter);
app.use('/api/parametresRepartition', parametresRepartitionRouter); // Utiliser le routeur dédié
app.use('/api/auth', authRouter); // Utiliser le routeur d'authentification

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
