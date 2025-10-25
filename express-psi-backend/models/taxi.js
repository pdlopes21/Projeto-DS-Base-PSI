const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TaxiSchema = new Schema({
    licensePlate: {
        type: String,
        required: true,
        unique: true,
        match: /^[A-Z0-9]{2}-[A-Z0-9]{2}-[A-Z0-9]{2}$/ // maior validacao em taxiController
    },
    purchaseYear: {
        type: Number,
        required: true,
        max: new Date().getFullYear(), // ano de compra anterior ou igual ano atual
    },
    brand: {
        type: String,
        required: true,
        maxLength: 30
    },
    modelName: {
        type: String,
        required: true,
        maxLength: 30
    },
    comfortLevel: {
        type: String,
        required: true,
        enum: ['standard', 'luxury'], // RIA 16 - basico ou luxuoso
    },
    createdAt: { type: Date, default: Date.now }
});

TaxiSchema.virtual("url").get(function () {
    return `/taxis/${this._id}`;
});

// Export model
module.exports = mongoose.model("Taxi", TaxiSchema);
