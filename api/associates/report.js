const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { dataService } = require('../../js/services/DataService'); // Assuming DataService is accessible like this

/**
 * Génère un rapport des associés au format PDF
 * @param {Object} options - Options de configuration du rapport
 * @param {String} options.title - Titre du rapport (par défaut: 'Rapport des Associés')
 * @param {String} options.outputPath - Chemin pour sauvegarder le rapport (optionnel)
 * @param {String} options.baseUrl - Base URL for API calls (required when running on server)
 * @param {String} options.token - Authentication token (required when running on server)
 * @returns {Promise<Buffer>} Document PDF sous forme de buffer
 */
async function generateReport(options = {}) {
    console.log('generateReport function started');
    try {
        // Options par défaut
        const {
            title = 'Rapport des Associés',
            outputPath,
            logoPath = path.join(__dirname, '../../assets/favicon.png'), // Chemin absolu depuis la racine du projet
            baseUrl, // Destructure baseUrl from options
            token // Destructure token from options
        } = options;

        // Fetch data using DataService
        let data;
        let associates;
        try {
            // Pass baseUrl and token to loadAllData if they exist
            data = await dataService.loadAllData(baseUrl, token);
            console.log('Data loaded by DataService:', JSON.stringify(data, null, 2)); // Log the loaded data

            // Access the list of associates from the 'professionnels' property
            associates = data.professionnels;
            console.log('Associates list:', JSON.stringify(associates, null, 2)); // Log the associates list
        } catch (dataError) {
            console.error('Error fetching or processing data:', dataError);
            throw new Error(`Failed to load or process associate data: ${dataError.message}`);
        }

        if (!associates || !Array.isArray(associates) || associates.length === 0) {
            throw new Error('Aucune donnée d\'associé trouvée ou format inattendu');
        }

        console.log('Data processing successful, starting PDF generation');

        // Calculate summary data
        const totalAssociates = associates.length;
        const activeAssociates = associates.filter(a => a.actif).length;
        const inactiveAssociates = totalAssociates - activeAssociates;

        // Group by profession
        const professionSummary = {};
        associates.forEach(associe => {
            const profession = associe.profession || 'Non spécifié';
            if (!professionSummary[profession]) {
                professionSummary[profession] = 0;
            }
            professionSummary[profession]++;
        });

        // Create a new PDF document
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50,
            autoFirstPage: true,
            bufferPages: true, // Important for correct page numbering
            info: {
                Title: title,
                Author: 'Système de Gestion MSP',
                Subject: 'Rapport des Associés',
                Keywords: 'associés, rapport',
                CreationDate: new Date()
            }
        });

        // If outputPath is provided, pipe the PDF to a file
        if (outputPath) {
            const outputDir = path.dirname(outputPath);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            doc.pipe(fs.createWriteStream(outputPath));
        }

        // Add logo if provided
        if (logoPath) {
            try {
                // Vérifier si le chemin est absolu ou relatif
                const absoluteLogoPath = path.isAbsolute(logoPath)
                    ? logoPath
                    : path.join(__dirname, '../../', logoPath);

                if (fs.existsSync(absoluteLogoPath)) {
                    doc.image(absoluteLogoPath, 50, 45, { width: 50 });
                    doc.moveDown();
                    console.log(`Logo chargé depuis ${absoluteLogoPath}`);
                } else {
                    console.warn(`Logo introuvable: ${absoluteLogoPath}`);
                }
            } catch (logoError) {
                console.warn(`Impossible de charger le logo: ${logoError.message}`);
                // Continue without the logo
            }
        }

        // Add report header
        doc.fontSize(24).font('Helvetica-Bold').fillColor('#333333')
           .text(title, { align: 'center' });
        doc.moveDown(0.5);

        // Add report date
        doc.fontSize(10).font('Helvetica').fillColor('#666666')
           .text(`Généré le : ${formatDate(new Date())}`, { align: 'center' });
        doc.moveDown(1);

        // Add summary section
        addSummarySection(doc, {
            totalAssociates,
            activeAssociates,
            inactiveAssociates,
            professionSummary
        });
        doc.moveDown(1);

        // Add associates table
        addAssociatesTable(doc, associates);
        doc.moveDown(1.5);

        // Add footer with page numbers - moved to the end after all content
        addFooter(doc);

        // Finalize the PDF
        doc.end();

        // Get the PDF buffer
        return new Promise((resolve, reject) => {
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                console.log(`Rapport PDF généré avec succès ${outputPath ? `et enregistré à ${outputPath}` : ''}`);
                resolve(pdfBuffer);
            });
            doc.on('error', reject);
        });
    } catch (error) {
        console.error('Error caught in main catch block:', error);
        console.error('Error generating PDF report:', error);
        throw new Error(`Échec de la génération du rapport des associés: ${error.message}`);
    }
}

/**
 * Adds summary section to the report
 */
function addSummarySection(doc, summary) {
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#333333')
       .text('Résumé', { underline: true });
    doc.moveDown(0.5);

    const summaryTable = {
        headers: ['Métrique', 'Valeur'],
        rows: [
            ['Nombre Total d\'Associés', summary.totalAssociates],
            ['Associés Actifs', summary.activeAssociates],
            ['Associés Inactifs', summary.inactiveAssociates]
        ]
    };

    // Add profession breakdown to summary table
    Object.entries(summary.professionSummary)
        .sort((a, b) => b[1] - a[1]) // Sort by count descending
        .forEach(([profession, count]) => {
            summaryTable.rows.push([`Par Profession (${profession})`, count]);
        });


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
        }

        // Draw cells
        doc.fontSize(10).font('Helvetica-Bold')
           .text(row[0], startX + 5, y + 7, { width: columnWidths[0] - 10 });

        doc.fontSize(10).font('Helvetica')
           .text(row[1].toString(), startX + columnWidths[0] + 5, y + 7, { width: columnWidths[1] - 10 });
    });

    // Move cursor to after the table
    doc.moveDown(summaryTable.rows.length * 0.75);
}

