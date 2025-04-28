// Script pour extraire les données du localStorage
const extractData = () => {
    const data = {
        revenus: JSON.parse(localStorage.getItem('revenus')) || [],
        charges: JSON.parse(localStorage.getItem('charges')) || [],
        rcpMeetings: JSON.parse(localStorage.getItem('rcpMeetings')) || [],
        professionnels: JSON.parse(localStorage.getItem('professionnels')) || [],
        parametresRepartition: JSON.parse(localStorage.getItem('parametresRepartition')) || {
            partFixe: 50,
            facteurCogerant: 1.7,
            partRCP: 25,
            partProjets: 25
        },
        projets: JSON.parse(localStorage.getItem('projets')) || []
    };

    // Création d'un élément pour le téléchargement
    const dataStr = JSON.stringify(data, null, 2);
    console.log(dataStr); // Afficher les données dans la console
    
    // Créer le fichier data.json
    const fs = require('fs');
    fs.writeFileSync('data.json', dataStr);
}

extractData(); 