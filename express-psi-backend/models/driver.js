const mongoose = require("mongoose");
const AddressSchema = require('./address');
const Schema = mongoose.Schema;

const Person = require("./person");

const DriverSchema = new Schema({
    birthYear: {
        type: Number,
        required: true,
        validate: {
            // RIA 6 - motorista +18
            validator: function (anoNascimento) {
                const currentYear = new Date().getFullYear();
                return currentYear - anoNascimento >= 18;
            },
            message: "O motorista deve ter pelo menos 18 anos de idade."
        }
    },
    driversLicense: {
        type: String,
        required: true,
        unique: true, // RIA 12 - identifica univocamente um motorista
        match: /^[A-Z0-9]{1,12}$/
    },
    address: {
        type: AddressSchema,
        required: true
    },
    createdAt: { type: Date, default: Date.now }, // para alinea d) de UserStory2, talvez haja outra maneira
});

DriverSchema.virtual("url").get(function () {
    return `/drivers/${this._id}`;
});

Person.discriminator("Driver", DriverSchema); // funciona de forma semelhante a heranca

// Export model
module.exports = mongoose.model("Driver");
