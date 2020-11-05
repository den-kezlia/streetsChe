const fs = require('fs');
const path = require('path');
const http = require('https');
const exif = require('exif').ExifImage;
const NodeTrello = require('node-trello');
const config = require('../config/config.json');
const { log } = require('console');

const trello = new NodeTrello(config.trelloKey, config.trelloToken);

const getImageGPS = (imagePath) => {
    const promise = (resolve, reject) => {
        try {
            new exif({image: imagePath}, (error, metaData) => {
                if (error) {
                    resolve(null)
                } else {
                    resolve(metaData.gps)
                }
            });
        } catch (error) {
            reject(error)
        }
    }

    return new Promise(promise);
}

const getImageLocalPath = (image) => {
    const promise = (resolve, reject) => {
        const imagePath = path.resolve(__dirname, `../media/${image.name}`);

        try {
            if (fs.existsSync(imagePath)) {
                resolve(imagePath);
            } else {
                // Download image if it doesn't exist
                const imageFile = fs.createWriteStream(imagePath);

                http.get(image.url, data => {
                    const fileResponse = data.pipe(imageFile);
                    fileResponse.on('finish', () => {
                        resolve(imagePath);
                    })
                });
            }
        } catch (error) {
            reject(error)
        }
    }

    return new Promise(promise);
}

const getCardImages = (cards) => {
    const images = [];

    cards.forEach(attachments => {
        attachments.forEach(image => {
            images.push(image);
        })
    })

    const imagePromises = images.map(image => {
        return getImageLocalPath(image).then(localPath => {
            const GPS = getImageGPS(localPath);

            return GPS.then(gps => {
                return {
                    localPath: localPath,
                    url: image.url,
                    GPS: gps
                };
            })
        });
    })

    return Promise.all(imagePromises);
}

const getCardAttachments = (card) => {
    const attachments = (resolve, reject) => {
        trello.get(`/1/cards/${card.id}/attachments`, (error, attachments) => {
            if (error) {
                reject(error)
            }

            resolve(attachments);
        })
    }

    return new Promise(attachments);
}

const getAllAttachments = (cards) => {
    return Promise.all(cards.map(getCardAttachments));
};

const getAllCards = () => {
    const allCards = (resolve, reject) => {
        trello.get(`/1/lists/${config.finishedListID}/cards`, (error, cards) => {
            if (error) {
                reject(error)
            }

            resolve(cards);
        });
    }

    return new Promise(allCards)
}

const getAllImages = () => {
    return getAllCards().then(getAllAttachments).then(getCardImages).catch(error => {
        console.error(error)
    });
}

module.exports = {
    getAllImages: getAllImages
}