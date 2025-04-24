const router = require('express').Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')

router.get("/data", ensureAuth, async(req,res)=>{
  res.render('pages/scrapdata.view.ejs', {user:req.user})
})

router.get("/settings", ensureAuth, async(req,res)=>{
  res.render('pages/wip.view.ejs', {user:req.user, title: 'settings'})
})

module.exports=router;