const Trello = require('trello');
const TeleBot = require('telebot');
const http = require('https');
const fs = require('fs');
const exif = require('exif').ExifImage;

const config = require('../config/trello.json');
const helper = require('./helper');
const Buttons = helper.getBotButtons();

const trello = new Trello(config.key, config.token);
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
            const replyMarkup = bot.inlineKeyboard([[bot.inlineButton('Загрузить фото', {callback: JSON.stringify({cardID: street.id})})]]);

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
    const message = 'закгружай';

    if (data.cardID) {
        CARD_ID = data.cardID;
    }

    return bot.sendMessage(id, message, replyOptions);
});

bot.on('document', msg => {
    bot.getFile(msg.document.file_id).then(result => {
        const fileName = `./media/${msg.document.file_name}`;
        const file = fs.createWriteStream(fileName);

        if (CARD_ID) {
            trello.addAttachmentToCard(CARD_ID, result.fileLink);
            CARD_ID = '';
        }

        console.log(result.fileLink);

        http.get(result.fileLink, response => {
            response.pipe(file);

            try {
                new exif({ image : fileName }, function (error, metaData) {
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
        });

    });
})

bot.connect();