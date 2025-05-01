const mongoose = require('mongoose')

const PlayerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.ObjectId,
    required: true,
  },
  playerGGId: {
    type: String,
    required: true,
  },
  avatarLink: {
    type: String,
    required: true,
  },
  avatarTorsoLink: {
    type: String,
    required: true,
  },
  countryCode: {
    type: String,
    required: true,
  },
  nickname: {
    type: String,
    required: false,
  },
}, { collection: 'players'})

module.exports = mongoose.model('Player', PlayerSchema)
