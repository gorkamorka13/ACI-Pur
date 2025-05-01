const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { Projet, Professionnel } = require('../../models'); // Import necessary models
const { Op } = require('sequelize'); // If needed for complex queries
const moment = require('moment'); // For date formatting

// Function to generate the projets report PDF
async function generateProjetsReportPDF() {
    try {
        // Options
        const options = {
            title: 'Rapport Détaillé des Projets et Missions',
            logoPath: path.join(__dirname, '../../assets/favicon.png') // Path to the logo
        };

        // 1. Fetch Data
        const projets = await Projet.findAll({
            include: [
                { model: Professionnel, as: 'Responsables' }, // Include Responsible Professional
                { model: Professionnel, as: 'Contributeurs' } // Include Contributing Professionals
            ],
            order: [['titre', 'ASC']], // Order by project title
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
                Subject: 'Rapport des Projets et Missions',
                Keywords: 'projets, missions, rapport',
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
        doc.fontSize(20).font('Helvetica-Bold').fillColor('#333333')
           .text(options.title, { align: 'center' });
        doc.moveDown(1.5);

        // Add report date (generated date)
        doc.fontSize(10).font('Helvetica').fillColor('#666666')
           .text(`Généré le : ${moment(new Date()).format('DD/MM/YYYY HH:mm:ss')}`, { align: 'center' });
        doc.moveDown(1);

        // Add summary section (e.g., total number of projects, breakdown by status)
        addSummarySection(doc, { totalProjets: projets.length });
        doc.moveDown(1);

        // Iterate through each project
        for (const projet of projets) {
            // Project Header - Explicitly set left alignment with exact coordinates
            doc.fontSize(14).font('Helvetica-Bold').fillColor('#007bff'); // Use blue for project headers
            // Set text position to the left margin (50) and use current Y position
            doc.text(`${projet.titre || 'Sans titre'} (Poids: ${projet.poids || 0})`, 50, doc.y, { 
                align: 'left',
                width: doc.page.width - 100 // Full width minus margins
            });
            doc.font('Helvetica').fillColor('#333333').moveDown(0.5); // Reset font and color

            // Project Details
            doc.fontSize(10).text(`Statut: ${projet.statut || 'N/A'}`, 50, doc.y, {
                align: 'left',
                width: doc.page.width - 100
            });
            doc.text(`Description: ${projet.description || 'Pas de description'}`, 50, doc.y, {
                align: 'left',
                width: doc.page.width - 100
            });
            doc.moveDown();

            // Responsible Professional Section
            if (projet.Responsables && projet.Responsables.length > 0) {
                doc.fontSize(12).font('Helvetica-Bold');
                doc.text('Responsable(s):', 50, doc.y, { 
                    align: 'left',
                    width: doc.page.width - 100
                });
                doc.font('Helvetica').moveDown(0.5);
                projet.Responsables.forEach(responsable => {
                    doc.fontSize(10).text(`- ${responsable.nom} (${responsable.profession || 'N/A'})`, 50, doc.y, {
                        align: 'left',
                        width: doc.page.width - 100
                    });
                });
                doc.moveDown();
            } else {
                doc.fontSize(10).font('Helvetica-Oblique').text('Aucun responsable assigné.');
                doc.font('Helvetica').moveDown();
            }

            // Contributing Professionals Section
            if (projet.Contributeurs && projet.Contributeurs.length > 0) {
                doc.fontSize(12).font('Helvetica-Bold');
                doc.text('Contributeurs:', 50, doc.y, {
                    align: 'left',
                    width: doc.page.width - 100
                });
                doc.font('Helvetica').moveDown(0.5);
                projet.Contributeurs.forEach(contributeur => {
                    doc.fontSize(10).text(`- ${contributeur.nom} (${contributeur.profession || 'N/A'})`, 50, doc.y, {
                        align: 'left', 
                        width: doc.page.width - 100
                    });
                });
                doc.moveDown();
            } else {
                doc.fontSize(10).font('Helvetica-Oblique').text('Aucun contributeur assigné.');
                doc.font('Helvetica').moveDown();
            }

            // Add a horizontal line separator between projects
            if (projets.indexOf(projet) < projets.length - 1) {
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
        console.error('Error generating projets report:', error);
        // Create a simple error PDF
        const errorDoc = new PDFDocument({ margin: 50, size: 'A4' });
        let errorBuffers = [];
        errorDoc.on('data', errorBuffers.push.bind(errorBuffers));
        errorDoc.on('end', () => {});
        errorDoc.fontSize(12).fillColor('red').text('Erreur lors de la génération du rapport des projets et missions.');
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
            ['Nombre Total de Projets', summary.totalProjets]
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
    const range = doc.bufferedPageRange(); // Get page range
    const totalPages = range.count;

    for (let i = range.start; i < range.start + totalPages; i++) {
        doc.switchToPage(i);

        // Add footer divider
        doc.lineWidth(0.5).strokeColor('#cccccc')
           .moveTo(50, doc.page.height - 50)
           .lineTo(doc.page.width - 50, doc.page.height - 50)
           .stroke();

        // Add page number
        doc.fontSize(8).fillColor('#666666').font('Helvetica')
           .text(
               `Page ${i + 1} sur ${totalPages}`,
               50,
               doc.page.height - 40,
               { align: 'center', width: doc.page.width - 100 }
           );

        // Add generation timestamp
        doc.fontSize(8).fillColor('#666666').font('Helvetica')
           .text(
               `Généré le ${moment(new Date()).format('DD/MM/YYYY HH:mm:ss')}`,
               50,
               doc.page.height - 30,
               { align: 'center', width: doc.page.width - 100 }
           );
    }
     // Ensure we switch back to the last page if needed
    if (totalPages > 0) {
        doc.switchToPage(totalPages - 1);
    }
}


module.exports = {
    generateProjetsReportPDF
};