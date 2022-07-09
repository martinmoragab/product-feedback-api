const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
}).then(() => {
  console.log('Connected');
}).catch((e) => {
  console.error('Unable to connect', e);
})