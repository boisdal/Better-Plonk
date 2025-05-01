const router = require('express').Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')
const request = require('request-promise')
const {Duel, Game, Guess, Player, Round, Task, Panorama} = require('../utils/models')
const BASE_URL = 'https://www.geoguessr.com/api'
const GAMESERVER_URL = 'https://game-server.geoguessr.com/api'

const getCompDuelGameDetails = async function(user) {
  let gameToScanList = await Game.aggregate([
    {$match:{userId: user._id}},
    {$lookup: {from: 'duels', localField: '_id', foreignField: 'gameId', as: 'matchedDuels'}},
    {$match:{matchedDuels: [], type: 'PlayedCompetitiveGame', gameMode: 'Duels'}}
  ])
  console.log(`User ${user.displayName} launched a parsing for ${gameToScanList.length} competitive duels.`)

  let gameDoneCount = 0
  for (let game of gameToScanList) {
    let body = await request({uri: `${GAMESERVER_URL}/duels/${game.gameGGId}`, method: 'GET', "headers": {"Cookie": `_ncfa=${user.token}`}})
    let details = JSON.parse(body)
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
    let blueTeamPlayerDataList
    let redTeamPlayerDataList
    for (let team of details.teams) {
      let playerIdList = []
      for (let player of team.players) {
        playerIdList.push(await savePlayer(user, player.playerId))
      }
      if (team.name == 'blue') {
        blueTeamPlayerDataList = team.players
        newDuel.blueTeamPlayerList = playerIdList
        if (team.id == winningTeamId) {
          newDuel.winner = 'blue'
          newDuel.winnerRemainingHealth = team.health
        }
      } else {
        redTeamPlayerDataList = team.players
        newDuel.redTeamPlayerList = playerIdList
        if (team.id == winningTeamId) {
          newDuel.winner = 'red'
          newDuel.winnerRemainingHealth = team.health
        }
      }
    }
    let duelId = (await Duel.create(newDuel))._id
    for (let round of details.rounds) {
      let timerStartedByGGId
      let guessList = []
      for (let playerData of blueTeamPlayerDataList) {
        let guess = playerData.guesses.filter((guess) => guess.roundNumber == round.roundNumber)[0]
        if (guess?.created == round.timerStartTime) {
          timerStartedByGGId = playerData.playerId
          guess.isFirst = true
        } else if (guess) {guess.isFirst = false}
        if (guess) {
          guess.playerId = (await getPlayerIdByGGId(user, playerData.playerId))
          guessList.push(guess)
        }
      }
      for (let playerData of redTeamPlayerDataList) {
        let guess = playerData.guesses.filter((guess) => guess.roundNumber == round.roundNumber)[0]
        if (guess?.created == round.timerStartTime) {
          timerStartedByGGId = playerData.playerId
          guess.isFirst = true
        } else if (guess) {guess.isFirst = false}
        if (guess) {
          guess.playerId = (await getPlayerIdByGGId(user, playerData.playerId))
          guessList.push(guess)
        }
      }
      let roundId = await saveRound(user, duelId, round, timerStartedByGGId)
      for (let guess of guessList) {
        await saveGuess(user, roundId, guess)
      }
    }
    gameDoneCount ++
    await Task.findOneAndUpdate({userId: user._id}, {$set: {percentageDone: (gameDoneCount/gameToScanList.length)}}, useFindAndModify=false)
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
      let newPlayer = {
        userId: user._id,
        playerGGId,
        nickname: '[Deleted]',
        countryCode: 'zz', // This means 'other' for Geoguessr
        avatarLink: 'pin/700fe9f6857e5085cda458c41737bf51.png', // no image is not okay, so this is blinky's
        avatarTorsoLink: 'pin/4f038a09f0fdf01ff5dad521b768e5b5.png'
      }
      playerId = (await Player.create(newPlayer)).id
    }
  } else {
    playerId = (await Player.findOne({userId: user._id, playerGGId}))._id
  }
  return playerId
}

const saveRound = async function(user, duelId, roundDetails, timerStartedByGGId) {
  let newRound = {
    userId: user._id,
    duelId,
    roundNumber: roundDetails.roundNumber,
    isHealingRound: roundDetails.isHealingRound,
    multiplier: roundDetails.multiplier,
    startTime: roundDetails.startTime,
    endTime: roundDetails.endTime,
    timerTime: roundDetails.timerStartTime,
    timerStartedBy: (await getPlayerIdByGGId(user, timerStartedByGGId))
  }
  let panoramaDetails = roundDetails.panorama
  newRound.panoramaId = await savePanorama(panoramaDetails)
  let roundId = (await Round.create(newRound))._id
  return roundId
}

const getPlayerIdByGGId = async function(user, playerGGId) {
  let player = await Player.findOne({userId: user._id, playerGGId})
  return player._id
}

const savePanorama = async function(panoramaDetails) {
  let count = await Panorama.find({panoramaGGId: panoramaDetails.panoId}).countDocuments()
  let panoramaId
  if (count == 0) {
    let newPanorama = {
      panoramaGGId: panoramaDetails.panoId,
      latitude: panoramaDetails.lat,
      longitude: panoramaDetails.lng,
      countryCode: panoramaDetails.countryCode,
      heading: panoramaDetails.heading,
      pitch: panoramaDetails.pitch,
      zoom: panoramaDetails.zoom
    }
    panoramaId = (await Panorama.create(newPanorama))._id
  } else {
    panoramaId = (await Panorama.findOne({panoramaGGId: panoramaDetails.panoId}))._id
  }
  return panoramaId
}

const saveGuess = async function(user, roundId, guess) {
  newGuess = {
    userId: user._id,
    roundId: roundId,
    playerId: guess.playerId,
    latitude: guess.lat,
    longitude: guess.lng,
    distance: guess.distance,
    score: guess.score,
    isTeamsBest: guess.isTeamsBestGuessOnRound,
    isFirst: guess.isFirst
  }
  await Guess.create(newGuess)
}

router.get('/all', ensureAuth, async(req,res) => {
  res.json({isOk:false, reason: 'This category\'s parsing is not yet supported'})
})

router.get('/compduels', ensureAuth, async(req,res) => {
  await Task.create({userId: req.user._id, name: 'competitive duel details scan', percentageDone: 0})
  getCompDuelGameDetails(req.user)
  res.json({isOk:true})
})

router.get('/compteamduels', ensureAuth, async(req,res) => {
  res.json({isOk:false, reason: 'This category\'s parsing is not yet supported'})
})

module.exports=router;