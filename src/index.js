const express = require('express');
require('./db/mongoose');

const userRouter = require('./routers/user');
const productRouter = require('./routers/product');

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use('/users', userRouter);
app.use('/product', productRouter);

app.listen(port, () => {
  console.log('Server is up!');
});