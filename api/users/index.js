const express = require('express');
const router = express.Router();
const { User } = require('../../models'); // Adjust path as needed based on your models/index.js setup
const fs = require('fs').promises; // Use promises version of fs
const path = require('path');

// Define the base directory for avatars relative to the project root
const avatarsBaseDir = path.join(__dirname, '..', '..', 'images'); // Assuming images folder is at project root
const defaultAvatarPath = 'images/default_avatar.png'; // Path as stored in the database

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
        // 1. Fetch users to get avatar paths
        const usersToDelete = await User.findAll({
            where: {
                id: userIds
            },
            attributes: ['id', 'avatar'] // Only need id and avatar path
        });

        // 2. Delete associated avatar files
        for (const user of usersToDelete) {
            // Check if the user has a custom avatar and it's not the default one
            if (user.avatar && user.avatar !== defaultAvatarPath) {
                const avatarFilePath = path.join(__dirname, '..', '..', user.avatar); // Construct full path

                try {
                    // Check if file exists before attempting to delete
                    await fs.access(avatarFilePath);
                    await fs.unlink(avatarFilePath);
                    console.log(`Deleted avatar file: ${avatarFilePath}`);
                } catch (fileError) {
                    // Log error but continue with user deletion if file doesn't exist or can't be deleted
                    if (fileError.code === 'ENOENT') {
                        console.warn(`Avatar file not found for user ID ${user.id}: ${avatarFilePath}`);
                    } else {
                        console.error(`Error deleting avatar file for user ID ${user.id} (${avatarFilePath}):`, fileError);
                    }
                }
            }
        }

        // 3. Delete users from the database
        const deleteResult = await User.destroy({
            where: {
                id: userIds
            }
        });

        if (deleteResult > 0) {
            res.json({ message: `${deleteResult} utilisateur(s) supprimé(s) avec succès.` });
        } else {
            // This case might happen if users were already deleted between fetching and destroying
            res.status(404).json({ message: 'Aucun utilisateur trouvé avec les IDs spécifiés pour la suppression.' });
        }
    } catch (error) {
        console.error('Erreur lors de la suppression des utilisateurs et de leurs avatars:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la suppression des utilisateurs.' });
    }
});

module.exports = router;
