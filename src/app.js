const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const couponsRouter = require('./routes/coupons');
const { apiErrorHandler } = require('./utils/errors');


const app = express();
app.use(cors());
app.use(bodyParser.json());


app.get('/', (req, res) => res.json({ status: 'ok', message: 'Monk Coupons API' }));
app.use('/coupons', couponsRouter);


// health
app.get('/health', (req, res) => res.json({ ok: true }));


// global error handler
app.use(apiErrorHandler);


module.exports = app;