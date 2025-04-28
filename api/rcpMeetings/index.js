const express = require('express');
const router = express.Router();
const db = require('../../models');

// GET - Récupérer toutes les réunions
router.get('/', async (req, res) => {
    try {
        const meetings = await db.RcpMeeting.findAll({
            order: [['date', 'DESC']]
        });
        res.json(meetings);
    } catch (error) {
        console.error('Erreur lors de la récupération des réunions:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des réunions' });
    }
});

// GET - Récupérer une réunion par ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const meeting = await db.RcpMeeting.findByPk(id);
        
        if (!meeting) {
            return res.status(404).json({ error: 'Réunion non trouvée' });
        }
        
        res.json(meeting);
    } catch (error) {
        console.error('Erreur lors de la récupération de la réunion:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de la réunion' });
    }
});

// POST - Créer une nouvelle réunion
router.post('/', async (req, res) => {
    try {
        const { date, titre, description, duree } = req.body;
        
        if (!date || !titre || !duree) {
            return res.status(400).json({ error: 'Les champs date, titre et durée sont requis' });
        }

        const meeting = await db.RcpMeeting.create({
            date,
            titre,
            description: description || '',
            duree: parseInt(duree)
        });

        res.status(201).json(meeting);
    } catch (error) {
        console.error('Erreur lors de la création de la réunion:', error);
        res.status(500).json({ error: 'Erreur lors de la création de la réunion' });
    }
});

// PUT - Modifier une réunion existante
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { date, titre, description, duree } = req.body;

        if (!date || !titre || !duree) {
            return res.status(400).json({ error: 'Les champs date, titre et durée sont requis' });
        }

        const meeting = await db.RcpMeeting.findByPk(id);
        
        if (!meeting) {
            return res.status(404).json({ error: 'Réunion non trouvée' });
        }

        await meeting.update({
            date,
            titre,
            description: description || '',
            duree: parseInt(duree)
        });

        res.json(meeting);
    } catch (error) {
        console.error('Erreur lors de la modification de la réunion:', error);
        res.status(500).json({ error: 'Erreur lors de la modification de la réunion' });
    }
});

// DELETE - Supprimer une réunion
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const meeting = await db.RcpMeeting.findByPk(id);
        
        if (!meeting) {
            return res.status(404).json({ error: 'Réunion non trouvée' });
        }

        await meeting.destroy();
        res.status(204).send();
    } catch (error) {
        console.error('Erreur lors de la suppression de la réunion:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression de la réunion' });
    }
});

module.exports = router; 