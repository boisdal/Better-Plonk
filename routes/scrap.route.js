const router = require('express').Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')
const request = require('request-promise')
const {Duel, Game, Guess, Player, Round, Task} = require('../utils/models')
const {activityCodes} = require('../utils/enums')
const BASE_URL = 'https://www.geoguessr.com/api'
const userDependantTableList = [
  {name: 'Duel', model: Duel},
  {name: 'Game', model: Game},
  {name: 'Guess', model: Guess},
  {name: 'Player', model: Player},
  {name: 'Round', model: Round}
]

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
    for (let activity of response.entries) {
      if (activityCodes[activity.type] == 'Group') {
        for (let game of activity.payload) {
          await storeGame(user, game)
        }
      } else {
        await storeGame(user, activity)
      }
    }
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

const prepareScrapButtonSection = async function(user) {
  let gameGlobalData = await Game.aggregate([
    {$lookup: {from: "duels", localField: "_id", foreignField: "gameId", as: "duelsMatchedList"}},
    {$group: {_id: null, count: {$sum: 1}, countDuelsMatched: {
      $sum: {$cond: {if: {$eq: ["$duelsMatchedList", []]}, then: 0, else: 1}}
    }, latest: {$max: "$time"}}},
    {$project: {_id: 0}}
  ])
  if (gameGlobalData.length == 0) {
    let latestGame = 'never'
    let gameStats = [
      {title: 'Total', buttonLink:'/scrap/getgamedetails/all', nbGames: 0, nbGamesDetailed: 0},
      {title: 'Competitive Duels', buttonLink:'/scrap/getgamedetails/compduels', nbGames: 0, nbGamesDetailed: 0},
      {title: 'Competitive Team Duels', buttonLink:'/scrap/getgamedetails/compteamduels', nbGames: 0, nbGamesDetailed: 0}
    ]
    return {latestGame, gameStats}
  } else {
    latestGame = gameGlobalData[0].latest
    let gameStats = []
    gameStats.push({title: 'Total', buttonLink: '/scrap/getgamedetails/all', nbGames: gameGlobalData[0].count, nbGamesDetailed: gameGlobalData[0].countDuelsMatched})

    let groupedGames = await Game.aggregate([
      {$match: {userId: user._id}},
      {$lookup: {from: "duels", localField: "_id", foreignField: "gameId", as: "duelsMatchedList"}},
      {$group: {_id: {type: "$type", gameMode: "$gameMode"}, count: {$sum: 1}, matchedDuelCount: {
        $sum: {$cond: {if: {$eq: ["$duelsMatchedList", []]}, then: 0, else: 1}}
      }}},
      {$project: {_id: 0, type: "$_id.type", gameMode: "$_id.gameMode", count: 1, matchedDuelCount: 1}}
    ])

    let groupedCompDuelGame = groupedGames.filter((g) => g.type == 'PlayedCompetitiveGame' && g.gameMode == 'Duels')[0]
    let {count: compDuelGameCount, matchedDuelCount: compDuelDetailedGameCount} = groupedCompDuelGame
    gameStats.push({title: 'Competitive Duels', buttonLink: '/scrap/getgamedetails/compduels', nbGames: compDuelGameCount, nbGamesDetailed: compDuelDetailedGameCount})

    let groupedCompTeamDuelGame = groupedGames.filter((g) => g.type == 'PlayedCompetitiveGame' && g.gameMode == 'TeamDuels')[0]
    let {count: compTeamDuelGameCount, matchedDuelCount: compTeamDuelDetailedGameCount} = groupedCompTeamDuelGame
    gameStats.push({title: 'Competitive Team Duels', buttonLink: '/scrap/getgamedetails/compteamduels', nbGames: compTeamDuelGameCount, nbGamesDetailed: compTeamDuelDetailedGameCount})
    return {latestGame, gameStats}
  }
}

const prepareCleanDataButtonSection = async function(user) {
  let lineCountByTable = []
  for (let table of userDependantTableList) {
    let nbDocuments = await table.model.find({userId: user._id}).countDocuments()
    lineCountByTable.push({name: table.name, count: nbDocuments})
  }
  return lineCountByTable
}

router.get('/data', ensureAuth, async (req,res) => {
  let {latestGame, gameStats} = await prepareScrapButtonSection(req.user)
  res.render('pages/scrapdata.view.ejs', {user:req.user, latestGame, gameStats})
})

router.post('/scanactivities', ensureAuth, async(req, res) => {
  await Task.create({userId: req.user._id, name: 'activity scan'})
  scanActivities(req.user)
  res.json({isOk: true})
})

router.get('/isTaskDone', ensureAuth, async(req,res) => {
  let currentTaskList = await Task.find({userId: req.user._id})
  res.json({isDone: (currentTaskList.length == 0)})
})

router.get('/getscrapbuttonsection', ensureAuth, async(req,res) => {
  let {latestGame, gameStats} = await prepareScrapButtonSection(req.user)
  res.render('partials/scrapbuttonsection.part.ejs', {user: req.user, latestGame, gameStats})
})

router.get('/settings', ensureAuth, async (req,res) => {
  let lineCountByTable = await prepareCleanDataButtonSection(req.user)
  res.render('pages/scrapsettings.view.ejs', {user:req.user, lineCountByTable})
})

router.post('/cleantable/:tablename', ensureAuth, async(req, res) => {
  let tableName = req.params.tablename
  console.log(`Cleaning table ${tableName} for user ${req.user.displayName}`)
  for (let table of userDependantTableList) {
    if (table.name == tableName) {
      await table.model.deleteMany({userId: req.user._id})
    }
  }
  let lineCountByTable = await prepareCleanDataButtonSection(req.user)
  res.render('partials/cleandatabuttonsection.part.ejs', {user:req.user, lineCountByTable})

})

module.exports=router;