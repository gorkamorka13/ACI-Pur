const express = require('express');
const router = express.Router();
const db = require('../../models');

// GET - Récupérer toutes les réunions
router.get('/', async (req, res) => {
    try {
        const options = {
            order: [['date', 'DESC']]
        };
        // Check if 'include=professionnels' query parameter is present
        if (req.query.include === 'professionnels') {
            options.include = [{ model: db.Professionnel, as: 'Professionnels' }];
        }
        const meetings = await db.RcpMeeting.findAll(options);
        res.json(meetings);
    } catch (error) {
        console.error('Erreur lors de la récupération des réunions:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des réunions' });
    }
});

// GET - Récupérer le temps total de présence RCP par professionnel
// This route must be defined BEFORE the /:id route
router.get('/presence', async (req, res) => {
    try {
        // Query to calculate total duration per professional for attended meetings
        const presenceData = await db.Professionnel.findAll({
            attributes: [
                'id',
                'Nom', // Assuming 'Nom' is the name field in Professionnel
                [db.sequelize.fn('SUM', db.sequelize.col('Meetings.duree')), 'totalPresenceMinutes'] // Sum the duration of associated meetings using the alias
            ],
            include: [{
                model: db.RcpMeeting,
                as: 'Meetings', // Use the alias defined in Professionnel model
                attributes: [], // Don't select meeting attributes
                through: { attributes: [] } // Don't select attributes from the join table
            }],
            group: ['Professionnel.id', 'Professionnel.Nom'], // Group by professional
            raw: true // Return raw data instead of model instances
        });

        // Format the data if needed (e.g., convert minutes to hours, add professional details)
        const formattedData = presenceData.map(item => ({
            id: item.id,
            nom: item.Nom,
            totalPresenceMinutes: item.totalPresenceMinutes || 0 // Ensure 0 if no meetings attended
        }));

        res.json(formattedData);
    } catch (error) {
        console.error('Erreur lors de la récupération des données de présence RCP:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des données de présence RCP' });
    }
});

// GET - Générer le rapport PDF des réunions RCP
router.get('/report/pdf', async (req, res) => {
    try {
        // Import the generateReport function
        const { generateReport } = require('./report');

        // You can pass options to generateReport based on query parameters if needed
        // const options = {
        //     startDate: req.query.startDate,
        //     endDate: req.query.endDate,
        //     title: 'Rapport Personnalisé de Réunions RCP'
        // };

        const pdfBuffer = await generateReport(); // Call the report generation function

        // Set headers for PDF response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=rcp_meetings_report.pdf');
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Erreur lors de la génération du rapport PDF des réunions RCP:', error);
        res.status(500).json({ error: 'Erreur lors de la génération du rapport PDF des réunions RCP' });
    }
});


// GET - Récupérer une réunion par ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
         const options = {};
        // Check if 'include=professionnels' query parameter is present
        if (req.query.include === 'professionnels') {
            options.include = [{ model: db.Professionnel, as: 'Professionnels' }];
        }
        const meeting = await db.RcpMeeting.findByPk(id, options);
        
        if (!meeting) {
            return res.status(404).json({ error: 'Réunion non trouvée' });
        }
        
        console.log('Backend sending meeting data:', meeting); // Log the meeting object before sending

        res.json(meeting);
    } catch (error) {
        console.error('Erreur lors de la récupération de la réunion:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de la réunion' });
    }
});

