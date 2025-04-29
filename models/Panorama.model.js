const mongoose = require('mongoose')

const PanoramaSchema = new mongoose.Schema({
  userId: {
    type: mongoose.ObjectId,
    required: true,
  },
  PanoramaGGId: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  countryCode: {
    type: String,
    required: true,
  },
  heading: {
    type: Number,
    required: true,
  },
  pitch: {
    type: Number,
    required: true,
  },
  zoom: {
    type: Number,
    required: true,
  },
}, { collection: 'panoramas'})

module.exports = mongoose.model('Panorama', PanoramaSchema)
