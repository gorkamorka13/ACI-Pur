const PDFDocument = require('pdfkit');
const { Professionnel, RcpMeeting, Projet } = require('../../models'); // Adjust path as needed
const { Op } = require('sequelize'); // If needed for complex queries
const moment = require('moment'); // For date formatting

// Function to generate the associates report PDF
async function generateAssociatesReportPDF() {
    // 1. Fetch Data
    // Fetch all Professionals with their associated Meetings and Projects
    const associates = await Professionnel.findAll({
        include: [
            { model: RcpMeeting, as: 'Meetings' },
            { model: Projet, as: 'ProjetsResponsables' },
            { model: Projet, as: 'ProjetsContributeurs' }
        ],
        order: [['nom', 'ASC']], // Order by associate name
    });

    // 2. Create PDF Document
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    // --- PDF Content Generation ---

    // Header
    doc.fontSize(18).text('Rapport Détaillé des Associés', { align: 'center' });
    doc.moveDown(2);

    // Iterate through each associate
    for (const associe of associates) {
        // Associate Header
        doc.fontSize(14).font('Helvetica-Bold').text(`${associe.nom} (${associe.profession}, ${associe.statut})`);
        doc.font('Helvetica').moveDown(0.5);

        // Meetings Section
        if (associe.Meetings && associe.Meetings.length > 0) {
            doc.fontSize(12).font('Helvetica-Bold').text('Réunions RCP Attenues:');
            doc.font('Helvetica').moveDown(0.5);
            associe.Meetings.forEach(meeting => {
                const meetingDate = moment(meeting.date).format('DD/MM/YYYY');
                doc.fontSize(10).text(`- ${meetingDate}: ${meeting.sujet || 'Pas de sujet spécifié'}`, { indent: 15 });
            });
            doc.moveDown();
        } else {
            doc.fontSize(10).font('Helvetica-Oblique').text('Aucune réunion RCP attenue enregistrée.', { indent: 15 });
            doc.font('Helvetica').moveDown();
        }

        // Projects Section
        if ((associe.ProjetsResponsables && associe.ProjetsResponsables.length > 0) || (associe.ProjetsContributeurs && associe.ProjetsContributeurs.length > 0)) {
            doc.fontSize(12).font('Helvetica-Bold').text('Projets:');
            doc.font('Helvetica').moveDown(0.5);

            if (associe.ProjetsResponsables && associe.ProjetsResponsables.length > 0) {
                doc.fontSize(11).font('Helvetica-Bold').text('Responsable de:');
                doc.font('Helvetica').moveDown(0.3);
                associe.ProjetsResponsables.forEach(projet => {
                    doc.fontSize(10).text(`- ${projet.nom} (Poids: ${projet.poids || 0}, Statut: ${projet.statut || 'N/A'})`, { indent: 15 });
                });
                doc.moveDown(0.5);
            }

            if (associe.ProjetsContributeurs && associe.ProjetsContributeurs.length > 0) {
                doc.fontSize(11).font('Helvetica-Bold').text('Contributeur à:');
                doc.font('Helvetica').moveDown(0.3);
                associe.ProjetsContributeurs.forEach(projet => {
                    doc.fontSize(10).text(`- ${projet.nom} (Poids: ${projet.poids || 0}, Statut: ${projet.statut || 'N/A'})`, { indent: 15 });
                });
                doc.moveDown(0.5);
            }
        } else {
            doc.fontSize(10).font('Helvetica-Oblique').text('Aucun projet enregistré.', { indent: 15 });
            doc.font('Helvetica').moveDown();
        }

        // Add a horizontal line separator between associates
        if (associates.indexOf(associe) < associates.length - 1) {
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
    generateAssociatesReportPDF
};