/**
 * Adds the main associates data table to the report
 */
function addAssociatesTable(doc, associates) {
    // Add title
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#333333')
       .text('Détails des Associés', { underline: true });
    doc.moveDown(0.5);

    // Define table
    const table = {
        headers: ['ID', 'Nom', 'Profession', 'Statut', 'Date Adhésion'],
        rows: associates.map(associe => [
            associe.id,
            associe.nom,
            associe.profession || 'Non spécifié',
            associe.actif ? 'Actif' : 'Inactif',
            formatDate(associe.date_adhesion)
        ])
    };

    // Table styling
    const tableTop = doc.y;
    const tableLeft = 50;
    const columnWidths = [80, 150, 120, 80, 80]; // Adjusted widths
    const rowHeight = 25;
    const headerHeight = 30;
    const pageHeight = doc.page.height - 150; // Leave space for footer

    // Add table headers
    doc.font('Helvetica-Bold').fillColor('#ffffff');
    doc.rect(tableLeft, tableTop, columnWidths.reduce((sum, w) => sum + w, 0), headerHeight)
       .fill('#007bff');

    let xPos = tableLeft;
    table.headers.forEach((header, i) => {
        doc.fillColor('#ffffff')
           .text(header, xPos + 5, tableTop + 10, { width: columnWidths[i] - 10 });
        xPos += columnWidths[i];
    });

    // Add table rows with pagination
    doc.font('Helvetica').fillColor('#333333');
    let currentY = tableTop + headerHeight;

    table.rows.forEach((row, rowIndex) => {
        // Check if we need a new page
        if (currentY + rowHeight > pageHeight) {
            doc.addPage();
            currentY = 50; // Reset Y position on new page

            // Add headers on new page
            doc.font('Helvetica-Bold').fillColor('#ffffff');
            doc.rect(tableLeft, currentY, columnWidths.reduce((sum, w) => sum + w, 0), headerHeight)
               .fill('#007bff');

            xPos = tableLeft;
            table.headers.forEach((header, i) => {
                doc.fillColor('#ffffff')
                   .text(header, xPos + 5, currentY + 10, { width: columnWidths[i] - 10 });
                xPos += columnWidths[i];
            });

            currentY += headerHeight;
            doc.fillColor('#333333');
        }

        // Draw row background
        const rowColor = rowIndex % 2 === 0 ? '#f9f9f9' : '#ffffff';
        doc.rect(tableLeft, currentY, columnWidths.reduce((sum, w) => sum + w, 0), rowHeight)
           .fill(rowColor).fillColor('#333333');

        // Draw row data
        xPos = tableLeft;
        row.forEach((cell, cellIndex) => {
            const align = 'left'; // Align all columns left for associate details
            const cellPadding = 5;

            doc.font('Helvetica') // Use Helvetica for all cells
               .fontSize(9)
               .text(
                   cell,
                   xPos + cellPadding,
                   currentY + 8,
                   {
                       width: columnWidths[cellIndex] - (cellPadding * 2),
                       align: align,
                       ellipsis: true
                   }
               );
            xPos += columnWidths[cellIndex];
        });

        currentY += rowHeight;
    });

    // Draw table borders
    doc.lineWidth(0.5).strokeColor('#cccccc');
    doc.rect(
        tableLeft,
        tableTop,
        columnWidths.reduce((sum, w) => sum + w, 0),
        headerHeight + (Math.min(table.rows.length, Math.floor((pageHeight - tableTop) / rowHeight)) * rowHeight)
    ).stroke();

    // Update Y position
    doc.y = currentY + 20;
}

/**
 * Adds footer with page numbers to the document
 */
function addFooter(doc) {
    // Get the total page count
    const totalPages = doc.bufferedPageRange().count;

    // Add footer to each page
    for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);

        // Add footer divider
        doc.lineWidth(0.5).strokeColor('#cccccc')
           .moveTo(50, doc.page.height - 50)
           .lineTo(doc.page.width - 50, doc.page.height - 50)
           .stroke();

        // Add page number - now with correct total page count
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
               `Généré le ${formatDate(new Date(), true)}`,
               50,
               doc.page.height - 30,
               { align: 'center', width: doc.page.width - 100 }
           );
    }

    // Return to the last page to continue
    doc.switchToPage(totalPages - 1);
}

/**
 * Formats a date for display in French format
 */
function formatDate(date, includeTime = false) {
    if (!date) return 'N/A';

    const momentDate = moment(date);
    return includeTime
        ? momentDate.format('DD/MM/YYYY HH:mm:ss')
        : momentDate.format('DD/MM/YYYY');
}

// No currency formatting needed for this report, but keeping the function structure
function formatCurrency(value) {
     if (value === null || value === undefined) return 'N/A';

     let cleanValue = value;
     if (typeof value === 'string') {
         cleanValue = value.replace(/[^\d.,]/g, '');
         cleanValue = cleanValue.replace(',', '.');
     }

     const numValue = parseFloat(cleanValue);

     if (isNaN(numValue)) return 'N/A';

     try {
         const parts = numValue.toFixed(2).split('.');
         const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
         const decimalPart = parts[1];

         return `${integerPart},${decimalPart} €`;
     } catch (e) {
         console.error('Erreur de formatage de la valeur monétaire:', e);
         return `${numValue.toFixed(2).replace('.', ',')} €`;
     }
 }


module.exports = { generateReport };
