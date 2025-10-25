const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AddressSchema = new Schema({
  street: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true
  },
  doorNumber: {
    type: String,
    required: false,
    maxlength: 10,
    trim: true
  },
  postalCode: {
    type: String,
    required: true,
    match: /^[0-9]{4}-[0-9]{3}$/
  },
  locality: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true
  }
});

module.exports = AddressSchema;