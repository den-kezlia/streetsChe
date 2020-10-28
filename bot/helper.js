const exif = require('exif').ExifImage;
const fs = require('fs');
const URL = require('url');

const config = require('../config/config.json');

const getBotButtons = () => {
    return {
        getAllStreets: {
            label: 'Все улицы',
            command: '/getAllStreets'
        },
        getRandomStreet: {
            label: 'Выбрать случайную',
            command: '/getRandomStreet'
        },
        getToRideStreets: {
            label: 'В процессе',
            command: '/getToRideStreets'
        },
        getFinishedStreets: {
            label: 'Завершенные',
            command: '/getFinishedStreets'
        }
    }
}

const isAdmin = (id) => {
    return id === config.adminTelegramID
}

const getStartButtons = (id) => {
    let buttons = [];
    const btnCollection = getBotButtons();

    if (isAdmin(id)) {
        buttons.push(
            [btnCollection.getToRideStreets.label, btnCollection.getFinishedStreets.label],
            [btnCollection.getAllStreets.label, btnCollection.getRandomStreet.label]
        );
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

const getStreets = async (trello, type) => {
    let listID;

    switch (type) {
        case 'allStreets':
            listID = config.allStreetsListID
            break;
        case 'toRide':
            listID = config.toRideListID
            break;
        case 'finished':
            listID = config.finishedListID
            break;
        default:
            break;
    }

    return trello.getCardsOnList(listID);
}

const getRandomStreet = async (trello) => {
    const street = trello.getCardsForList(config.allStreetsListID).then(streets => {
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
    getStreets: getStreets,
    getRandomStreet: getRandomStreet,
    getStreetMapLink: getStreetMapLink,
    getPhotoMapLink: getPhotoMapLink,
    uploadImageToTrello: uploadImageToTrello,
    getImageMeta: getImageMeta
}