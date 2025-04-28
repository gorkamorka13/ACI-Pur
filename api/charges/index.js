const express = require('express');
const router = express.Router();
const db = require('../../models');

// GET - Récupérer toutes les charges
router.get('/', async (req, res) => {
    try {
        const charges = await db.Charge.findAll({
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