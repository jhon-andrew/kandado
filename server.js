// Dependencies
const express = require('express')
const bodyParser = require('body-parser')
const Datastore = require('nedb')
const kandado = require('kandado')

// Initializations
let app = express()
let db = new Datastore({ filename: 'database/users.db', autoload: true })
let auth = kandado('https://github.com/jhon-andrew/kandado') // In this test, I set the repo link as the secret key. 'Note': it should really be a secret. Lol.

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// Public route, anyone can access
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the API!'
  })
})

// Signup route
app.post('/signup', (req, res) => {
  // Insert user data to Database. 'Note': it is not a good practice to store unencrypted passwords. You should also check for duplicates
  db.insert(req.body, (err, data) => {
    if (err) throw err
    res.json({
      'message': `${req.body.username} has successfully registered.`,
      data // Short for {data: data}
    })
  })
})

// Login route, where the authentication and generating of token happens..
app.post('/login', (req, res) => {
  // Find `username` from database
  db.findOne({username: req.body.username}, (err, user) => {
    if (err) throw err

    if (user && user.password === req.body.password) {
      // If user exist and password match, generate a valid token from the `user` data
      auth.generateToken(user).then(token => {
        // Return token to client
        res.json({
          'message': `Welcome ${user.profileName}`,
          'access_token': token
        })
      })
    } else {
      // If user doesn't exist or password is incorrect
      res.json({
        'message': 'Username and/or password is incorrect.'
      })
    }
  })
})

// Users-list route, this will be require a token either from HTTP GET or POST
app.get('/users', auth.required, (req, res) => {
  // Get the list of users from the database
  db.find({}, (err, users) => {
    if (err) throw err

    // 'Note': It is not a good practice to show a list of users including their password
    res.json({
      // When a token is valid, its decrypted value is accessible at `req.authData`
      'message': `Welcome ${req.authData.profileName}. Here is the list of users:`,
      users, // Short for {users: users},
      authData: req.authData
    })
  })
})

// Initialize server...
app.listen(3000, () => {
  console.log('Server is live at localhost:3000')
})
