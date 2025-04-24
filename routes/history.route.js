const router = require('express').Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')

router.get("/KPIs", ensureAuth, async(req,res)=>{
  res.render('pages/wip.view.ejs', {user:req.user, title: 'KPIs'})
})

router.get("/games", ensureAuth, async(req,res)=>{
  res.render('pages/wip.view.ejs', {user:req.user, title: 'games'})
})

router.get("/rivals", ensureAuth, async(req,res)=>{
  res.render('pages/wip.view.ejs', {user:req.user, title: 'rivals'})
})

module.exports=router;