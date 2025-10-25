const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TimePeriodSchema = require('../models/timePeriod');

const ShiftSchema = new Schema({
    driver: {
        type: Schema.Types.ObjectId,
        ref: 'Driver',
        required: true
    },
    timePeriod: {
        type: TimePeriodSchema,
        required: true
    },
    taxi: {
        type: Schema.Types.ObjectId,
        ref: 'Taxi',
        required: true
    }
});

module.exports = mongoose.model("Shift", ShiftSchema);