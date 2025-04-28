const express = require('express');
const router = express.Router();
const db = require('../../models');

// GET - Récupérer tous les projets
router.get('/', async (req, res) => {
    try {
        const projets = await db.Projet.findAll({
            order: [['annee', 'DESC'], ['titre', 'ASC']]
        });
        res.json(projets);
    } catch (error) {
        console.error('Erreur lors de la récupération des projets:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des projets' });
    }
});

// GET - Récupérer un projet par ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const projet = await db.Projet.findByPk(id);
        
        if (!projet) {
            return res.status(404).json({ error: 'Projet non trouvé' });
        }
        
        res.json(projet);
    } catch (error) {
        console.error('Erreur lors de la récupération du projet:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du projet' });
    }
});

// POST - Créer un nouveau projet
router.post('/', async (req, res) => {
    try {
        const { titre, annee, poids, statut } = req.body;
        
        if (!titre || !annee || !poids || !statut) {
            return res.status(400).json({ error: 'Tous les champs sont requis' });
        }

        const projet = await db.Projet.create({
            titre,
            annee,
            poids: parseInt(poids),
            statut
        });

        res.status(201).json(projet);
    } catch (error) {
        console.error('Erreur lors de la création du projet:', error);
        res.status(500).json({ error: 'Erreur lors de la création du projet' });
    }
});

// PUT - Modifier un projet existant
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { titre, annee, poids, statut } = req.body;

        if (!titre || !annee || !poids || !statut) {
            return res.status(400).json({ error: 'Tous les champs sont requis' });
        }

        const projet = await db.Projet.findByPk(id);
        
        if (!projet) {
            return res.status(404).json({ error: 'Projet non trouvé' });
        }

        await projet.update({
            titre,
            annee,
            poids: parseInt(poids),
            statut
        });

        res.json(projet);
    } catch (error) {
        console.error('Erreur lors de la modification du projet:', error);
        res.status(500).json({ error: 'Erreur lors de la modification du projet' });
    }
});

// DELETE - Supprimer un projet
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const projet = await db.Projet.findByPk(id);
        
        if (!projet) {
            return res.status(404).json({ error: 'Projet non trouvé' });
        }

        await projet.destroy();
        res.status(204).send();
    } catch (error) {
        console.error('Erreur lors de la suppression du projet:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression du projet' });
    }
});

module.exports = router; 