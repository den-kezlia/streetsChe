const express = require('express');
const path = require('path');
const helper = require('./helper');
const pug = require('pug');

const app = express();
const publicFolder = path.resolve(__dirname, '../public');
const publicMedia = path.resolve(__dirname, '../media');

app.use(express.json());
app.use(express.static(publicFolder))
app.use(express.static(publicMedia))

app.get('/', (req, res) => {
  helper.getAllImages().then(images => {
    const html = pug.renderFile(path.resolve(__dirname, 'template/index.pug'), {
      images: images,
      title: 'Streets Che'
    })

    res.send(html);
  });
});

const port = process.env.PORT || 1337;
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});