const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PriceSchema = new Schema({
    taxiType: {
        type: String,
        required: true,
        enum: ['standard', 'luxury'], // RIA 16 - basico ou luxuoso
    },
    pricePerMinute: {
        type: Number,
        required: true,
        min: 0 // RIA 17 - preco por minuto deve ser positivo
    }
},{ timestamps: true});

module.exports = mongoose.model("Price", PriceSchema);