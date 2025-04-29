const mongoose = require('mongoose')

const RoundSchema = new mongoose.Schema({
  userId: {
    type: mongoose.ObjectId,
    required: true,
  },
  duelId: {
    type: mongoose.ObjectId,
    required: true,
  },
  panoramaId: {
    type: mongoose.ObjectId,
    required: true,
  },
  roundNumber: {
    type: Number,
    required: true
  },
  isHealingRound : {
    type: Boolean,
    required: true
  },
  multiplier : {
    type: Number,
    required: true
  },
  startTime : {
    type: Date,
    required: true
  },
  endTime : {
    type: Date,
    required: true
  },
  timerTime : {
    type: Date,
    required: true
  },
  timerStartedBy : {
    type: mongoose.ObjectId,
    required: true
  }
}, { collection: 'rounds'})

module.exports = mongoose.model('Round', RoundSchema)
