const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { RcpMeeting } = require('../../models'); // Adjust the path to your models
const moment = require('moment');

/**
 * Génère un rapport de réunions RCP au format PDF
 * @param {Object} options - Options de configuration du rapport
 * @param {String} options.title - Titre du rapport (par défaut: 'Rapport de Réunions RCP')
 * @param {Date} options.startDate - Filtrer les réunions à partir de cette date
 * @param {Date} options.endDate - Filtrer les réunions jusqu'à cette date
 * @param {String} options.outputPath - Chemin pour sauvegarder le rapport (optionnel)
 * @param {Boolean} options.includeCharts - Inclure des graphiques visuels (par défaut: true)
 * @returns {Promise<Buffer>} Document PDF sous forme de buffer
 */
async function generateReport(options = {}) {
    try {
        // Options par défaut
        const {
            title = 'Rapport de Réunions RCP',
            startDate,
            endDate,
            outputPath,
            includeCharts = true,
            logoPath = path.join(__dirname, '../../assets/favicon.png') // Chemin absolu depuis la racine du projet
        } = options;

        // Build query options
        const queryOptions = {};
        if (startDate || endDate) {
            queryOptions.where = {};

            if (startDate) {
                queryOptions.where.date = { ...queryOptions.where.date, $gte: startDate };
            }

            if (endDate) {
                queryOptions.where.date = { ...queryOptions.where.date, $lte: endDate };
            }
        }

        // Fetch data using Sequelize
        const rcpMeetings = await RcpMeeting.findAll(queryOptions);
        // Log the fetched rcpMeetings for debugging
        console.log('RCP Meetings fetched:', rcpMeetings.length, 'records found.');
        console.log('Query options:', queryOptions); // Log the query options for debugging
        console.log('Start date:', startDate, 'End date:', endDate); // Log the dates for debugging
        console.log('rcpMeetings:', rcpMeetings);

        if (!rcpMeetings || rcpMeetings.length === 0) {
            throw new Error('Aucune donnée de réunion RCP trouvée pour la période spécifiée');
        }

        // Calculate summary data (Adapt this for RCP meetings)
        // Example: Count meetings, average duration, etc.
        const totalMeetings = rcpMeetings.length;
        // Assuming RcpMeeting model has a 'duration' field (in minutes)
        const totalDuration = rcpMeetings.reduce((sum, meeting) => sum + parseFloat(meeting.duree || 0), 0);
        const averageDuration = totalMeetings > 0 ? totalDuration / totalMeetings : 0;
        const mostRecentDate = new Date(Math.max(...rcpMeetings.map(meeting => new Date(meeting.date))));
        const oldestDate = new Date(Math.min(...rcpMeetings.map(meeting => new Date(meeting.date))));


        // Group by categories if category field exists (Adapt this for RCP meetings if needed)
        // Example: Group by topic or attendees
        const topicSummary = {};
        rcpMeetings.forEach(meeting => {
            const topic = meeting.titre || 'Non spécifié';
            if (!topicSummary[topic]) {
                topicSummary[topic] = 0;
            }
            topicSummary[topic]++; // Count meetings per topic
        });


        // Create a new PDF document
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50,
            autoFirstPage: true,
            bufferPages: true, // Important for correct page numbering
            info: {
                Title: title,
                Author: 'Système de Gestion des Réunions RCP',
                Subject: 'Rapport de Réunions RCP',
                Keywords: 'RCP, réunion, rapport',
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

        // Add report date range
        const reportDateStr = startDate && endDate
            ? `Période : ${formatDate(startDate)} au ${formatDate(endDate)}`
            : `Généré le : ${formatDate(new Date())}`;

        doc.fontSize(10).font('Helvetica').fillColor('#666666')
           .text(reportDateStr, { align: 'center' });
        doc.moveDown(1);

        // Add summary section (Adapt this for RCP meetings)
        addSummarySection(doc, {
            totalMeetings,
            totalDuration,
            averageDuration,
            dateRange: `${formatDate(oldestDate)} - ${formatDate(mostRecentDate)}`
        });
        doc.moveDown(1);

        // Add RCP Meeting table (Adapt this for RCP meetings)
        addRcpMeetingTable(doc, rcpMeetings);
        doc.moveDown(1.5);

        // Add topic breakdown if we have topics (Adapt this for RCP meetings if needed)
        if (Object.keys(topicSummary).length > 1) {
            addTopicBreakdown(doc, topicSummary);
            doc.moveDown(1.5);
        }

        // Add charts at the end if includeCharts is true (Adapt or remove charts)
        if (includeCharts) {
            // Add new page for charts to ensure they have enough space
            doc.addPage();

            // Adapt or remove charts based on RCP meeting data
            // Example: Bar chart for meetings per topic
             if (Object.keys(topicSummary).length > 1) {
                 addTopicBarChart(doc, topicSummary);
                 console.log('Graphique des réunions par sujet ajouté.');
                 doc.moveDown(2);
             }

            // Example: Pie chart for duration distribution (if applicable)
            // addDurationPieChart(doc, rcpMeetings);
            // console.log('Graphique de la répartition de la durée ajouté.');
            // doc.moveDown(1.5);
        }

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
        console.error('Error generating PDF report:', error);
        throw new Error(`Échec de la génération du rapport de réunions RCP: ${error.message}`);
    }
}

/**
 * Adds summary section to the report (Adapt this for RCP meetings)
 */
function addSummarySection(doc, summary) {
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#333333')
       .text('Résumé', { underline: true });
    doc.moveDown(0.5);

    const summaryTable = {
        headers: ['Métrique', 'Valeur'],
        rows: [
            ['Nombre Total de Réunions', summary.totalMeetings],
            ['Durée Totale (minutes)', summary.totalDuration.toFixed(2)],
            ['Durée Moyenne (minutes)', summary.averageDuration.toFixed(2)],
            ['Période', summary.dateRange]
        ]
    };

    // Table styling
    const startY = doc.y;
    const startX = 100;
    const columnWidths = [200, 100]; // Adjusted column widths
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
           .text(row[1], startX + columnWidths[0] + 5, y + 7, { width: columnWidths[1] - 10 });
    });

    // Move cursor to after the table
    doc.moveDown(summaryTable.rows.length * 0.75);
}

