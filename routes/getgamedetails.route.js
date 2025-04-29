const router = require('express').Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')
const request = require('request-promise')
const Task = require('../models/Task.model')
const Game = require('../models/Game.model')
const BASE_URL = 'https://www.geoguessr.com/api'

const getCompDuelGameDetails = async function(user) {
  let gameToScanList = await Game.aggregate([
    {$match:{userId: user._id}},
    {$lookup: {from: 'duels', localField: '_id', foreignField: 'gameId', as: 'matchedDuels'}},
    {$match:{matchedDuels: [], type: 'PlayedCompetitiveGame', gameMode: 'Duels'}}
  ])
  console.log(gameToScanList.length)
  await Task.deleteMany({userId: user._id})
}

router.get('/all', ensureAuth, async(req,res) => {
  res.json({isOk:false, reason: 'This category\'s parsing is not yet supported'})
})

router.get('/compduels', ensureAuth, async(req,res) => {
  await Task.create({userId: req.user._id, name: 'competitive duel details scan'})
  getCompDuelGameDetails(req.user)
  res.json({isOk:true})
})

router.get('/compteamduels', ensureAuth, async(req,res) => {
  res.json({isOk:false, reason: 'This category\'s parsing is not yet supported'})
})

module.exports=router;