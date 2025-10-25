var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

// sprint 1
var taxisRouter = require('./routes/taxis');
var driversRouter = require('./routes/drivers');
var initRouter = require('./routes/init');
var pricesRouter = require('./routes/prices');

// sprint 2
var shiftsRouter = require('./routes/shifts');
var taxiOrdersRouter = require('./routes/taxiOrders');
var ridesRouter = require('./routes/rides');

// sprint 3
var reportsRouter = require('./routes/reports');

var app = express();

// Set up mongoose connection
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const mongoDB = "mongodb+srv://psi09:psi09@cluster0.4ljcrkq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// sprint 1
app.use('/taxis', taxisRouter);
app.use('/drivers', driversRouter);
app.use('/init', initRouter);
app.use('/prices', pricesRouter);

// sprint 2
app.use('/shifts', shiftsRouter);
app.use('/taxiOrders', taxiOrdersRouter);
app.use('/rides', ridesRouter);

// sprint 3
app.use('/reports', reportsRouter);

module.exports = app;
