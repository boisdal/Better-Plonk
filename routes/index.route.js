const router = require('express').Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')

router.get('/', ensureGuest ,(req, res) => {
    res.render('pages/login.view.ejs')
  })

router.get("/home", ensureAuth, async(req,res)=>{
  // TODO: traiter absence de projets avec page spéciale
  res.render('pages/home.view.ejs', {user:req.user})
})
module.exports=router;