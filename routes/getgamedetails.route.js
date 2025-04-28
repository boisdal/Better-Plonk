const router = require('express').Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')
const request = require('request-promise')
const Task = require('../models/Task.model')
const Game = require('../models/Game.model')
const {activityCodes} = require('../utils/enums')
const BASE_URL = 'https://www.geoguessr.com/api'

router.get('/all', ensureAuth, async(req,res) => {
  res.json({isOk:false, reason: 'This category\'s parsing is not yet supported'})
})

router.get('/compduels', ensureAuth, async(req,res) => {
  res.json({isOk:true})
})

router.get('/compteamduels', ensureAuth, async(req,res) => {
  res.json({isOk:false, reason: 'This category\'s parsing is not yet supported'})
})

module.exports=router;