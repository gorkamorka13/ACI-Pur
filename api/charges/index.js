const express = require('express');
const router = express.Router();
const db = require('../../models');
const { Op } = require('sequelize'); // Import Op for date filtering

// GET - Récupérer toutes les charges
router.get('/', async (req, res) => {
    try {
        const { year } = req.query; // Get the year from query parameters
        let whereClause = {};

        if (year && !isNaN(parseInt(year))) {
            const parsedYear = parseInt(year);
            const startDate = new Date(parsedYear, 0, 1); // January 1st of the year
            const endDate = new Date(parsedYear, 11, 31, 23, 59, 59, 999); // December 31st of the year

            whereClause.date = {
                [Op.between]: [startDate, endDate]
            };
        }

        const charges = await db.Charge.findAll({
            where: whereClause, // Apply the where clause
            order: [['date', 'DESC']]
        });
        res.json(charges);
    } catch (error) {
        console.error('Erreur lors de la récupération des charges:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des charges' });
    }
});

// GET - Récupérer une charge par ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const charge = await db.Charge.findByPk(id);
        
        if (!charge) {
            return res.status(404).json({ error: 'Charge non trouvée' });
        }
        
        res.json(charge);
    } catch (error) {
        console.error('Erreur lors de la récupération de la charge:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de la charge' });
    }
});

// POST - Créer une nouvelle charge
router.post('/', async (req, res) => {
    try {
        const { date, description, categorie, type, montant } = req.body;
        
        if (!date || !description || !categorie || !type || !montant) {
            return res.status(400).json({ error: 'Tous les champs sont requis' });
        }

        const charge = await db.Charge.create({
            date,
            description,
            categorie,
            type,
            montant: parseFloat(montant)
        });

        res.status(201).json(charge);
    } catch (error) {
        console.error('Erreur lors de la création de la charge:', error);
        res.status(500).json({ error: 'Erreur lors de la création de la charge' });
    }
});

// PUT - Modifier une charge existante
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { date, description, categorie, type, montant } = req.body;

        if (!date || !description || !categorie || !type || !montant) {
            return res.status(400).json({ error: 'Tous les champs sont requis' });
        }

        const charge = await db.Charge.findByPk(id);
        
        if (!charge) {
            return res.status(404).json({ error: 'Charge non trouvée' });
        }

        await charge.update({
            date,
            description,
            categorie,
            type,
            montant: parseFloat(montant)
        });

        res.json(charge);
    } catch (error) {
        console.error('Erreur lors de la modification de la charge:', error);
        res.status(500).json({ error: 'Erreur lors de la modification de la charge' });
    }
});

// DELETE - Supprimer une charge
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const charge = await db.Charge.findByPk(id);
        
        if (!charge) {
            return res.status(404).json({ error: 'Charge non trouvée' });
        }

        await charge.destroy();
        res.status(204).send();
    } catch (error) {
        console.error('Erreur lors de la suppression de la charge:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression de la charge' });
    }
});

module.exports = router;
