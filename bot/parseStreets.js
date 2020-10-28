const rp = require('request-promise');
const $ = require('cheerio');
const url = 'http://map.cn.ua/map/streets/%D0%A7%D0%B5%D1%80%D0%BD%D0%B8%D0%B3%D0%BE%D0%B2/page/';
const fs = require('fs');

const fileName = '../data/streets.json';

for (let page = 1; page <= 27; page++) {
    rp(`${url}${page}/`)
    .then(function (html) {
        let streets = [];

        const links = $('#content a', html);
        links.each((i, item) => {
            if (item.attribs.href.indexOf('/map/streets/info/') > -1) {
                const title = item.attribs.title;
                let div = '';
                let translate = '';
                let firstBuilding = '';
                let lastBuilding = '';

                try {
                    const translateSpan = item.nextSibling.nextSibling;
                    translate = translateSpan.childNodes.length > 1 ? '' : translateSpan.childNodes[0].data;

                    if (item.nextSibling.nextSibling.name === 'div' && item.nextSibling.nextSibling) {
                        div = item.nextSibling.nextSibling;
                    } else if (item.nextSibling.nextSibling.nextSibling.name === 'div') {
                        div = item.nextSibling.nextSibling.nextSibling;
                    } else {
                        div = item.nextSibling.nextSibling.nextSibling.nextSibling;
                    }

                    firstBuilding = div.childNodes[1].childNodes[0].data;
                    lastBuilding = div.childNodes[div.childNodes.length - 2].childNodes[0].data;
                } catch (error) {
                }

                const street = {
                    title: title,
                    translate: translate,
                    firstBuilding: firstBuilding,
                    lastBuilding: lastBuilding,
                    page: page
                };

                //console.log(street);
                streets.push(street);
            }
        })

        fs.appendFile(fileName, JSON.stringify(streets), function (err) {
            if (err) return console.log(err);
        });
    })
    .catch(function (err) {
        console.log(err.message);
        //handle error
    });
}

