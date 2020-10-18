const Trello = require('trello');
const TeleBot = require('telebot');
const config = require('../config/trello.json');
const helper = require('./helper');
const Buttons = helper.getBotButtons();

const trello = new Trello(config.key, config.token);

const bot = new TeleBot({
    token: require('../config/telegram').token,
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
    console.log(replyOptions);

    return bot.sendMessage(id, 'Выберите одну из команд', replyOptions);
});


bot.on('/showAllStreets', msg => {
    const id = msg.from.id;
    const replyOptions = helper.getReplyOptions(id, bot);

    helper.getAllStreets(trello).then(allStreets => {
        const message = allStreets.map(item => {
            return `${item.name} - ${item.desc} - [link](${helper.getGoogleMapLink(item.desc)})`
        }).join('\n');

        return bot.sendMessage(id, message, replyOptions);
    });

});

bot.connect();