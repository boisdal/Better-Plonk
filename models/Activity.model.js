const mongoose = require('mongoose')

const ActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.ObjectId,
    required: true,
  },
  type: {
    type: Number,
    required: true,
  },
}, { collection: 'activities'})

module.exports = mongoose.model('Activity', ActivitySchema)
