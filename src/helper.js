const config = require('../config/trello.json');
const URL = require('url');

const getBotButtons = () => {
    return {
        showAllStreets: {
            label: 'Показать все улицы',
            command: '/showAllStreets'
        },
        getRandomStreet: {
            label: 'Выбрать любую улицу',
            command: '/getRandomStreet'
        }
    }
}

const isAdmin = (id) => {
    // TODO: Implement check if it's admin
    return true;
}

const getStartButtons = (id) => {
    let buttons = [];

    if (isAdmin(id)) {
        buttons.push([getBotButtons().showAllStreets.label, getBotButtons().getRandomStreet.label]);
    }

    return buttons;
}

const getReplyOptions = (id, bot) => {
    const buttons = getStartButtons(id);

    return {
        replyMarkup: bot.keyboard(buttons, {resize: true}),
        parseMode: 'markdown'
    }
}

const getAllStreets = async (trello) => {
    const allStreets = trello.getCardsOnList(config.streetsListID);

    return allStreets;
}

const getRandomStreet = async (trello) => {
    const street = trello.getCardsForList(config.streetsListID).then(streets => {
        const index = Math.floor(Math.random() * Math.floor(streets.length));

        return streets[index];
    })

    return street;
}

const getStreetMapLink = (desc) => {
    const descParsed = desc.split('|');
    const streetName = descParsed[0].split(' ').map(part => {
        return part.toLowerCase() === 'вул' || part.toLowerCase() === 'ул.' ? 'вулиця' : part
    }).join(' ');
    const firstBuildingNumber = descParsed[1] ? descParsed[1] : 1;
    const city = 'Чернигів';
    const query = `${streetName} ${firstBuildingNumber} ${city}`;
    const url = new URL.parse(`https://maps.google.com/?q=${query}`);

    return url.href;
}

const getPhotoMapLink = (gps) => {
    const coordinates = `${gps.GPSLatitude[0]}°${gps.GPSLatitude[1]}'${gps.GPSLatitude[2]}"${gps.GPSLatitudeRef} ${gps.GPSLongitude[0]}°${gps.GPSLongitude[1]}'${gps.GPSLongitude[2]}"${gps.GPSLongitudeRef}`;
    const url = new URL.parse(`https://maps.google.com/?q=${coordinates}`);

    return url.href;
}

module.exports = {
    getBotButtons: getBotButtons,
    getReplyOptions: getReplyOptions,
    getAllStreets: getAllStreets,
    getRandomStreet: getRandomStreet,
    getStreetMapLink: getStreetMapLink,
    getPhotoMapLink: getPhotoMapLink
}