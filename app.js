const path = require('path');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallet');
const settingstRoutes = require('./routes/settings');


const app = express();
const accesLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: accesLogStream }));

app.use(bodyParser.json()); // aplication/json

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/auth', authRoutes);
app.use(walletRoutes);
app.use(settingstRoutes);


app.use((err, req, res) => {
  const status = err.statusCode || 500;
  const { message } = err;
  const { data } = err;
  res.status(status).json({ message, data });
});
mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-xaqtt.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?authSource=admin&replicaSet=Cluster0-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true`, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(process.env.PORT || 8080);
  })
  // eslint-disable-next-line no-console
  .catch((err) => console.log(err));
