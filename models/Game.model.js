const mongoose = require('mongoose')

const GameSchema = new mongoose.Schema({
  userId: {
    type: mongoose.ObjectId,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  time: {
    type: Date,
    required: true,
  },
  gameGGId: {
    type: String,
    required: true,
  },
  gameMode: {
    type: String,
    required: false,
  },
}, { collection: 'games'})

module.exports = mongoose.model('Game', GameSchema)
