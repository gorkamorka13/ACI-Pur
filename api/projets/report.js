const PDFDocument = require('pdfkit');
const { Projet, Professionnel } = require('../../models'); // Import necessary models
const { Op } = require('sequelize'); // If needed for complex queries
const moment = require('moment'); // For date formatting

// Function to generate the projets report PDF
async function generateProjetsReportPDF() {
    // 1. Fetch Data
    // TODO: Implement logic to fetch all Projets with their associated Responsible and Contributing Professionals
    const projets = await Projet.findAll({
        include: [
            { model: Professionnel, as: 'Responsables' }, // Include Responsible Professional
            { model: Professionnel, as: 'Contributeurs' } // Include Contributing Professionals
        ],
        order: [['titre', 'ASC']], // Order by project name
    });

    // 2. Create PDF Document
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    // --- PDF Content Generation ---

    // Header
    doc.fontSize(18).text('Rapport Détaillé des Projets et Missions', { align: 'center' });
    doc.moveDown(2);

    // Iterate through each project
    for (const projet of projets) {
        // Project Header
        doc.fontSize(14).font('Helvetica-Bold').text(`${projet.nom} (Poids: ${projet.poids || 0})`);
        doc.font('Helvetica').moveDown(0.5);

        // Project Details
        doc.fontSize(10).text(`Statut: ${projet.statut || 'N/A'}`, { indent: 15 });
        doc.text(`Description: ${projet.description || 'Pas de description'}`, { indent: 15 });
        doc.moveDown();

        // Responsible Professional Section
        if (projet.Responsables && projet.Responsables.length > 0) {
            doc.fontSize(12).font('Helvetica-Bold').text('Responsable(s):');
            doc.font('Helvetica').moveDown(0.5);
            projet.Responsables.forEach(responsable => {
                doc.fontSize(10).text(`- ${responsable.nom} (${responsable.profession || 'N/A'})`, { indent: 15 });
            });
            doc.moveDown();
        } else {
            doc.fontSize(10).font('Helvetica-Oblique').text('Aucun responsable assigné.', { indent: 15 });
            doc.font('Helvetica').moveDown();
        }

        // Contributing Professionals Section
        if (projet.Contributeurs && projet.Contributeurs.length > 0) {
            doc.fontSize(12).font('Helvetica-Bold').text('Contributeurs:');
            doc.font('Helvetica').moveDown(0.5);
            projet.Contributeurs.forEach(contributeur => {
                doc.fontSize(10).text(`- ${contributeur.nom} (${contributeur.profession || 'N/A'})`, { indent: 15 });
            });
            doc.moveDown();
        } else {
            doc.fontSize(10).font('Helvetica-Oblique').text('Aucun contributeur assigné.', { indent: 15 });
            doc.font('Helvetica').moveDown();
        }

        // Add a horizontal line separator between projects
        if (projets.indexOf(projet) < projets.length - 1) {
            doc.strokeColor("#cccccc").lineWidth(0.5).moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
            doc.moveDown();
        }
    }

    // --- End PDF Content ---

    doc.end();

    // Wait for PDF generation to complete
    await new Promise(resolve => doc.on('end', resolve));

    // 3. Return Buffer
    return Buffer.concat(buffers);
}

module.exports = {
    generateProjetsReportPDF
};
