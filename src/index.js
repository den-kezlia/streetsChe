const Trello = require('trello');
const TrelloNode = require('node-trello');
const TeleBot = require('telebot');
const http = require('https');
const fs = require('fs');
const path = require('path');

const config = require('../config/trello.json');
const helper = require('./helper');
const Buttons = helper.getBotButtons();

const trello = new Trello(config.key, config.token);
const trelloNode = new TrelloNode(config.key, config.token);
const telegramToken = require('../config/telegram').token;

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

bot.on('/showAllStreets', msg => {
    const id = msg.from.id;
    const replyOptions = helper.getReplyOptions(id, bot);

    helper.getAllStreets(trello).then(allStreets => {
        const message = allStreets.map(street => {
            return `${street.name} - ${street.desc} - [link](${helper.getStreetMapLink(street.desc)})`
        }).join('\n');

        return bot.sendMessage(id, message, replyOptions);
    });
});

bot.on('/getRandomStreet', msg => {
    const id = msg.from.id;

    helper.getRandomStreet(trello).then(street => {
        if (street) {
            trello.updateCardList(street.id, config.toRideListID);
            const message = `${street.name} - [link](${helper.getStreetMapLink(street.desc)})`;
            const replyMarkup = bot.inlineKeyboard([
                [bot.inlineButton('Закрыть', {callback: JSON.stringify({
                    type: 'finish',
                    cardID: street.id
                })}),
                bot.inlineButton('Загрузить фото', {callback: JSON.stringify({
                    type: 'uploadPhoto',
                    cardID: street.id
                })})]
            ]);

            return bot.sendMessage(id, message, {replyMarkup});
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
            message = 'закгружай';
            break;
        case 'finish':
            message = 'Закрыто';
            trello.updateCardList(data.cardID, config.completedListID);

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