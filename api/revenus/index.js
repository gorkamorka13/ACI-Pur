const express = require('express');
const router = express.Router();
const db = require('../../models');

// GET - Récupérer tous les revenus
router.get('/', async (req, res) => {
    try {
        const revenus = await db.Revenu.findAll({
            order: [['date', 'DESC']]
        });
        res.json(revenus);
    } catch (error) {
        console.error('Erreur lors de la récupération des revenus:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des revenus' });
    }
});

// GET - Récupérer un revenu par ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const revenu = await db.Revenu.findByPk(id);
        
        if (!revenu) {
            return res.status(404).json({ error: 'Revenu non trouvé' });
        }
        
        res.json(revenu);
    } catch (error) {
        console.error('Erreur lors de la récupération du revenu:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du revenu' });
    }
});

// POST - Créer un nouveau revenu
router.post('/', async (req, res) => {
    try {
        const { date, description, montant } = req.body;
        
        if (!date || !description || !montant) {
            return res.status(400).json({ error: 'Tous les champs sont requis' });
        }

        const revenu = await db.Revenu.create({
            date,
            description,
            montant: parseFloat(montant)
        });

        res.status(201).json(revenu);
    } catch (error) {
        console.error('Erreur lors de la création du revenu:', error);
        res.status(500).json({ error: 'Erreur lors de la création du revenu' });
    }
});

// PUT - Modifier un revenu existant
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { date, description, montant } = req.body;

        if (!date || !description || !montant) {
            return res.status(400).json({ error: 'Tous les champs sont requis' });
        }

        const revenu = await db.Revenu.findByPk(id);
        
        if (!revenu) {
            return res.status(404).json({ error: 'Revenu non trouvé' });
        }

        await revenu.update({
            date,
            description,
            montant: parseFloat(montant)
        });

        res.json(revenu);
    } catch (error) {
        console.error('Erreur lors de la modification du revenu:', error);
        res.status(500).json({ error: 'Erreur lors de la modification du revenu' });
    }
});

// DELETE - Supprimer un revenu
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const revenu = await db.Revenu.findByPk(id);
        
        if (!revenu) {
            return res.status(404).json({ error: 'Revenu non trouvé' });
        }

        await revenu.destroy();
        res.status(204).send();
    } catch (error) {
        console.error('Erreur lors de la suppression du revenu:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression du revenu' });
    }
});

module.exports = router; 