// POST - Créer une nouvelle réunion
router.post('/', async (req, res) => {
    console.log('POST /api/rcpMeetings route hit'); // Log at the very beginning
    const transaction = await db.sequelize.transaction(); // Start transaction
    try {
        // Extract attendeeIds, default to empty array if not provided
        const { date, titre, description, duree, attendeeIds = [] } = req.body; 
        
        console.log('Backend received attendeeIds:', attendeeIds); // Log received IDs

        if (!date || !titre || !duree) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Les champs date, titre et durée sont requis' });
        }

        // Validate attendeeIds is an array (even if empty)
        if (!Array.isArray(attendeeIds)) {
            await transaction.rollback();
            return res.status(400).json({ error: 'attendeeIds doit être un tableau' });
        }

        const meeting = await db.RcpMeeting.create({
            date,
            titre,
            description: description || '',
            duree: parseInt(duree)
        }, { transaction }); // Pass transaction

        // Associate attendees if IDs are provided
        if (attendeeIds.length > 0) {
            console.log(`Attempting to find ${attendeeIds.length} professionals with IDs: ${attendeeIds}`); // Log attempt to find professionals
            // Assuming the association is named 'Professionnels' and uses Professionnel model
            // Ensure Professionnel model exists and IDs are valid before setting
            const attendees = await db.Professionnel.findAll({ 
                where: { id: attendeeIds },
                transaction // Pass transaction
            });
            console.log(`Found ${attendees.length} professionals.`); // Log number of professionals found

            // Check if all provided IDs were found
            if (attendees.length !== attendeeIds.length) {
                 await transaction.rollback();
                 // Find which IDs were not found (optional, for better error message)
                 const foundIds = attendees.map(a => a.id.toString()); // Ensure comparison is consistent (string vs number)
                 const missingIds = attendeeIds.filter(id => !foundIds.includes(id.toString()));
                 return res.status(400).json({ error: `Certains IDs de participants n'ont pas été trouvés: ${missingIds.join(', ')}` });
            }
            console.log('Setting professionals for the meeting.'); // Log attempt to set professionals
            await meeting.setProfessionnels(attendees, { transaction }); // Use setProfessionnels
            console.log('Professionals set successfully.'); // Log success
        } else {
            console.log('No attendee IDs provided, skipping association.'); // Log if no IDs were provided
        }

        await transaction.commit(); // Commit transaction
        console.log('Transaction committed.'); // Log transaction commit
        
        // Fetch the meeting again with associated attendees to return
        const result = await db.RcpMeeting.findByPk(meeting.id, {
            include: [{ model: db.Professionnel, as: 'Professionnels' }] // Include associated professionals using the alias
        });
        console.log('Meeting created and professionals associated:', result); // Log the final result

        res.status(201).json(result);
    } catch (error) {
        // Only rollback if the transaction hasn't been committed yet
        if (transaction.finished !== 'commit') {
             await transaction.rollback(); 
        }
        console.error('Erreur lors de la création de la réunion:', error);
        res.status(500).json({ error: 'Erreur lors de la création de la réunion' });
    }
});

// PUT - Modifier une réunion existante
router.put('/:id', async (req, res) => {
    const transaction = await db.sequelize.transaction(); // Start transaction
    try {
        const { id } = req.params;
        // Extract attendeeIds, default to empty array if not provided
        const { date, titre, description, duree, attendeeIds = [] } = req.body; 

        if (!date || !titre || !duree) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Les champs date, titre et durée sont requis' });
        }

        // Validate attendeeIds is an array (even if empty)
        if (!Array.isArray(attendeeIds)) {
            await transaction.rollback();
            return res.status(400).json({ error: 'attendeeIds doit être un tableau' });
        }

        const meeting = await db.RcpMeeting.findByPk(id, { transaction }); // Find within transaction
        
        if (!meeting) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Réunion non trouvée' });
        }

        // Update basic fields
        await meeting.update({
            date,
            titre,
            description: description || '',
            duree: parseInt(duree)
        }, { transaction }); // Pass transaction

        // Update associated attendees
        // Ensure Professionnel model exists and IDs are valid before setting
        const attendees = await db.Professionnel.findAll({ 
            where: { id: attendeeIds },
            transaction // Pass transaction
        });
        // Check if all provided IDs were found
        if (attendees.length !== attendeeIds.length) {
             await transaction.rollback();
             const foundIds = attendees.map(a => a.id.toString());
             const missingIds = attendeeIds.filter(id => !foundIds.includes(id.toString()));
             return res.status(400).json({ error: `Certains IDs de participants n'ont pas été trouvés: ${missingIds.join(', ')}` });
        }
        await meeting.setProfessionnels(attendees, { transaction }); // Use setProfessionnels to overwrite

        await transaction.commit(); // Commit transaction

        // Fetch the updated meeting with attendees to return
        const result = await db.RcpMeeting.findByPk(meeting.id, {
            include: [{ model: db.Professionnel, as: 'Professionnels' }] // Include associated professionals using the alias
        });

        res.json(result);
    } catch (error) {
        // Only rollback if the transaction hasn't been committed yet
        if (transaction.finished !== 'commit') {
             await transaction.rollback(); 
        }
        console.error('Erreur lors de la modification de la réunion:', error);
        res.status(500).json({ error: 'Erreur lors de la modification de la réunion' });
    }
});

// DELETE - Supprimer une réunion
router.delete('/:id', async (req, res) => {
    const transaction = await db.sequelize.transaction(); // Start transaction
    try {
        const { id } = req.params;
        const meeting = await db.RcpMeeting.findByPk(id, { transaction }); // Find within transaction
        
        if (!meeting) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Réunion non trouvée' });
        }

        // Associations in the join table are typically handled by CASCADE delete
        // or need to be removed manually before destroying the meeting if not cascaded.
        // Assuming cascade or manual removal is handled elsewhere or not needed for this step.
        // If using setProfessionnels([]) before destroy is needed:
        // await meeting.setProfessionnels([], { transaction }); 

        await meeting.destroy({ transaction }); // Pass transaction
        
        await transaction.commit(); // Commit transaction
        res.status(204).send();
    } catch (error) {
        await transaction.rollback(); // Rollback on any error
        console.error('Erreur lors de la suppression de la réunion:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression de la réunion' });
    }
});


module.exports = router;
