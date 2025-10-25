const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const options = { discriminatorKey: 'role', collection: 'persons' };

const PersonSchema = new Schema({
  nif: {
    type: String,
    required: true,
    unique: true,
    match: /^[0-9]{9}$/  // RIA 10 - 9 digitos e positivo
  },
  name: { type: String, required: true, maxLength: 100 },
  gender:  { type: String, required: true, enum: ['male','female'] } // RIA 11 - um ou outro
}, options);

// Virtual for person's URL
PersonSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/persons/${this._id}`;
});

// Export model
module.exports = mongoose.model("Person", PersonSchema);
