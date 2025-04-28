const express = require('express');
const router = express.Router();
const db = require('../../models');

// GET - Récupérer les paramètres de répartition (on suppose qu'il n'y a qu'une seule ligne)
router.get('/', async (req, res) => {
    try {
        // Tenter de trouver la première ligne de paramètres
        let parametres = await db.ParametresRepartition.findOne();

        // Si aucune ligne n'existe, créer une ligne avec des valeurs par défaut
        if (!parametres) {
            console.log("Aucun paramètre trouvé, création des paramètres par défaut.");
            parametres = await db.ParametresRepartition.create({
                partFixe: 50, // Valeur par défaut
                facteurCogerant: 1.7,
                partRCP: 25,
                partProjets: 25
            });
        }
        
        res.json(parametres);
    } catch (error) {
        console.error('Erreur lors de la récupération des paramètres:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des paramètres' });
    }
});

// PUT - Modifier les paramètres de répartition (on suppose qu'il n'y a qu'une seule ligne)
router.put('/', async (req, res) => {
    try {
        const { partFixe, facteurCogerant, partRCP, partProjets } = req.body;

        // Validation simple
        if (partFixe == null || facteurCogerant == null || partRCP == null || partProjets == null) {
            return res.status(400).json({ error: 'Tous les champs de paramètres sont requis' });
        }
        
        // Vérifier que la somme des parts variables est <= 100
        if (parseInt(partRCP) + parseInt(partProjets) > 100) {
             return res.status(400).json({ error: 'La somme des parts RCP et Projets ne peut excéder 100%' });
        }
        // Vérifier que la part fixe calculée est correcte
        if (parseInt(partFixe) !== 100 - (parseInt(partRCP) + parseInt(partProjets))) {
             return res.status(400).json({ error: 'Incohérence dans le calcul de la part fixe' });
        }


        // Trouver la première (et unique) ligne de paramètres
        let parametres = await db.ParametresRepartition.findOne();

        if (!parametres) {
            // Si elle n'existe pas, la créer (cas improbable si GET a été appelé avant)
             parametres = await db.ParametresRepartition.create({
                partFixe: parseInt(partFixe),
                facteurCogerant: parseFloat(facteurCogerant),
                partRCP: parseInt(partRCP),
                partProjets: parseInt(partProjets)
            });
        } else {
            // Sinon, la mettre à jour
            await parametres.update({
                partFixe: parseInt(partFixe),
                facteurCogerant: parseFloat(facteurCogerant),
                partRCP: parseInt(partRCP),
                partProjets: parseInt(partProjets)
            });
        }

        res.json(parametres);
    } catch (error) {
        console.error('Erreur lors de la modification des paramètres:', error);
        res.status(500).json({ error: 'Erreur lors de la modification des paramètres' });
    }
});

module.exports = router;
