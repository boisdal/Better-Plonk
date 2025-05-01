const router = require('express').Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')
const request = require('request-promise')
const {Duel, Game, Guess, Player, Round, Task} = require('../utils/models')
const BASE_URL = 'https://www.geoguessr.com/api'
const GAMESERVER_URL = 'https://game-server.geoguessr.com/api'

const getCompDuelGameDetails = async function(user) {
  let gameToScanList = await Game.aggregate([
    {$match:{userId: user._id}},
    {$lookup: {from: 'duels', localField: '_id', foreignField: 'gameId', as: 'matchedDuels'}},
    {$match:{matchedDuels: [], type: 'PlayedCompetitiveGame', gameMode: 'Duels'}}
  ])
  console.log(`User ${user.displayName} launched a parsing for ${gameToScanList.length} competitive duels.`)

  //let game = gameToScanList[0]
  for (let game of gameToScanList) {
    let body = await request({uri: `${GAMESERVER_URL}/duels/${game.gameGGId}`, method: 'GET', "headers": {"Cookie": `_ncfa=${user.token}`}})
    let details = JSON.parse(body)
    // console.log(details)
    let newDuel = {
      userId: user._id,
      gameId: game._id,
      initialHealth: details.initialHealth,
      forbidMoving: details.movementOptions.forbidMoving,
      forbidZooming: details.movementOptions.forbidZooming,
      forbidRotating: details.movementOptions.forbidRotating,
      mapSlug: details.options.map.slug,
      mapName: details.options.map.name,
      mapMaxErrorDistance: details.options.map.maxErrorDistance,
      roundsWithoutDamageMultiplier: details.options.roundsWithoutDamageMultiplier,
      multiplierIncrement: details.options.multiplierIncrement,
      isCompetitive: true,
      isTeamDuel: details.options.isTeamDuels,
      winnerStyle: details.result.winnerStyle,
      nbOfRounds: details.currentRoundNumber
    }
    let winningTeamId = details.result.winningTeamId
    for (let team of details.teams) {
      let playerId = await savePlayer(user, team.players[0].playerId)
      if (team.name == 'blue') {
        newDuel.blueTeamPlayerList = [playerId]
        if (team.id == winningTeamId) {
          newDuel.winner = 'blue'
          newDuel.winnerRemainingHealth = team.health
        }
      } else {
        newDuel.redTeamPlayerList = [playerId]
        if (team.id == winningTeamId) {
          newDuel.winner = 'red'
          newDuel.winnerRemainingHealth = team.health
        }
      }
    }
    await Duel.create(newDuel)
  }
  await Task.deleteMany({userId: user._id})
}

const savePlayer = async function(user, playerGGId) {
  let count = await Player.find({userId: user._id, playerGGId}).countDocuments()
  let playerId
  if (count == 0) {
    try {
      let body = await request({uri: `${BASE_URL}/v3/users/${playerGGId}`, method: 'GET', "headers": {"Cookie": `_ncfa=${user.token}`}})
      let player = JSON.parse(body)
      let newPlayer = {
        userId: user._id,
        playerGGId,
        nickname: player.nick,
        countryCode: player.countryCode,
        avatarLink: player.fullBodyPin,
        avatarTorsoLink: player.pin.url
      }
      playerId = (await Player.create(newPlayer))._id
    } catch {
      playerId = '000000000000000000000000'
    }
  } else {
    playerId = (await Player.findOne({userId: user._id, playerGGId}))._id
  }
  return playerId
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