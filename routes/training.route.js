const router = require('express').Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')

router.get("/data", ensureAuth, async(req,res)=>{
  res.render('pages/home.view.ejs', {user:req.user})
})

router.get("/settings", ensureAuth, async(req,res)=>{
  res.render('pages/home.view.ejs', {user:req.user})
})

module.exports=router;