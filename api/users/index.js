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

module.exports = router;
