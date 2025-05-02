const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { Professionnel, RcpMeeting, Projet } = require('../../models'); // Adjust path as needed
const { Op } = require('sequelize'); // If needed for complex queries
const moment = require('moment'); // For date formatting

// Function to generate the associates report PDF
async function generateAssociatesReportPDF() {
    try {
        // Options
        const options = {
            title: 'Rapport Détaillé des Associés',
            logoPath: path.join(__dirname, '../../assets/favicon.png') // Path to the logo
        };

        // 1. Fetch Data
        const associates = await Professionnel.findAll({
            include: [
                { model: RcpMeeting, as: 'Meetings' },
                { model: Projet, as: 'ProjetsResponsables' },
                { model: Projet, as: 'ProjetsContributeurs' }
            ],
            order: [['nom', 'ASC']], // Order by associate name
        });

        // 2. Create PDF Document
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50,
            autoFirstPage: true,
            bufferPages: true, // Important for correct page numbering
            info: {
                Title: options.title,
                Author: 'Système de Gestion MSP',
                Subject: 'Rapport des Associés',
                Keywords: 'associés, rapport',
                CreationDate: new Date()
            }
        });
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {});

        // --- PDF Content Generation ---

        // Add logo if provided
        if (options.logoPath) {
            try {
                const absoluteLogoPath = path.isAbsolute(options.logoPath)
                    ? options.logoPath
                    : path.join(__dirname, '../../', options.logoPath);

                if (fs.existsSync(absoluteLogoPath)) {
                    doc.image(absoluteLogoPath, 50, 45, { width: 50 });
                    doc.moveDown();
                    console.log(`Logo chargé depuis ${absoluteLogoPath}`);
                } else {
                    console.warn(`Logo introuvable: ${absoluteLogoPath}`);
                }
            } catch (logoError) {
                console.warn(`Impossible de charger le logo: ${logoError.message}`);
            }
        }

        // Add report header
        doc.fontSize(24).font('Helvetica-Bold').fillColor('#333333')
           .text(options.title, { align: 'center' });
        doc.moveDown(0.5);

        // Add report date (generated date)
        doc.fontSize(10).font('Helvetica').fillColor('#666666')
           .text(`Généré le : ${moment(new Date()).format('DD/MM/YYYY HH:mm:ss')}`, { align: 'center' });
        doc.moveDown(1);

        // Add summary section
        addSummarySection(doc, { totalAssociates: associates.length });
        doc.moveDown(1);

        // Iterate through each associate
        for (const associe of associates) {
            // Associate Header - Explicitly set left alignment with exact coordinates
            doc.fontSize(14).font('Helvetica-Bold').fillColor('#007bff'); // Use blue for associate headers
            doc.text(`${associe.nom} (${associe.profession || 'N/A'}, ${associe.statut || 'N/A'})`, 50, doc.y, {
                align: 'left',
                width: doc.page.width - 100
            });
            doc.font('Helvetica').fillColor('#333333').moveDown(0.5); // Reset font and color

            // Meetings Section
            if (associe.Meetings && associe.Meetings.length > 0) {
                doc.fontSize(12).font('Helvetica-Bold');
                doc.text('Réunions RCP Attenues:', 50, doc.y, {
                    align: 'left',
                    width: doc.page.width - 100
                });
                doc.font('Helvetica').moveDown(0.5);
                associe.Meetings.forEach(meeting => {
                    const meetingDate = moment(meeting.date).format('DD/MM/YYYY');
                    doc.fontSize(10).text(`- ${meetingDate}: ${meeting.sujet || 'Pas de sujet spécifié'}`, 50, doc.y, {
                        align: 'left',
                        width: doc.page.width - 100
                    });
                });
                doc.moveDown();
            } else {
                doc.fontSize(10).font('Helvetica-Oblique').fillColor('#666666')
                   .text('Aucune réunion RCP attenue enregistrée.', 50, doc.y, {
                       align: 'left',
                       width: doc.page.width - 100
                   });
                doc.font('Helvetica').fillColor('#333333').moveDown(); // Reset font and color
            }

            // Projects Section
            if ((associe.ProjetsResponsables && associe.ProjetsResponsables.length > 0) || (associe.ProjetsContributeurs && associe.ProjetsContributeurs.length > 0)) {
                doc.fontSize(12).font('Helvetica-Bold');
                doc.text('Projets:', 50, doc.y, {
                    align: 'left',
                    width: doc.page.width - 100
                });
                doc.font('Helvetica').moveDown(0.5);

                if (associe.ProjetsResponsables && associe.ProjetsResponsables.length > 0) {
                    doc.fontSize(11).font('Helvetica-Bold');
                    doc.text('Responsable de:', 50, doc.y, {
                        align: 'left',
                        width: doc.page.width - 100
                    });
                    doc.font('Helvetica').moveDown(0.3);
                    associe.ProjetsResponsables.forEach(projet => {
                        doc.fontSize(10).text(`- ${projet.titre || 'Sans titre'} (Poids: ${projet.poids || 0}, Statut: ${projet.statut || 'N/A'})`, 50, doc.y, {
                            align: 'left',
                            width: doc.page.width - 100
                        });
                    });
                    doc.moveDown(0.5);
                }

                if (associe.ProjetsContributeurs && associe.ProjetsContributeurs.length > 0) {
                    doc.fontSize(11).font('Helvetica-Bold');
                    doc.text('Contributeur à:', 50, doc.y, {
                        align: 'left',
                        width: doc.page.width - 100
                    });
                    doc.font('Helvetica').moveDown(0.3);
                    associe.ProjetsContributeurs.forEach(projet => {
                        doc.fontSize(10).text(`- ${projet.titre || 'Sans titre'} (Poids: ${projet.poids || 0}, Statut: ${projet.statut || 'N/A'})`, 50, doc.y, {
                            align: 'left',
                            width: doc.page.width - 100
                        });
                    });
                    doc.moveDown(0.5);
                }
            } else {
                doc.fontSize(10).font('Helvetica-Oblique').fillColor('#666666')
                   .text('Aucun projet enregistré.', 50, doc.y, {
                       align: 'left',
                       width: doc.page.width - 100
                   });
                doc.font('Helvetica').fillColor('#333333').moveDown(); // Reset font and color
            }

            // Add a horizontal line separator between associates
            if (associates.indexOf(associe) < associates.length - 1) {
                doc.strokeColor("#cccccc").lineWidth(0.5).moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
                doc.moveDown();
            }
        }

        // --- End PDF Content ---

        // Add footer with page numbers
        addFooter(doc);

        doc.end();

        // Wait for PDF generation to complete
        await new Promise(resolve => doc.on('end', resolve));

        // 3. Return Buffer
        return Buffer.concat(buffers);

    } catch (error) {
        console.error('Error generating associates report:', error);
        // Create a simple error PDF
        const errorDoc = new PDFDocument({ margin: 50, size: 'A4' });
        let errorBuffers = [];
        errorDoc.on('data', errorBuffers.push.bind(errorBuffers));
        errorDoc.on('end', () => {});
        errorDoc.fontSize(12).fillColor('red').text('Erreur lors de la génération du rapport des associés.');
        errorDoc.moveDown();
        errorDoc.fontSize(10).fillColor('black').text(error.message || 'Une erreur inconnue est survenue.');
        if (error.stack) {
            errorDoc.moveDown();
            errorDoc.fontSize(8).text(error.stack);
        }
        errorDoc.end();
        await new Promise(resolve => errorDoc.on('end', resolve));
        return Buffer.concat(errorBuffers);
    }
}

