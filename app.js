const express = require('express');
const mongoose=require('mongoose');
const dotenv = require('dotenv')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)


var app=express();
const PORT = process.env.PORT||3100;
dotenv.config({ path: './config/config.env' })

mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser:true,
    useUnifiedTopology: true
})

// Passport config
require('./config/passport')(passport)



// Middleware
app.use(express.urlencoded({extended:true}))
app.use(express.static('./public'))

app.set('view engine','ejs');

app.use(
    session({
      secret: 'aytfguhiuytghuygtftyuiopmlkjhgfdspoiuyghjytfghjjtuyuyfkuyf',
      resave: false,
      saveUninitialized: false,
      store: new MongoStore({ mongooseConnection: mongoose.connection }),
    })
  )

  // Passport middleware
app.use(passport.initialize())
app.use(passport.session())

app.use(require("./routes/index.route"))
app.use('/auth', require('./routes/auth.route'))
app.use('/scrap', require('./routes/scrap.route'))
app.use('/scrap/getgamedetails', require('./routes/getgamedetails.route'))
app.use('/history', require('./routes/history.route'))
app.use('/training', require('./routes/training.route'))

app.listen(PORT,console.log(`listening at ${PORT}`))
