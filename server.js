const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
var Cookies = require('cookies')
const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./database/main.db')


// settings
const port = 80
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))
app.use(cookieParser('secret ecdc0f6bb1a12b909faf9ec54262f3a5'))

async function db_all(query){
  return new Promise(function(resolve,reject){
      db.all(query, function(err,rows){
         if(err){return reject(err);}
         resolve(rows);
       });
  });
}

//Routes for main url

app.use( async (req,res, next) => {
  let sqlInfoUser = ''
  let infoUser=''

  if(typeof req.signedCookies.level_user !== 'undefined'){
    tempLevel = req.signedCookies.level_user
  }else{
    tempLevel = 0
  }

  if(typeof req.signedCookies.login_user !== 'undefined'){
    tempLogin = req.signedCookies.login_user
  }else{
    tempLogin = 0
  }

  if(typeof req.signedCookies.id_user !== 'undefined'){
    tempId = req.signedCookies.id_user
    sqlInfoUser = "SELECT img FROM users WHERE id="+ req.signedCookies.id_user +""
    infoUser = await db_all(sqlInfoUser)
  }else{
    tempId = 0
  }

  if(typeof req.signedCookies.token_user !== 'undefined'){
    tempToken = req.signedCookies.token_user
  }else{
    tempToken = 0
  }

  res.locals = {
    title: 'Forum',
    token: tempToken,
    level: tempLevel,
    login: tempLogin,
    id: tempId,
    imgUser: infoUser
  }
  next()
})

app.get('/', async (req, res) => {  
  res.render('index', {title: 'Forum || Home', page: 'Home', homePage: 'home-header', token: req.signedCookies.token_user})
})

app.get('/sign-out', (req, res) => {
  res.clearCookie('id_user')
  res.clearCookie('token_user')
  res.clearCookie('level_user')
  res.clearCookie('login_user')
  return res.redirect('/')
})


//Routers for server

const searchRouter = require('./routes/search')
app.use('/search', searchRouter)

const forumRouter = require('./routes/forum')
app.use('/forum', forumRouter)

const newsRouter = require('./routes/news')
app.use('/news', newsRouter)

const signUpRouter = require('./routes/signUp')
app.use('/sign-up', signUpRouter)
app.use('/sign-up/confirm', signUpRouter)

const signInRouter = require('./routes/signIn')
app.use('/sign-in', signInRouter)

const createRouter = require('./routes/makeNew')
app.use('/create', createRouter)

const userRouter = require('./routes/profile')
app.use('/profile', userRouter)

const confirmationRouter = require('./routes/confirmation')
app.use('/profile/confirmation', confirmationRouter)

//page 404

app.get('/:any', (req, res) => {
  res.render('index', { title: 'Forum | Error', page: 'Error', homePage: 'home-header'})
})

app.get('/news/:any', (req, res) => {
  res.render('index', { title: 'Forum | Error', page: 'Error', homePage: 'home-header'})
})

app.get('/news/item/:any', (req, res) => {
  res.render('index', { title: 'Forum | Error', page: 'Error', homePage: 'home-header'})
})

//Server start

app.listen(port, () => console.log(`App listening on port ${port}!`))