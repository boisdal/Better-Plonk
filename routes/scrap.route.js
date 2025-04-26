const router = require('express').Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')
const request = require('request-promise')
const Task = require('../models/Task.model')
const Game = require('../models/Game.model')
const {activityCodes} = require('../utils/enums')
const BASE_URL = 'https://www.geoguessr.com/api'

const scanActivities = async function(user) {
  let nextPageExists = true
  let paginationToken = ''
  while (nextPageExists) {
    let body = await request({uri: `${BASE_URL}/v4/feed/private?paginationToken=${paginationToken}`, method: 'GET', "headers": {"Cookie": `_ncfa=${user.token}`}})
    let response = JSON.parse(body)
    for (let entry of response.entries) {
      entry.payload = JSON.parse(entry.payload)
    }
    paginationToken = response.paginationToken
    if (paginationToken == null) {nextPageExists = false}
    //console.log(response.entries[2].time, response.entries[2].payload)//, response.entries[3], response.entries[4])
    for (let activity of response.entries) {
        if (activityCodes[activity.type] == 'Group') {
            for (let game of activity.payload) {
                await storeGame(user, game)
            }
        } else {
            await storeGame(user, activity)
        }
    }
    //nextPageExists = false
  }
  await Task.deleteMany({userId: user._id})
}

const storeGame = async function(user, game) {
    let newGame = {
        userId: user._id, 
        type: activityCodes[game.type], 
        time: game.time,
        gameMode: game.payload.gameMode
    }
    switch (newGame.type) {
        case 'Unknown':
            console.log('Event of type Unknown detected, nothing to do but logging it.')
            console.log(game, user)
            return
        case 'PlayedGame':
            newGame.gameGGId = game.payload.gameToken
            break
        case 'PlayedChallenge':
            newGame.gameGGId = game.payload.challengeToken
            break
        case 'CreatedMap':
            // console.log('Event of type CreatedMap detected, nothing to do.') // not even logging it
            return
        case 'UnlockedBadge':
            // console.log('Event of type UnlockedBadge detected, nothing to do.') // not even logging it
            return
        case 'LikedMap':
            // console.log('Event of type LikedMap detected, nothing to do.') // not even logging it
            return
        case 'PlayedCompetitiveGame':
            newGame.gameGGId = game.payload.gameId
            break
        case 'Group':
            console.log('Event of type group detected, should not have happened')
            return
        case 'PlayedSinglePlayerQuiz':
            console.log('Event of type PlayedSinglePlayerQuiz detected, no idea what id to take')
            console.log(game, user)
            break
        case 'PlayedPartyGame':
            newGame.gameGGId = game.payload.gameId
            break
        case 'PlayedInfinityGame':
            newGame.gameGGId = game.payload.gameId
            break
        case 'PlayedCasualGame':
            newGame.gameGGId = game.payload.gameId
            break
        case 'PlayedQuickplayGame':
            newGame.gameGGId = game.payload.gameId
            break
        case 'PlayedPublicTeamDuel':
            newGame.gameGGId = game.payload.gameId
            break
    }
    let existsAlready = await Game.where(newGame).countDocuments()
    if (!existsAlready) {
        Game.create(newGame)
    }
}

router.get('/data', ensureAuth, async(req,res) => {
    let gameList = await Game.find({userId: req.user._id}).sort({date: 'descending'})
    let totalGameCount = gameList.length
    let latestGame = 'never'
    if (totalGameCount > 0) {
    latestGame = gameList[0].time
    }
    res.render('pages/scrapdata.view.ejs', {user:req.user, totalGameCount, latestGame})
})

router.post('/scanactivities', ensureAuth, async(req, res) => {
  await Task.create({userId: req.user._id, name: 'activity scan'})
  scanActivities(req.user)
  res.json({isok: true, gonnawait: true})
})

router.get('/isTaskDone', ensureAuth, async(req,res) => {
  let currentTaskList = await Task.find({userId: req.user._id})
  res.json({isDone: (currentTaskList.length == 0)})
})

router.get('/getscrapbuttonsection', ensureAuth, async(req,res) => {
  let gameList = await Game.find({userId: req.user._id}).sort({date: 'descending'})
  let totalGameCount = gameList.length
  let latestGame = 'never'
  if (totalGameCount > 0) {
    latestGame = gameList[0].time
  }
  res.render('partials/scrapbuttonsection.part.ejs', {user: req.user, totalGameCount, latestGame})
})

router.get('/settings', ensureAuth, async(req,res) => {
  res.render('pages/wip.view.ejs', {user:req.user, title: 'settings'})
})

module.exports=router;