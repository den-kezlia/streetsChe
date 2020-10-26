const Trello = require('trello');
const config = require('../config/config.json');
const streetsData = require('../data/streets.json');

const trello = new Trello(config.trelloKey, config.trelloToken);

streetsData.forEach(street => {
    const translatedStreetName = street.translate ? street.translate.split('.')[0] : street.title;
    const firstBuilding = isNaN(street.firstBuilding) ? 1 :  street.firstBuilding;
    const lastBuilding = street.lastBuilding;
    const description = `${translatedStreetName}|${firstBuilding}|${lastBuilding}`;

    trello.addCard(street.title, description, config.allStreetsListID);
});