const mongoose = require("mongoose");
const OfferSchema = require("./offer");
const AddressSchema = require('./address');
const Schema = mongoose.Schema;

const TaxiOrderSchema = new Schema({
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
    location: {
        lat: { type: Number, required: true },
        lon: { type: Number, required: true }
    },
    destination: {
        lat: { type: Number, required: true },
        lon: { type: Number, required: true }
    },
    locationAddress: {
        type: AddressSchema,
        required: true
    },
    destinationAddress: {
        type: AddressSchema,
        required: true
    },
    numberOfPeople: {
        type: Number,
        required: true,
        min: 1, // RIA 19
        max: 6
    },
    status: {
        type: String, enum: ['pending', 'accepted', 'confirmed', 'rejected', 'canceled', 'driverArrived'],
        default: 'pending',
        required: true
    },
    comfortLevel: {
        type: String,
        required: true,
        enum: ['standard', 'luxury'], // RIA 16 - basico ou luxuoso
    },
    offer: {
        type: OfferSchema,
        default: null
    },
    rejectedDrivers: [{
        type: Schema.Types.ObjectId,
        ref: 'Driver',
        default: []
    }]
});

module.exports = mongoose.model("TaxiOrder", TaxiOrderSchema);