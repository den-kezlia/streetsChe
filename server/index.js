const express = require('express');
const helper = require('./helper');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  helper.getAllImages().then(images => {
    res.json({
      message: `Hello World! ${JSON.stringify(images)}`,
    });
  });
});

const port = process.env.PORT || 1337;
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});