const fs = require('fs').promises;
const path = require('path');
const { sequelize } = require('../models');
const db = require('../models');

// Chemin vers le fichier de données JSON
const DATA_FILE = path.join(__dirname, '../data.json');

async function seed() {
  try {
    console.log('Début de l\'initialisation de la base de données...');
    
    // Lecture du fichier de données
    const dataStr = await fs.readFile(DATA_FILE, 'utf8');
    const data = JSON.parse(dataStr);
    
    // Synchroniser les modèles avec la base de données (création des tables)
    await sequelize.sync({ force: true });
    console.log('Base de données synchronisée');
    
    // Importer les revenus
    if (data.revenus && data.revenus.length > 0) {
      await db.Revenu.bulkCreate(data.revenus);
      console.log(`${data.revenus.length} revenus importés`);
    }
    
    // Importer les charges
    if (data.charges && data.charges.length > 0) {
      await db.Charge.bulkCreate(data.charges);
      console.log(`${data.charges.length} charges importées`);
    }
    
    // Importer les réunions RCP
    if (data.rcpMeetings && data.rcpMeetings.length > 0) {
      await db.RcpMeeting.bulkCreate(data.rcpMeetings);
      console.log(`${data.rcpMeetings.length} réunions RCP importées`);
    }
    
    // Importer les professionnels
    if (data.professionnels && data.professionnels.length > 0) {
      const profs = data.professionnels.map(prof => ({
        nom: prof.Nom,
        profession: prof.Profession,
        email: prof.Email,
        telephone: prof.Téléphone,
        statut: prof.Statut
      }));
      await db.Professionnel.bulkCreate(profs);
      console.log(`${data.professionnels.length} professionnels importés`);
    }
    
    // Importer les projets
    if (data.projets && data.projets.length > 0) {
      await db.Projet.bulkCreate(data.projets);
      console.log(`${data.projets.length} projets importés`);
    }
    
    // Importer les paramètres de répartition
    if (data.parametresRepartition) {
      await db.ParametresRepartition.create(data.parametresRepartition);
      console.log('Paramètres de répartition importés');
    }
    
    console.log('Initialisation de la base de données terminée avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
  } finally {
    process.exit();
  }
}

// Exécuter la fonction d'initialisation
seed(); 