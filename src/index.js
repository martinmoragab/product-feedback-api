const express = require('express');
require('./db/mongoose');

const userRouter = require('./routers/user');
const productRouter = require('./routers/product');
const feedbackRouter = require('./routers/feedback');

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use('/users', userRouter);
app.use('/product', productRouter);
app.use('/feedback', feedbackRouter);

app.listen(port, () => {
  console.log('Server is up!');
});