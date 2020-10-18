const config = require('../config/trello.json');
const URL = require('url');

const getBotButtons = () => {
    return {
        showAllStreets: {
            label: 'Показать все улицы',
            command: '/showAllStreets'
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
        buttons.push([getBotButtons().showAllStreets.label]);
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

const getGoogleMapLink = (desc) => {
    const descParse = desc.split('|');
    const query = `${descParse[0]} ${descParse[1] ? descParse[1] : 1}`;
    const url = new URL.parse(`https://maps.google.com/?q=${query}`);

    return url.href;
}

module.exports = {
    getBotButtons: getBotButtons,
    getReplyOptions: getReplyOptions,
    getAllStreets: getAllStreets,
    getGoogleMapLink: getGoogleMapLink
}