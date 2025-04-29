const mongoose = require('mongoose')

const GuessSchema = new mongoose.Schema({
  userId: {
    type: mongoose.ObjectId,
    required: true,
  },
  roundId: {
    type: mongoose.ObjectId,
    required: true,
  },
  playerId: {
    type: mongoose.ObjectId,
    required: true,
  },
  panoramaId: {
    type: mongoose.ObjectId,
    required: true,
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  distance : {
    type: Number,
    required: true
  },
  score : {
    type: Number,
    required: true
  },
  isTeamsBest : {
    type: Date,
    required: true
  },
  isFirst : {
    type: Date,
    required: true
  }
}, { collection: 'guesses'})

module.exports = mongoose.model('Guess', GuessSchema)