/**
 * Adds summary section to the report
 */
function addSummarySection(doc, summary) {
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#333333')
       .text('Résumé', 50, doc.y, { 
           underline: true, 
           align: 'left',
           width: doc.page.width - 100
        });
    doc.moveDown(0.5);

    const summaryTable = {
        headers: ['Métrique', 'Valeur'],
        rows: [
            ['Nombre Total d\'Associés', summary.totalAssociates]
        ]
    };

    // Table styling
    const startY = doc.y;
    const startX = 100;
    const columnWidths = [200, 100];
    const rowHeight = 25;

    // Draw summary table
    doc.font('Helvetica');
    summaryTable.rows.forEach((row, i) => {
        const y = startY + i * rowHeight;

        // Draw background for alternate rows
        if (i % 2 === 0) {
            doc.rect(startX, y, columnWidths[0] + columnWidths[1], rowHeight)
               .fill('#f5f5f5').fillColor('#333333');
        } else {
             doc.rect(startX, y, columnWidths[0] + columnWidths[1], rowHeight)
               .fill('#ffffff').fillColor('#333333');
        }

        // Draw cells
        doc.fontSize(10).font('Helvetica-Bold')
           .text(row[0], startX + 5, y + 7, { width: columnWidths[0] - 10 });

        doc.fontSize(10).font('Helvetica')
           .text(row[1], startX + columnWidths[0] + 5, y + 7, { width: columnWidths[1] - 10 });
    });

    // Draw borders
    doc.lineWidth(0.5).strokeColor('#cccccc')
       .rect(startX, startY, columnWidths[0] + columnWidths[1], rowHeight * summaryTable.rows.length)
       .stroke();

    // Move cursor to after the table
    doc.y = startY + rowHeight * summaryTable.rows.length + 20; // Update Y position
}


/**
 * Adds footer with page numbers to the document
 */
function addFooter(doc) {
    const range = doc.bufferedPageRange(); // Get the range of buffered pages
    for (let i = range.start; i < range.count; i++) {
        doc.switchToPage(i);

        // Add page number at the bottom center
        const oldBottomMargin = doc.page.margins.bottom;
        doc.page.margins.bottom = 0 // Allow drawing near the bottom
        doc.fontSize(8).fillColor('#666666').text(
            `Page ${i + 1} sur ${range.count}`,
            0, // x position (0 for full width)
            doc.page.height - 30, // y position (near bottom)
            {
                align: 'center',
                width: doc.page.width // Use full page width for centering
            }
        );
        doc.page.margins.bottom = oldBottomMargin; // Restore the bottom margin
    }
}


module.exports = {
    generateAssociatesReportPDF
};