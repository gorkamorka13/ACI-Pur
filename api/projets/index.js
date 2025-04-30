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
        // Include associated professionals
        const projet = await db.Projet.findByPk(id, {
            include: [
                { model: db.Professionnel, as: 'Responsables' },
                { model: db.Professionnel, as: 'Contributeurs' }
            ]
        });

        if (!projet) {
            return res.status(404).json({ error: 'Projet non trouvé' });
        }
        
        res.json(projet);
    } catch (error) {
        console.error('Erreur lors de la récupération du projet:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du projet' });
    }
});

// POST - Créer un nouveau projet with associations
router.post('/', async (req, res) => {
    const transaction = await db.sequelize.transaction(); // Use transaction for atomicity
    try {
        // Extract basic fields and association IDs (ensure they are arrays, even if empty)
        const { titre, annee, poids, statut, responsables = [], contributeurs = [] } = req.body;

        if (!titre || !annee || !poids || !statut) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Les champs titre, annee, poids et statut sont requis' });
        }

        // Create the project within the transaction
        const projet = await db.Projet.create({
            titre,
            annee,
            poids: parseInt(poids),
            statut
        }, { transaction });

        // Set associations if IDs are provided
        if (responsables.length > 0) {
            await projet.setResponsables(responsables, { transaction });
        }
        if (contributeurs.length > 0) {
            await projet.setContributeurs(contributeurs, { transaction });
        }

        // Commit the transaction
        await transaction.commit();

        // Fetch the created project with its associations to return it
        const projetAvecAssociations = await db.Projet.findByPk(projet.id, {
             include: [
                 { model: db.Professionnel, as: 'Responsables' },
                 { model: db.Professionnel, as: 'Contributeurs' }
             ]
         });

        res.status(201).json(projetAvecAssociations);

    } catch (error) {
        await transaction.rollback(); // Rollback on error
        console.error('Erreur lors de la création du projet:', error);
        res.status(500).json({ error: 'Erreur lors de la création du projet' });
    }
});

// PUT - Modifier un projet existant with associations
router.put('/:id', async (req, res) => {
    const transaction = await db.sequelize.transaction(); // Use transaction
    try {
        const { id } = req.params;
        // Extract basic fields and association IDs (ensure they are arrays, default to empty)
        const { titre, annee, poids, statut, responsables = [], contributeurs = [] } = req.body;

        if (!titre || !annee || !poids || !statut) {
             await transaction.rollback();
            return res.status(400).json({ error: 'Les champs titre, annee, poids et statut sont requis' });
        }

        // Find the project
        const projet = await db.Projet.findByPk(id, { transaction });

        if (!projet) {
             await transaction.rollback();
            return res.status(404).json({ error: 'Projet non trouvé' });
        }

        // Update basic fields
        await projet.update({
            titre,
            annee,
            poids: parseInt(poids),
            statut
        }, { transaction });

        // Update associations (set* methods replace existing associations)
        await projet.setResponsables(responsables, { transaction });
        await projet.setContributeurs(contributeurs, { transaction });

        // Commit the transaction
        await transaction.commit();

         // Fetch the updated project with its associations to return it
         const projetAvecAssociations = await db.Projet.findByPk(projet.id, {
             include: [
                 { model: db.Professionnel, as: 'Responsables' },
                 { model: db.Professionnel, as: 'Contributeurs' }
             ]
         });

        res.json(projetAvecAssociations);

    } catch (error) {
        await transaction.rollback(); // Rollback on error
        console.error('Erreur lors de la modification du projet:', error);
        res.status(500).json({ error: 'Erreur lors de la modification du projet' });
    }
});

// DELETE - Supprimer un projet (associations in join tables are typically handled by CASCADE constraints if set, or need manual cleanup if not)
// Note: Sequelize's destroy doesn't automatically cascade to join tables unless constraints are set at DB level.
// For simplicity here, we assume cascade delete or manual cleanup isn't immediately required by the plan.
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const projet = await db.Projet.findByPk(id);

        if (!projet) {
            return res.status(404).json({ error: 'Projet non trouvé' });
        }

        // Associations will be implicitly removed if DB constraints are set up (e.g., ON DELETE CASCADE)
        // Otherwise, the entries in ProjetResponsables/ProjetContributeurs might remain orphaned.
        await projet.destroy();
        res.status(204).send();
    } catch (error) {
        console.error('Erreur lors de la suppression du projet:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression du projet' });
    }
});

module.exports = router;
