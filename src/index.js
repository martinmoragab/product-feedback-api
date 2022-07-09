const express = require('express');
require('./db/mongoose');

const app = express();
const port = process.env.PORT;

app.listen(port, () => {
  console.log('Server is up!');
});