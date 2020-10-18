const Trello = require('trello');
const config = require('../config/trello.json');
const streetsData = require('../data/streets_test.json');

const trello = new Trello(config.key, config.token);

streetsData.forEach(street => {
    const translatedStreetName = street.translate ? street.translate.split('.')[0] : street.title;
    const description = `${translatedStreetName}|${street.firstBuilding}|${street.lastBuilding}`;

    trello.addCard(street.title, description, config.streetsListID);
});