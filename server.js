const express = require('express');
const app = express();
const port = 3000;
const os = require('os');
const path = require('path');
require('dotenv').config();

// Importer les modèles Sequelize
const db = require('./models');

// Importer les routes API
const rcpMeetingsRouter = require('./api/rcpMeetings');
const revenusRouter = require('./api/revenus');
const chargesRouter = require('./api/charges');
const professionnelsRouter = require('./api/professionnels');
const projetsRouter = require('./api/projets');

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

// Route pour obtenir les paramètres de répartition
app.get('/api/parametresRepartition', async (req, res) => {
    try {
        const parametres = await db.ParametresRepartition.findOne();
        res.json(parametres || {});
    } catch (error) {
        console.error('Erreur lors de la récupération des paramètres de répartition:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des paramètres de répartition' });
    }
});

// Route pour mettre à jour les paramètres de répartition
app.put('/api/parametresRepartition', async (req, res) => {
    try {
        const [instance, created] = await db.ParametresRepartition.findOrCreate({
            where: { id: 1 },
            defaults: req.body
        });
        
        if (!created) {
            await instance.update(req.body);
        }
        
        res.json(instance);
    } catch (error) {
        console.error('Erreur lors de la mise à jour des paramètres de répartition:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour des paramètres de répartition' });
    }
});

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