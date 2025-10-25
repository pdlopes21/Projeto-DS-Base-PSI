const mongoose = require("mongoose");
const AddressSchema = require('./address');
const Schema = mongoose.Schema;

const TimePeriodSchema = require('./timePeriod');

const RideSchema = new Schema({
    client: {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },
        nif: {
            type: String,
            required: true,
            match: /^[0-9]{9}$/,
        },
        gender: {
            type: String,
            enum: ['male', 'female'],
            required: true
        }
    },
    shift: {
        type: Schema.Types.ObjectId,
        ref: 'Shift',
        required: true
    },
    timePeriod: {
        type: TimePeriodSchema,
        required: true
    },
    start: {
        lat: { type: Number, required: true },
        lon: { type: Number, required: true }
    },
    end: {
        lat: Number,
        lon: Number
    },
    startAddress: {
        type: AddressSchema,
        required: true
    },
    endAddress: {
        type: AddressSchema,
        required: false
    },
    distanceKm: Number,
    price: Number,
    sequenceNumber: { type: Number, required: true, index: true }, // RIA 18
    numberOfPeople: {
        type: Number,
        required: true,
        min: 1, // RIA 19
        max: 6
    },
    taxiOrder: {
        type: Schema.Types.ObjectId,
        ref: 'TaxiOrder'
    }
});

RideSchema.index({ shift: 1, 'timePeriod.start': 1, sequenceNumber: 1 }, { unique: true });

module.exports = mongoose.model("Ride", RideSchema);