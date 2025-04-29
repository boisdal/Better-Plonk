const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
  userId: {
    type: mongoose.ObjectId,
    required: true,
  },
  gameId: {
    type: mongoose.ObjectId,
    required: true,
  },
  blueTeamPlayerList : [{
    type: mongoose.ObjectId,
    required: true
  }],
  redTeamPlayerList : [{
    type: mongoose.ObjectId,
    required: true
  }],
  initialHealth: {
    type: Number,
    required: true
  },
  forbidMoving : {
    type: Boolean,
    required: true
  },
  forbidZooming : {
    type: Boolean,
    required: true
  },
  forbidRotating : {
    type: Boolean,
    required: true
  },
  mapSlug : {
    type: String,
    required: true
  },
  mapName : {
    type: String,
    required: true
  },
  roundsWithoutDamageMultiplier: {
    type: Number,
    required: true
  },
  multiplierIncrement: {
    type: Number,
    required: true
  },
  isCompetitive : {
    type: Boolean,
    required: true
  },
  isTeamDuel : {
    type: Boolean,
    required: true
  },
  winner : {
    type: String,
    required: true
  },
  winnerStyle : {
    type: String,
    required: true
  },
  nbOfRounds: {
    type: Number,
    required: true
  },
}, { collection: 'duels'})

module.exports = mongoose.model('Duel', Schema)
