const router = require('express').Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')
const request = require('request-promise')
const Task = require('../models/Task.model')
const {activityCodes} = require('../utils/enums')
const BASE_URL = 'https://www.geoguessr.com/api'

const scanActivities = async function(user) {
  console.log(activityCodes)
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
    //console.log(response.entries[0], response.entries[1], response.entries[2], response.entries[3], response.entries[4])
    //console.log(response.entries[2].payload)
    nextPageExists = false
  }
  await Task.deleteMany({userId: user._id})
}

router.get('/data', ensureAuth, async(req,res) => {
  res.render('pages/scrapdata.view.ejs', {user:req.user})
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

router.get('/settings', ensureAuth, async(req,res) => {
  res.render('pages/wip.view.ejs', {user:req.user, title: 'settings'})
})

module.exports=router;
/*



 var i = function(e) {
  return e[e.Unknown = 0] = "Unknown",
  e[e.FriendRequest = 1] = "FriendRequest",
  e[e.ChallengeInvite = 2] = "ChallengeInvite",
  e[e.UnlockedBadge = 7] = "UnlockedBadge",
  e[e.GameInvite = 8] = "GameInvite",
  e[e.FriendRequestAccepted = 9] = "FriendRequestAccepted",
  e[e.TeamInvite = 10] = "TeamInvite",
  e[e.SeasonGameRefund = 11] = "SeasonGameRefund",
  e[e.ReportedCheaterActionTaken = 12] = "ReportedCheaterActionTaken",
  e[e.RatingRefund = 13] = "RatingRefund",
  e[e.NewUserReferralSubscribed = 14] = "NewUserReferralSubscribed",
  e[e.RankedSystemGameRefund = 15] = "RankedSystemGameRefund",
  e[e.EnteredTeamDuelsMatchmaking = 16] = "EnteredTeamDuelsMatchmaking",
  e[e.TeamRatingRefund = 17] = "TeamRatingRefund",
  e[e.RankedTeamGameRefund = 18] = "RankedTeamGameRefund",
  e[e.MapCollaborationRequest = 19] = "MapCollaborationRequest",
  e
}({})


async getProgress(e) {
    try {
        let {payload: t} = await r.ok.get("/api/v4/ranked-system/me", e);
        return t
    } catch (e) {}
},
async getWeeks(e) {
    try {
        var t;
        let {payload: n} = await r.ok.get("/api/v4/ranked-system/me/weeks", e);
        return null !== (t = null == n ? void 0 : n.weeks) && void 0 !== t ? t : []
    } catch (e) {}
    return []
},
async getWeek(e, t) {
    try {
        let {payload: n} = await r.ok.get("/api/v4/ranked-system/me/weeks/".concat(e), t);
        return n
    } catch (e) {}
},
async getPrevious(e) {
    try {
        let {payload: t} = await r.ok.get("/api/v4/ranked-system/me/previous", e);
        return t
    } catch (e) {}
},
async getUserProgress(e, t) {
    try {
        let {payload: n} = await r.ok.get("/api/v4/ranked-system/progress/".concat(e), t);
        return n
    } catch (e) {}
},
async getUserWinStreak(e, t) {
    try {
        let {payload: n} = await r.ok.get("/api/v4/ranked-system/streak/".concat(e, "/"), t);
        return n
    } catch (e) {}
},
async getDivisions(e) {
    try {
        let {payload: t} = await r.ok.get("/api/v4/ranked-system/divisions", e);
        return t
    } catch (e) {}
},
async confirmPreviousWeek(e) {
    try {
        let t = await r.ok.post("/api/v4/ranked-system/me/confirm-previous", e);
        if (200 === t.statusCode)
            return !0
    } catch (e) {}
    return !1
},
async getNextBadge() {
    let e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : void 0;
    try {
        let {payload: t} = await r.ok.get("/api/v4/ranked-system/me/achievement", e);
        return t
    } catch (e) {}
},
async getRatings(e, t) {
    let n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : ""
      , s = arguments.length > 3 ? arguments[3] : void 0
      , i = arguments.length > 4 && void 0 !== arguments[4] ? arguments[4] : void 0;
    try {
        let a = t + 1
          , o = (0,
        r.aj)(n)
          , {payload: l} = await r.ok.get("/api/v4/ranked-system/ratings?offset=".concat((0,
        r.aj)(t * e), "&limit=").concat((0,
        r.aj)(a)).concat(o ? "&country=".concat(o) : "").concat(s ? "&gameMode=".concat(s) : ""), i);
        return {
            hasNextPage: l.length === a,
            items: l.slice(0, t)
        }
    } catch (e) {}
},
async getRatingsMe(e) {
    let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : void 0;
    try {
        let {payload: n} = await r.ok.get("/api/v4/ranked-system/ratings/me".concat(e ? "?gameMode=".concat(e) : ""), t);
        return n
    } catch (e) {}
},
async getRatingsForFriends(e, t, n) {
    let s = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : void 0;
    try {
        let i = t + 1
          , {payload: a} = await r.ok.get("/api/v4/ranked-system/ratings/friends?offset=".concat((0,
        r.aj)(t * e), "&limit=").concat((0,
        r.aj)(i)).concat(n ? "&gameMode=".concat(n) : ""), s);
        return {
            hasNextPage: a.length === i,
            items: a.slice(0, t)
        }
    } catch (e) {}
},
async getCurrentChampionBucket() {
    let e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : void 0;
    try {
        let {payload: t} = await r.ok.get("/api/v4/ranked-system/champions/current", e);
        return t
    } catch (e) {}
},
async getChampionBucketAtWeek(e) {
    let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : void 0;
    try {
        let {payload: n} = await r.ok.get("/api/v4/ranked-system/champions/weeks/".concat(e), t);
        return n
    } catch (e) {}
},
async getUserBestDivision(e, t) {
    try {
        let {payload: n} = await r.ok.get("/api/v4/ranked-system/best/".concat(e), t);
        return n
    } catch (e) {}
},
async getLatestGames(e) {
    try {
        let {payload: t} = await r.ok.get("/api/v4/ranked-system/me/latest-games", e);
        return t
    } catch (e) {}
},
async getPeakRating(e, t) {
    try {
        let {payload: n} = await r.ok.get("/api/v4/ranked-system/peak-rating/".concat(e), t);
        return n
    } catch (e) {}
},
async getMyPeakRating(e) {
    try {
        let {payload: t} = await r.ok.get("/api/v4/ranked-system/me/peak-rating", e);
        return t
    } catch (e) {}
},
async getExampleBucket(e) {
    try {
        let {payload: t} = await r.ok.get("/api/v4/ranked-system/example-bucket", e);
        return t
    } catch (e) {}
}
}


async getMyStats() {
    let e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : void 0;
    try {
        let {payload: t} = await r.ok.get("/api/v3/profiles/stats", e);
        return s(t)
    } catch (e) {}
    return null
},
async getExtendedStats() {
    let e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : void 0;
    try {
        let {payload: t} = await r.ok.get("/api/v4/stats/me", e);
        return t
    } catch (e) {}
},
async getUserStats(e) {
    let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : void 0;
    try {
        let {payload: n} = await r.ok.get("/api/v3/users/".concat((0,
        r.aj)(e), "/stats"), t);
        return s(n)
    } catch (e) {}
},
async getUserExtendedStats(e) {
    let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : void 0;
    try {
        let {payload: n} = await r.ok.get("/api/v4/stats/users/".concat((0,
        r.aj)(e)), t);
        return n
    } catch (e) {}



    async getCreatorConnection() {
    let e = arguments.length > 0 && void 0 !== arguments[0] && arguments[0]
      , t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : void 0;
    try {
        let {payload: n} = await r.ok.get("/api/v4/creators?listCurrentPrograms=".concat(e), t);
        return n
    } catch (e) {}
},
async getCreator(e) {
    let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : void 0;
    if (e)
        try {
            let {payload: n} = await r.ok.get("/api/v4/creators/".concat((0,
            r.aj)(e)), t);
            return n
        } catch (e) {
            return
        }
},
async getMyCreatorCodes(e) {
    let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : void 0;
    if (e)
        try {
            let {payload: e} = await r.ok.get("/api/v4/creators/my-codes", t);
            return e
        } catch (e) {
            return
        }
},
async setCreatorConnection(e) {
    let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : void 0;
    try {
        let {payload: n} = await r.ok.post("/api/v4/creators", t, {
            code: e
        });
        return n
    } catch (e) {}
},
async resetCreatorConnection() {
    let e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : void 0;
    try {
        let {payload: t} = await r.ok.post("/api/v4/creators/reset", e);
        return t
    } catch (e) {}
},
async getCreatorByCode(e) {
    let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : void 0;
    try {
        let {payload: n} = await r.ok.get("/api/v4/creators/code/".concat((0,
        r.aj)(e)), t);
        return n
    } catch (e) {}
},
async validateCreatorConnectionCode(e) {
    let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : void 0;
    try {
        return await r.ok.post("/api/v4/creators/connection-code/".concat((0,
        r.aj)(e)), t),
        !0
    } catch (e) {}
    return !1
}
}
, i = {
creatorCodes: "creator__codes"
}


let i = {
            async getTodaysQuizAnonymous() {
                let e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : void 0
                  , {payload: t, statusCode: n} = await r.ok.get("/api/v4/daily-quiz", e);
                if (200 === n)
                    return t
            },
            async getTodaysQuizAuthenticated() {
                let e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : void 0;
                try {
                    let {payload: t, statusCode: n} = await r.ok.get("/api/v4/daily-quiz", e);
                    if (200 !== n)
                        return;
                    return t
                } catch (e) {
                    return
                }
            },
            async getGame(e) {
                let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : void 0;
                try {
                    let {payload: n} = await r.ok.get("/api/v4/daily-quiz/".concat((0,
                    r.aj)(e)), t);
                    return (null == n ? void 0 : n.snapshot) ? (0,
                    s.M)(n.snapshot) : void 0
                } catch (e) {}
            },
            async guess(e, t) {
                let n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : void 0;
                try {
                    let {payload: i} = await r.ok.put("/api/v4/daily-quiz/".concat((0,
                    r.aj)(e)), n, t);
                    return (null == i ? void 0 : i.snapshot) ? (0,
                    s.M)(i.snapshot) : void 0
                } catch (e) {
                    console.error(e)
                }
            },
            async startGame(e, t) {
                let n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : void 0;
                try {
                    let {payload: i} = await r.ok.post("/api/v4/daily-quiz/".concat((0,
                    r.aj)(e)), n, {
                        source: null != t ? t : ""
                    });
                    return (null == i ? void 0 : i.snapshot) ? (0,
                    s.M)(i.snapshot) : void 0
                } catch (e) {}
            },
            async progressRound(e, t, n) {
                let i = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : void 0;
                try {
                    let {payload: a} = await r.ok.put("/api/v4/daily-quiz/".concat((0,
                    r.aj)(e), "/").concat((0,
                    r.aj)(t), "/advance-round"), i, {
                        source: null != n ? n : ""
                    });
                    return (null == a ? void 0 : a.snapshot) ? (0,
                    s.M)(a.snapshot) : void 0
                } catch (e) {}
            },
            async endCurrentRound(e) {
                let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : void 0;
                try {
                    let {payload: n} = await r.ok.put("/api/v4/daily-quiz/".concat((0,
                    r.aj)(e), "/end-current-round"), t);
                    return (null == n ? void 0 : n.snapshot) ? (0,
                    s.M)(n.snapshot) : void 0
                } catch (e) {}
            },
            async getScore(e) {
                let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : void 0;
                try {
                    let {payload: n, statusCode: s} = await r.ok.get("/api/v4/daily-quiz/".concat(e, "/score"), t);
                    if (200 !== s)
                        return;
                    return n
                } catch (e) {
                    return
                }
            },
            async getGroupScores(e) {
                let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : void 0;
                try {
                    let {payload: n, statusCode: s} = await r.ok.get("/api/v4/daily-quiz/".concat(e, "/score/group"), t);
                    if (200 !== s)
                        return;
                    return n
                } catch (e) {
                    return
                }
            },
            async getOrCreateGroup(e) {
                let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : void 0;
                try {
                    let {statusCode: n, payload: s} = await r.ok.put("/api/v4/daily-quiz/".concat((0,
                    r.aj)(e), "/group"), t);
                    if (!s || 200 !== n)
                        return;
                    return s.groupId
                } catch (e) {
                    return
                }
            },
            async createGroup(e) {
                let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : void 0;
                try {
                    let {payload: n} = await r.ok.post("/api/v4/daily-quiz/groups/", t, {
                        quizId: e
                    });
                    return n
                } catch (e) {
                    return
                }
            },
            async joinGroup(e) {
                let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : void 0;
                try {
                    return await r.ok.post("/api/v4/daily-quiz/groups/".concat(e), t),
                    !0
                } catch (e) {
                    return !1
                }
            },
            async getGroupInfo(e) {
                let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : void 0;
                try {
                    let {payload: n} = await r.ok.get("/api/v4/daily-quiz/groups/".concat(e), t);
                    return n
                } catch (e) {
                    return
                }
            },
            async getMyGroupInfo() {
                let e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : void 0;
                try {
                    let {payload: t} = await r.ok.get("/api/v4/daily-quiz/groups/mine", e);
                    return t
                } catch (e) {
                    return
                }
            }
        }

































let s = {
            startPage: () => "/",
            seterraLandingPage: () => "/quiz/seterra",
            seterraSectionPage: e => "/l/".concat(e),
            seterraGamePage: (e, t, n) => {
                let s = {
                    [r.ZF.Map]: "vgp",
                    [r.ZF.Flag]: "fl",
                    [r.ZF.Printable]: "pdf"
                }
                  , i = "/".concat(s[e], "/").concat(t);
                return n && (i += "?locale=".concat(n)),
                i
            }
            ,
            seterraCreateChallenge: (e, t, n) => {
                let r = new URLSearchParams;
                t && r.append("locale", t),
                n && r.append("duplicateChallenge", n);
                let s = r.size ? "?" + r.toString() : "";
                return "/quiz/seterra/challenge/create/".concat(e) + s
            }
            ,
            seterraEditChallenge: e => "/quiz/seterra/challenge/edit/".concat(e),
            seterraGameRedirect: e => "/quiz/seterra/game/".concat(e),
            seterraMyResults: () => "/quiz/seterra/me",
            seterraChallenge: (e, t) => {
                let n = "/quiz/seterra/challenge/".concat(e);
                return t && (n += "?locale=".concat(t)),
                n
            }
            ,
            trySeterra: () => "/quiz/try-seterra",
            challenge: function(e) {
                let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}
                  , n = new URLSearchParams(Object.entries(t).map(e => {
                    let[t,n] = e;
                    return [t, n.toString()]
                }
                ))
                  , r = n.toString().length > 0 ? "?".concat(n.toString()) : "";
                return "/challenge/".concat(e).concat(r)
            },
            results: (e, t) => "/results/".concat(e).concat(t ? "/?friends" : ""),
            map: e => "/maps/".concat(e),
            maps: e => "/maps".concat(e ? "?filter=".concat(e) : ""),
            mapsCommunity: () => "/maps/community",
            playMap: e => "/maps/".concat(e, "/play"),
            playChallenge: (e, t) => "/maps/".concat(e, "/play?challengeId=").concat(t),
            officialMaps: () => "/maps/official",
            search: e => e ? "/search?query=".concat(encodeURIComponent(e)) : "/search",
            game: (e, t) => "/game/".concat(e).concat(t ? "?shared" : ""),
            signupForPro: e => {
                let t = "/pro"
                  , n = new URLSearchParams(e);
                return n.toString().length > 0 ? "".concat(t, "?").concat(n.toString()) : t
            }
            ,
            manageSubscriptionTier: () => "/pro/manage",
            signedUpForPro: () => "/pro/thanks",
            dailyChallenges: () => "/daily-challenges",
            free: e => {
                let t = "/free"
                  , n = new URLSearchParams(e)
                  , r = (null == e ? void 0 : e.source) ? n.toString() : "";
                return r.toString().length > 0 ? "".concat(t, "?").concat(r.toString()) : t
            }
            ,
            freeStart: e => {
                let t = "/free/start"
                  , n = new URLSearchParams(e)
                  , r = (null == e ? void 0 : e.source) ? n.toString() : "";
                return r.toString().length > 0 ? "".concat(t, "?").concat(r.toString()) : t
            }
            ,
            freeGroup: e => "/free/group/".concat(e),
            user: e => "/user/".concat(e),
            signup: function() {
                let {target: e=""} = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
                return "/signup".concat(e ? "?target=".concat(encodeURIComponent(e)) : "")
            },
            signin: function() {
                let {target: e="", prefilledUsername: t=""} = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
                return "/signin".concat(e ? "?target=".concat(encodeURIComponent(e)).concat(t ? "&prefilledUsername=".concat(encodeURIComponent(t)) : "") : "")
            },
            signout: e => {
                let {target: t="", everywhere: n=!1} = e
                  , r = new URLSearchParams;
                t && r.append("target", t),
                n && r.append("everywhere", n.toString());
                let s = r.toString();
                return "/signout".concat(s ? "?".concat(s) : "")
            }
            ,
            verifyEmailDailyGame: () => "/verify-email",
            myProfile: () => "/me/profile",
            mySettings: e => "/me/settings".concat(e ? "#".concat(e) : ""),
            myActivities: () => "/me/activities",
            myOngoingGames: () => "/me/current",
            myFavoriteMaps: () => "/me/likes",
            myAchievements: () => "/me/achievements",
            myMaps: () => "/me/maps",
            myFriends: () => "/me/friends",
            streams: () => "/streams",
            invoice: e => "/me/invoices/".concat(e),
            mapMaker: e => "/map-maker".concat(e ? "/" + e : ""),
            mapMakerConflict: e => "/maps/".concat(e, "?mapConflict=true"),
            explorer: () => "/explorer",
            countryStreak: () => "/country-streak",
            usStateStreak: () => "/us-state-streak",
            communityStreaks: () => "/community-streaks",
            communityStreakMap: e => "/community-streaks/".concat(e),
            streaks: () => "/streaks",
            shopAvatar: (e, t) => e && t ? "/shop?id=".concat(e, "&type=").concat(t) : "/shop",
            shopCoins: () => "/shop/coins",
            shopCreator: e => {
                let t = "/shop/creator"
                  , n = new URLSearchParams(e);
                return n.toString().length > 0 ? "".concat(t, "?").concat(n.toString()) : t
            }
            ,
            shopWorldCup: e => e ? "/shop/world-championship?p=".concat(e) : "/shop/world-championship",
            merch: () => "/merch",
            merchStore: () => "https://shop.geoguessr.com",
            communityLanding: () => "/community/",
            communityMaps: e => e && "all-time-greats" !== e ? "/community/maps?filter=".concat(e) : "/community/maps",
            communityParties: () => "/community/parties",
            communityStreaks2: () => "/community/streaks",
            communityExtensions: () => "/community/extensions",
            communityCreators: () => "/community/creators",
            communityCreatorsConnection: e => "/community/creators/".concat(e),
            communityAwards: e => "/community/awards/".concat(null != e ? e : ""),
            support: () => "/support",
            supportHelpCenter: () => "/support/help-center",
            supportBugReports: () => "/support/bug-reports",
            supportFeatureRequests: () => "/support/feature-requests",
            supportFaq: e => "/support/faq".concat(e ? "#".concat(e) : ""),
            twitch: () => "https://www.twitch.tv/directory/game/GeoGuessr/",
            youtube: () => "https://www.youtube.com/embed?listType=search&list=geoguessr",
            giftCards: () => "/gift-card",
            redeemGiftCard: () => "/gift-card/redeem",
            emailData: () => "data@geoguessr.com",
            emailDaniel: () => "daniel@geoguessr.com",
            emailSubscription: () => "subscription@geoguessr.com",
            emailSupport: () => "support@geoguessr.com",
            emailSeterra: () => "hello@seterra.com",
            emailContent: () => "content@geoguessr.com",
            emailPaddle: () => "help@paddle.com",
            cannyPrivacy: () => "https://canny.io/privacy",
            cannyTerms: () => "https://canny.io/terms",
            privacy: () => "/privacy",
            terms: () => "/terms",
            helpCenter: () => "https://geoguessr.zendesk.com/hc/",
            helpCenterGameModes: () => "https://geoguessr.zendesk.com/hc/en-us/categories/360003342678-Game-Modes",
            helpCenterAccount: () => "https://geoguessr.zendesk.com/hc/en-us/categories/360003344837-Account-Subscription",
            faqSeterra: () => "https://geoguessr.zendesk.com/hc/en-us/categories/14501074520081-Seterra",
            verifyEmail: e => "/profile/verify-email/".concat(e),
            worldCup: e => "/world-championship".concat(e ? "/".concat(e) : ""),
            worldCupOpenMajor: () => "/world-championship/open-majors",
            worldCupPress: () => "/world-championship/press",
            worldCupFlashback: () => "/world-championship#challenge",
            worldCupHowItWorks: () => "/world-championship/how-it-works",
            organizations: () => "/organizations",
            olympics: () => "/olympictorchrelay",
            geocaching: () => "/geocaching",
            geocachingFinish: () => "/geocaching/finish",
            kingsDayChallenge: () => "/king",
            kingsDayChallengeGame: () => "/king/game",
            twitchChannel: () => "https://www.twitch.tv/GeoGuessr/",
            press: () => "/world-championship/press",
            pressKit: () => "https://design.geoguessr.com/press-kit/",
            tickster: () => "https://secure.tickster.com/en/2v4k9p3yy3g1xra",
            liveChallenge: e => "/live-challenge/".concat(e),
            quiz: () => "/quiz",
            featuredQuiz: () => "/quiz/browse",
            featuredQuizCategory: e => "/quiz/browse/".concat(e),
            customQuiz: () => "/quiz/custom",
            publicQuiz: () => "/quiz/community",
            officialQuiz: (e, t) => "/quiz/official/".concat(e).concat(t ? "?r=".concat(t) : ""),
            officialQuizPlay: e => "/quiz/official/play/".concat(e),
            quizDetailsPage: (e, t) => "/quiz/".concat(e).concat(t ? "?r=".concat(t) : ""),
            playGroupEvent: e => "/quiz/play/".concat(e),
            editGroupEvent: (e, t) => "/quiz/".concat(e, "/edit?shouldEditPublicQuiz=").concat(t),
            playUserQuiz: e => "/quiz/user/".concat(e),
            finishedGroupEvent: e => "/quiz/".concat(e, "/finished"),
            join: () => "/join",
            joinWithCode: (e, t) => "/join/".concat(e).concat(t ? "?s=".concat(t) : ""),
            gameLobby: (e, t) => {
                switch (t) {
                case "CompetitiveCityStreak":
                    return "/competitive-streak/".concat(e);
                case "BattleRoyaleCountries":
                case "BattleRoyaleDistance":
                    return "/battle-royale/".concat(e);
                case "Duels":
                    return "/duels/".concat(e);
                case "TeamDuels":
                    return "/team-duels/".concat(e);
                case "LiveChallenge":
                case "Quiz":
                    return "/live-challenge/".concat(e);
                case "Bullseye":
                    return "/bullseye/".concat(e);
                default:
                    throw Error("Invalid ".concat(t))
                }
            }
            ,
            multiplayer: () => "/multiplayer",
            multiplayerHowItWorksSolo: () => "/multiplayer/how-it-works",
            multiplayerRankedTeams: () => "/multiplayer/teams",
            multiplayerHowItWorksTeams: () => "/multiplayer/how-it-works-teams",
            multiplayerBattleRoyaleCountries: () => "/multiplayer/battle-royale-countries",
            multiplayerBattleRoyaleDistance: () => "/multiplayer/battle-royale-distance",
            multiplayerUnrankedTeams: () => "/multiplayer/unranked-teams",
            multiplayerOverwatch: () => "/multiplayer/investigations",
            multiplayerOverwatchCase: () => "/multiplayer/investigations/case",
            multiplayerOverwatchThankYou: () => "/multiplayer/investigations/thank-you",
            communityRules: () => "/community-rules",
            playWithFriends: () => "/play-with-friends",
            party: () => "/party",
            joinParty: e => "/party/".concat(e),
            parties: (e, t) => "/parties/".concat(e) + (t ? "?target=".concat(encodeURIComponent(t)) : ""),
            partySettings: e => "/parties/".concat(e, "?settings"),
            duelsGame: e => "/duels/".concat(encodeURIComponent(e)),
            duelsSummary: e => "/duels/".concat(e, "/summary"),
            duelsReplay: (e, t, n, r) => {
                let s = new URLSearchParams;
                void 0 !== t && s.append("player", t),
                void 0 !== n && s.append("round", n.toString()),
                void 0 !== r && s.append("step", r.toString());
                let i = s.toString();
                return "/duels/".concat(e, "/replay").concat(i ? "?" + i : "")
            }
            ,
            teamDuelsReplay: (e, t, n, r) => {
                let s = new URLSearchParams;
                void 0 !== t && s.append("player", t),
                void 0 !== n && s.append("round", n.toString()),
                void 0 !== r && s.append("step", r.toString());
                let i = s.toString();
                return "/team-duels/".concat(e, "/replay").concat(i ? "?" + i : "")
            }
            ,
            teamDuelsGame: e => "/team-duels/".concat(encodeURIComponent(e)),
            teamDuelsSummary: e => "/team-duels/".concat(e, "/summary"),
            googlePlayStore: (e, t) => "https://play.google.com/store/apps/details?id=com.geoguessr.app&referrer=utm_source%3Dgeoguessrcom%26utm_campaign%3D".concat(e || "", "%26utm_content%3D").concat(t || ""),
            appleAppStore: e => "https://apps.apple.com/app/apple-store/id1049876497?pt=117278574&mt=8&ct=".concat(e || ""),
            tournaments: () => "/multiplayer/tournaments",
            tournamentsHowItWorks: () => "/multiplayer/how-it-works-tournaments",
            tournament: e => "/tournaments/".concat(e),
            tournamentTier: (e, t) => "/tournaments/".concat(e, "/tiers/").concat(t),
            avatar: e => e ? "/avatar?t=".concat(e) : "/avatar",
            rematch: e => "/challenge/rematch/".concat(e),
            teams: e => e ? "/teams/".concat(e) : "/teams",
            brSummary: e => "/battle-royale/".concat(e, "/summary"),
            globetrotter: () => "/singleplayer/game",
            campaign: () => "/campaign",
            globetrotterSubmitJobQuiz: () => "/singleplayer/submit-job",
            userCreated: () => "/user-created",
            profile: () => "/profile",
            referralProgramGiver: () => "/referral-program",
            referralProgramReceiver: (e, t) => "/referral-program/".concat(e).concat(t ? "?s=".concat(t) : ""),
            matchmaking: e => e ? "/matchmaking?id=".concat(e) : "/matchmaking",
            spectateDuels: (e, t) => {
                let n = new URLSearchParams(t);
                n.delete("token"),
                n.delete("id");
                let r = n.toString() ? "?".concat(n.toString()) : "";
                return "/duels/".concat(e, "/spectate").concat(r)
            }
            ,
            courses: () => "/courses",
            coursesCourse: e => "/courses/course/".concat(e),
            coursesCourseExamQuiz: e => "/courses/exam/subset-quiz/".concat(e),
            coursesClassQuiz: e => "/courses/class/quiz/".concat(e),
            playAlong: e => "/play-along/".concat(e),
            playAlongLobby: e => "/play-along/lobby/".concat(e),
            msTeamsParty: e => "/ms-teams/".concat(e),
            msTeamsJoin: () => "/ms-teams",
            worldLeagueMatch: (e, t) => {
                let n = new URLSearchParams(t);
                n.delete("token"),
                n.delete("id");
                let r = n.toString() ? "?".concat(n.toString()) : "";
                return "/world-league/match/".concat(e).concat(r)
            }
            ,
            gameClientAuth: () => "/game-client-auth",
            steamClient: () => "/steam/client",
            steamClientConnect: () => "/steam/connect",
            steamHome: () => "/steam/home",
            steamCreateOrConnect: () => "/steam/create-or-connect",
            steamAvatar: (e, t) => {
                let n = new URLSearchParams;
                void 0 !== e && n.append("tierName", e),
                void 0 !== t && n.append("onboarding", t.toString());
                let r = n.toString();
                return "/steam/avatar/".concat(r ? "?" + r : "")
            }
            ,
            steamTeams: e => "/steam/teams".concat(e ? "/".concat(e) : ""),
            steamUpgrade: () => "/steam/upgrade",
            steamInviteLobby: e => {
                let {geoGuessrId: t="", steamId: n=""} = e
                  , r = new URLSearchParams({
                    geoGuessrId: t,
                    steamId: n
                });
                return "/steam/teams/invite-lobby?".concat(r.toString())
            }
            ,
            arkadiumGame: () => "/arkadium/game",
            arkadiumExit: () => "/arkadium/exit",
            steamPostGame: e => "/steam/post-game/".concat(e),
            playJetBlueQuiz: e => "/jetblue/play/".concat(e),
            startJetBlueQuiz: e => "/jetblue/".concat(e)
        }
    }

*/