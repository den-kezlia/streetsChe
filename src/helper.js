const exif = require('exif').ExifImage;
const fs = require('fs');

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

const uploadImageToTrello = (trelloNode, CARD_ID, imageName) => {
    const image = fs.createReadStream(imageName);
    trelloNode.post(`/1/cards/${CARD_ID}/attachments`, { attachment: image }, (err, attachments) => {
        if (err) throw err;
        console.log(attachments);
    })
}

const getImageMeta = (imageName) => {
    try {
        new exif({ image : imageName }, function (error, metaData) {
            if (error)
                console.log('Error: '+error.message);
            else {
                const url = helper.getPhotoMapLink(metaData.gps);

                console.log(metaData);
                console.log(url);
            }
        });
    } catch (error) {
        console.log('Error: ' + error.message);
    }
}

module.exports = {
    getBotButtons: getBotButtons,
    getReplyOptions: getReplyOptions,
    getAllStreets: getAllStreets,
    getRandomStreet: getRandomStreet,
    getStreetMapLink: getStreetMapLink,
    getPhotoMapLink: getPhotoMapLink,
    uploadImageToTrello: uploadImageToTrello,
    getImageMeta: getImageMeta
}