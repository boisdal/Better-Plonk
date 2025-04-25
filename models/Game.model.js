const mongoose = require('mongoose')

const GameSchema = new mongoose.Schema({
  userId: {
    type: mongoose.ObjectId,
    required: true,
  },
  activityId: {
    type: mongoose.ObjectId,
    required: true,
  },
  type: {
    type: Number,
    required: true,
  },
}, { collection: 'games'})

module.exports = mongoose.model('Game', GameSchema)
