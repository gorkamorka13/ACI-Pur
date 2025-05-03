const express = require('express');
const router = express.Router();
const { User } = require('../../models'); // Adjust path as needed based on your models/index.js setup

// GET /api/users - Fetch all users
router.get('/', async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'email', 'username', 'avatar'] // Include username
        });
        res.json(users);
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des utilisateurs.' });
    }
});

// DELETE /api/users - Delete multiple users by IDs
router.delete('/', async (req, res) => {
    const userIds = req.body.ids; // Assuming the request body contains an array of user IDs

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: 'Veuillez fournir un tableau d\'IDs d\'utilisateurs à supprimer.' });
    }

    try {
        // Delete users
        const deleteResult = await User.destroy({
            where: {
                id: userIds
            }
        });

        if (deleteResult > 0) {
            res.json({ message: `${deleteResult} utilisateur(s) supprimé(s) avec succès.` });
        } else {
            res.status(404).json({ message: 'Aucun utilisateur trouvé avec les IDs spécifiés.' });
        }
    } catch (error) {
        console.error('Erreur lors de la suppression des utilisateurs:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la suppression des utilisateurs.' });
    }
});

module.exports = router;
