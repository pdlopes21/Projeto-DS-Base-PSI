const mongoose = require('mongoose');

const TimePeriodSchema = new mongoose.Schema({
  start: {
    type: Date,
    required: true
  },
  end: {
    type: Date,
    validate: {
      validator: function (value) {
        // RIA 5 - start deve ser antes de end
        return this.start ? value > this.start : true;
      },
      message: 'End time must be after start time.'
    }
  }
}, { _id: false });

module.exports = TimePeriodSchema;
