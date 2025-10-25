const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GlobalPriceSchema = new Schema({
    nightTimeIncrease: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        default: 0,
    }
});

module.exports = mongoose.model("GlobalPrice", GlobalPriceSchema);
