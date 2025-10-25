const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OfferSchema = new Schema({
    driver: {
        type: Schema.Types.ObjectId,
        ref: 'Driver',
        required: true
    },
    location: {
        lat: { type: Number, required: true },
        lon: { type: Number, required: true }
    },
    distance: { type: Number, required: true },
    taxi: {
        type: Schema.Types.ObjectId,
        ref: 'Taxi',
        required: true
    },
    price: { type: Number, required: true },
});

module.exports = OfferSchema;