/**
 * Adds the main RCP Meeting data table to the report (Adapt this for RCP meetings)
 */
function addRcpMeetingTable(doc, rcpMeetings) {
    // Reset position to left margin
    doc.x = 50;
    // Add title
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#333333')
       .text('Détails des Réunions RCP', {
           underline: true,
           align: 'center',
           width: doc.page.width - 100 // Ensures we have the full width to center within
       });
    doc.moveDown(0.5);

    // Define table
    const table = {
        headers: ['Date', 'Titre',  'Durée'],
        rows: rcpMeetings.map(meeting => [
            formatDateDay(meeting.date, true),
            meeting.titre,
            meeting.duree || 'N/A'
        ])
    };

    // Table styling
    const tableTop = doc.y;
    const columnWidths = [100, 180, 80]; // Adjusted column widths
    const tableWidth = columnWidths.reduce((sum, w) => sum + w, 0);
    const tableLeft = (doc.page.width - tableWidth) / 2; // Center the table
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
            const align = cellIndex === row.length - 1 ? 'right' : 'left'; // Align duration to the right
            const cellPadding = align === 'right' ? 15 : 5;

            doc.font(cellIndex === 0 ? 'Helvetica' : 'Helvetica') // Keep date as Helvetica
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
 * Adds topic breakdown section to the report (Adapt this for RCP meetings)
 */
function addTopicBreakdown(doc, topicSummary) {
    // Reset position to left margin
    doc.x = 50;
    // Add section title
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#333333')
       .text('Réunions par Sujet', {
           underline: true,
           align: 'center',
           width: doc.page.width - 100 // Ensures we have the full width to center within
       });
    doc.moveDown(0.5);

    // Create topic table
    const topicData = Object.entries(topicSummary)
        .sort((a, b) => b[1] - a[1]) // Sort by count descending
        .map(([topic, count]) => [topic, count]);

    // Table styling
    const startY = doc.y;
    const columnWidths = [150, 60]; // Adjusted column widths
    const tableWidth = columnWidths.reduce((sum, w) => sum + w, 0);
    const startX = (doc.page.width - tableWidth) / 2; // Center the table
    const rowHeight = 25;

    // Add header
    doc.rect(startX, startY, columnWidths[0] + columnWidths[1], rowHeight)
       .fill('#007bff');

    doc.fillColor('#ffffff').fontSize(11).font('Helvetica-Bold')
       .text('Titre', startX + 5, startY + 7, { width: columnWidths[0] - 10 })
       .text('Nombre', startX + columnWidths[0] -10, startY + 7, { width: columnWidths[1] - 10, align: 'left' });

    // Add rows
    doc.fillColor('#333333');
    topicData.forEach((row, i) => {
        const y = startY + (i + 1) * rowHeight;

        // Draw background for alternate rows
        doc.rect(startX, y, columnWidths[0] + columnWidths[1], rowHeight)
           .fill(i % 2 === 0 ? '#f9f9f9' : '#ffffff');

        // Draw cells
        doc.fillColor('#333333').fontSize(10).font('Helvetica')
           .text(row[0], startX + 5, y + 7, { width: columnWidths[0] - 10 })
           .text(row[1], startX + columnWidths[0] + 5, y + 7, { width: columnWidths[1] - 10, align: 'right' });
    });

    // Draw borders
    doc.lineWidth(0.5).strokeColor('#cccccc')
       .rect(startX, startY, columnWidths[0] + columnWidths[1], rowHeight * (topicData.length + 1))
       .stroke();

    // Move cursor to after the table
    doc.y = startY + rowHeight * (topicData.length + 1) + 20;
}


/**
 * Adds footer with page numbers to the document
 * This is a completely rewritten function to fix the pagination issues
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

function formatDateDay(date, includeTime = false) {
    if (!date) return 'N/A';

    const momentDate = moment(date);
    return includeTime
        ? momentDate.format('DD/MM/YYYY')
        : momentDate.format('DD/MM/YYYY');
}

/**
 * Formats a currency value for display in French format (Not directly applicable to RCP meetings, but keeping for potential future use or adaptation)
 */
function formatCurrency(value) {
    if (value === null || value === undefined) return 'N/A';

    // Nettoyer la valeur d'entrée si c'est une chaîne
    let cleanValue = value;
    if (typeof value === 'string') {
        // Supprimer tous les caractères non numériques sauf le point et la virgule
        cleanValue = value.replace(/[^\d.,]/g, '');
        // Remplacer la virgule par un point pour le parsing
        cleanValue = cleanValue.replace(',', '.');
    }

    // Conversion en nombre
    const numValue = parseFloat(cleanValue);

    // Vérifier si la conversion a réussi
    if (isNaN(numValue)) return 'N/A';

    try {
        // Formatage manuel pour éviter les problèmes de locale
        const parts = numValue.toFixed(2).split('.');
        const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        const decimalPart = parts[1];

        return `${integerPart},${decimalPart} €`;
    } catch (e) {
        console.error('Erreur de formatage de la valeur monétaire:', e);
        // Fallback simple si le formatage échoue
        return `${numValue.toFixed(2).replace('.', ',')} €`;
    }
}

/**
 * Ajoute un graphique à barres montrant les réunions par sujet (Adapted for RCP meetings)
 * @param {PDFDocument} doc - Document PDF
 * @param {Object} topicSummary - Object avec les sujets et leurs comptes
 */
function addTopicBarChart(doc, topicSummary) {
      // Reset position to left margin
      doc.x = 50;

      // Add section title
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#333333')
         .text('Graphique des Réunions par Sujet', {
             underline: true,
             align: 'center',
             width: doc.page.width - 100 // Ensures we have the full width to center within
         });
      doc.moveDown(0.5);


    // Agréger les données par sujet (already done in topicSummary)

    // Limiter à 10 sujets maximum pour la lisibilité
    let sortedData = Object.entries(topicSummary)
        .sort((a, b) => b[1] - a[1]) // Trier par count décroissant
        .slice(0, 10); // Prendre les 10 premiers

    // Créer un objet avec les données limitées
    const limitedData = {};
    sortedData.forEach(([topic, count]) => {
        // Tronquer les sujets trop longs
        const shortTopic = topic.length > 15 ? topic.substring(0, 15) + '...' : topic;
        limitedData[shortTopic] = count;
    });

    // Configuration du graphique
    const chartWidth = 400;
    // Calculate the center point of the page and position the chart accordingly
    const chartX = (doc.page.width - chartWidth) / 2;
    const chartY = doc.y + 20;
    const chartHeight = 150;
    const barPadding = 10;

    // Trouver la valeur maximale pour l'échelle
    const categories = Object.keys(limitedData);
    const values = Object.values(limitedData);
    const maxValue = Math.max(...values);

    // Calculer la largeur des barres
    const barWidth = (chartWidth - (categories.length - 1) * barPadding) / categories.length;

    // Dessiner le fond du graphique
    doc.rect(chartX - 10, chartY - 10, chartWidth + 20, chartHeight + 40)
       .fill('#f8f8f8');

    // Dessiner les axes
    doc.lineWidth(1).strokeColor('#333333')
       .moveTo(chartX, chartY)
       .lineTo(chartX, chartY + chartHeight)
       .lineTo(chartX + chartWidth, chartY + chartHeight)
       .stroke();

    // Ajouter un titre pour l'axe Y
    doc.fontSize(8).fillColor('#333333')
       .text('Nombre de Réunions', chartX - 45, chartY + chartHeight / 2, {
           width: 40,
           align: 'right',
           rotate: 0 // Keep text horizontal
       });


    // Dessiner les lignes horizontales de grille (5 lignes)
    doc.strokeColor('#cccccc').lineWidth(0.5);
    for (let i = 0; i <= 5; i++) {
        const y = chartY + chartHeight - (i * chartHeight / 5);
        doc.moveTo(chartX, y)
           .lineTo(chartX + chartWidth, y)
           .stroke();

        // Ajouter les valeurs sur l'axe Y
        const value = Math.round(maxValue * i / 5); // Round the count
        doc.fillColor('#666666').fontSize(8)
           .text(value, chartX - 45, y - 5, { width: 40, align: 'right' });
    }

    // Dessiner les barres
    categories.forEach((category, index) => {
        const value = limitedData[category];
        const barHeight = (value / maxValue) * chartHeight;
        const barX = chartX + index * (barWidth + barPadding);
        const barY = chartY + chartHeight - barHeight;

        // Définir une couleur basée sur l'index (alternance de teintes de bleu)
        const hue = 210; // Bleu
        const lightness = 40 + (index % 3) * 10; // Variation de luminosité
        const barColor = `hsl(${hue}, 70%, ${lightness}%)`;

        // Dessiner la barre
        doc.fillColor(barColor)
           .rect(barX, barY, barWidth, barHeight)
           .fill();

        // Ajouter une bordure à la barre
        doc.lineWidth(0.5).strokeColor('#333333')
           .rect(barX, barY, barWidth, barHeight)
           .stroke();

        // Ajouter l'étiquette de catégorie (sujet)
        doc.fillColor('#333333')
           .fontSize(7)
           .text(category, barX - barPadding/2, chartY + chartHeight + 5, {
               width: barWidth + barPadding,
               align: 'center',
               angle: 45 // Incliner le texte pour une meilleure lisibilité
           });

        // Ajouter la valeur au-dessus de la barre
        if (barHeight > 15) { // Seulement si la barre est assez haute
            doc.fillColor('#ffffff')
               .fontSize(8)
               .text(value, barX, barY + barHeight/2 - 5, {
                   width: barWidth,
                   align: 'center'
               });
        } else {
            // Sinon mettre la valeur au-dessus de la barre
            doc.fillColor('#333333')
               .fontSize(8)
               .text(value, barX, barY - 15, {
                   width: barWidth,
                   align: 'center'
               });
        }
    });

    // Ajouter une légende pour les sujets tronqués
    if (sortedData.some(([topic]) => topic.length > 15)) {
        // Move to a position below the chart
        doc.y = chartY + chartHeight + 20; // Position after the chart and labels

        // Reset x position and use the page width for centering
        doc.x = 50;
        doc.fontSize(8).fillColor('#666666')
           .text('Note: Certains sujets ont été tronqués pour la lisibilité du graphique.', {
               align: 'center',
               width: doc.page.width - 100 // Use page width instead of chart width
           });
    }

    // Mettre à jour la position du curseur
    doc.y = chartY + chartHeight + 60; // Laisser de l'espace pour les étiquettes inclinées

    return doc;
}

/**
 * Ajoute un graphique circulaire (camembert) montrant la répartition des charges par catégorie (Removed as it's not directly applicable to RCP meetings)
 */
// function addPieChart(doc, categorySummary) { ... } // Removed

module.exports = { generateReport };
