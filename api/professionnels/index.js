const express = require('express');
const router = express.Router();
const db = require('../../models');

// GET - Récupérer tous les professionnels
router.get('/', async (req, res) => {
    try {
        const professionnels = await db.Professionnel.findAll({
            order: [['nom', 'ASC']]
        });
        res.json(professionnels);
    } catch (error) {
        console.error('Erreur lors de la récupération des professionnels:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des professionnels' });
    }
});

// GET - Récupérer un professionnel par ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const professionnel = await db.Professionnel.findByPk(id);
        
        if (!professionnel) {
            return res.status(404).json({ error: 'Professionnel non trouvé' });
        }
        
        res.json(professionnel);
    } catch (error) {
        console.error('Erreur lors de la récupération du professionnel:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du professionnel' });
    }
});

// POST - Créer un nouveau professionnel
router.post('/', async (req, res) => {
    try {
        const { nom, profession, email, telephone, statut } = req.body;
        
        if (!nom || !profession || !statut) {
            return res.status(400).json({ error: 'Les champs nom, profession et statut sont requis' });
        }

        const professionnel = await db.Professionnel.create({
            nom,
            profession,
            email,
            telephone,
            statut
        });

        res.status(201).json(professionnel);
    } catch (error) {
        console.error('Erreur lors de la création du professionnel:', error);
        res.status(500).json({ error: 'Erreur lors de la création du professionnel' });
    }
});

// PUT - Modifier un professionnel existant
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, profession, email, telephone, statut } = req.body;

        if (!nom || !profession || !statut) {
            return res.status(400).json({ error: 'Les champs nom, profession et statut sont requis' });
        }

        const professionnel = await db.Professionnel.findByPk(id);
        
        if (!professionnel) {
            return res.status(404).json({ error: 'Professionnel non trouvé' });
        }

        await professionnel.update({
            nom,
            profession,
            email,
            telephone,
            statut
        });

        res.json(professionnel);
    } catch (error) {
        console.error('Erreur lors de la modification du professionnel:', error);
        res.status(500).json({ error: 'Erreur lors de la modification du professionnel' });
    }
});

// DELETE - Supprimer un professionnel
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const professionnel = await db.Professionnel.findByPk(id);
        
        if (!professionnel) {
            return res.status(404).json({ error: 'Professionnel non trouvé' });
        }

        await professionnel.destroy();
        res.status(204).send();
    } catch (error) {
        console.error('Erreur lors de la suppression du professionnel:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression du professionnel' });
    }
});

module.exports = router; 