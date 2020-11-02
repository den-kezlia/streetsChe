const Trello = require('trello');
const TrelloNode = require('node-trello');
const TeleBot = require('telebot');
const http = require('https');
const fs = require('fs');
const path = require('path');

const config = require('../config/config.json');
const helper = require('./helper');
const Buttons = helper.getBotButtons();

const trello = new Trello(config.trelloKey, config.trelloToken);
const trelloNode = new TrelloNode(config.trelloKey, config.trelloToken);
const telegramToken = config.telegramToken;

const sendStreetMessage = (bot, id, street) => {
    const message = `${street.name} - ${helper.getStreetMapLink(street.desc)}`;
    const replyMarkup = bot.inlineKeyboard([
        [bot.inlineButton('Завершить', {callback: JSON.stringify({
            type: 'finish',
            cardID: street.id
        })}),
        bot.inlineButton('Отменить', {callback: JSON.stringify({
            type: 'cancel',
            cardID: street.id
        })}),
        bot.inlineButton('Фото', {callback: JSON.stringify({
            type: 'uploadPhoto',
            cardID: street.id
        })})]
    ]);

    bot.sendMessage(id, message, {replyMarkup});
}

const bot = new TeleBot({
    token: telegramToken,
    usePlugins: ['namedButtons'],
    pluginConfig: {
        namedButtons: {
            buttons: Buttons
        }
    }
});

bot.on(['/start'], msg => {
    const id = msg.from.id;
    const replyOptions = helper.getReplyOptions(id, bot);

    return bot.sendMessage(id, 'Выберите одну из команд', replyOptions);
});

bot.on('/getAllStreets', msg => {
    const id = msg.from.id;
    const replyOptions = helper.getReplyOptions(id, bot);

    helper.getStreets(trello, 'allStreets').then(streets => {
        let message;

        if (streets && streets.length > 0) {
            message = streets.map(street => {
                return `${street.name} - ${street.desc} - ${helper.getStreetMapLink(street.desc)})`
            }).join('\n');
        } else {
            message = 'Нет улиц'
        }

        return bot.sendMessage(id, message, replyOptions);
    });
});

bot.on('/getToRideStreets', msg => {
    const id = msg.from.id;
    const replyOptions = helper.getReplyOptions(id, bot);

    helper.getStreets(trello, 'toRide').then(streets => {
        if (streets && streets.length > 0) {
            streets.forEach(street => {
                sendStreetMessage(bot, id, street);
            });
        } else {
            bot.sendMessage(id, 'Нет Улиц', replyOptions);
        }
    });
});

bot.on('/getFinishedStreets', msg => {
    const id = msg.from.id;
    const replyOptions = helper.getReplyOptions(id, bot);

    helper.getStreets(trello, 'finished').then(streets => {
        let message;

        if (streets && streets.length > 0) {
            message = streets.map(street => {
                return `${street.name} - ${street.desc} - ${helper.getStreetMapLink(street.desc)}`
            }).join('\n');
        } else {
            message = 'Нет улиц'
        }

        return bot.sendMessage(id, message, replyOptions);
    });
});

bot.on('/getRandomStreet', msg => {
    const id = msg.from.id;

    helper.getRandomStreet(trello).then(street => {
        if (street) {
            trello.updateCardList(street.id, config.toRideListID);
            sendStreetMessage(bot, id, street);
        }
    }).catch(error => {
        console.log(error);
    });
});

// Inline button callback
let CARD_ID = '';
bot.on('callbackQuery', msg => {
    const id = msg.from.id;
    const replyOptions = helper.getReplyOptions(id, bot);
    const data = JSON.parse(msg.data);
    let message;

    switch (data.type) {
        case 'uploadPhoto':
            message = 'Загружай';
            break;
        case 'finish':
            trello.updateCardList(data.cardID, config.finishedListID);
            message = 'Завершено';
            break;
        case 'cancel':
            trello.updateCardList(data.cardID, config.allStreetsListID);
            message = 'Отменено';
            break;
        default:
            break;
    }

    if (data.cardID) {
        CARD_ID = data.cardID;
    }

    return bot.sendMessage(id, message, replyOptions);
});

bot.on('document', msg => {
    bot.getFile(msg.document.file_id).then(result => {
        const imageName = path.resolve(__dirname, `../media/${msg.document.file_name}`);
        const imageFile = fs.createWriteStream(imageName);

        http.get(result.fileLink, data => {
            const fileResponse = data.pipe(imageFile);
            fileResponse.on('finish', () => {
                if (CARD_ID) {
                    helper.uploadImageToTrello(trelloNode, CARD_ID, imageName)
                }
            })
        });
    });
})

bot.connect();