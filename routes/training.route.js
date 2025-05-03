const router = require('express').Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')

router.get("/blunders", ensureAuth, async(req,res)=>{
  res.render('pages/wip.view.ejs', {user:req.user, title: 'Blunders'})
})

router.get("/countries", ensureAuth, async(req,res)=>{
  res.render('pages/wip.view.ejs', {user:req.user, title: 'Countries'})
})

router.get("/patterns", ensureAuth, async(req,res)=>{
  res.render('pages/wip.view.ejs', {user:req.user, title: 'Patterns'})
})

module.exports=router;