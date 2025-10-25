const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Person = require("./person");

const ClientSchema = new Schema({
    // por enquanto acho que nao precisamos de nada aqui
});

ClientSchema.virtual("url").get(function () {
    return `/clients/${this._id}`;
});

Person.discriminator("Client", ClientSchema); // funciona de forma semelhante a heranca

module.exports = ClientSchema;
