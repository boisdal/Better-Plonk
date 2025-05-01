const mongoose = require('mongoose')

const TaskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.ObjectId,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  percentageDone: {
    type: Number,
    required: true,
  },
})

module.exports = mongoose.model('Task', TaskSchema)
