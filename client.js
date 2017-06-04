// Dependencies
const request = require('request')

// Mimic jQuery's $.get and $.post functions to easily understand how to do it client-side
let $ = {
  get (url, qs = {}, callback) {
    request.get({url, qs}, (err, httpResp, data) => {
      if (err) throw err
      callback(JSON.parse(data))
    })
  },
  post (url, form = {}, callback) {
    request.post({url, form}, (err, httpResp, data) => {
      if (err) throw err
      callback(JSON.parse(data))
    })
  }
}

/* TESTING PHASE */

Promise.all([
  // TEST #01: Access public route
  new Promise((resolve, reject) => {
    $.get('http://127.0.0.1:3000/', {}, function (data) {
      /* Expected result:
       * {message: 'Welcome to the API!'}
       */
      resolve({test: '#01: Accessing public route:', data})
    })
  }),

  // TEST #02: Sample signup user data
  new Promise((resolve, reject) => {
    let signupUserData = {
      username: 'jhon-andrew',
      password: '1234567890',
      profileName: 'Jhon Andrew',
      accessLevel: 'administrator'
    }

    // Signing up an account
    $.post('http://127.0.0.1:3000/signup', signupUserData, function (data) {
      /* Expected result:
       * {
       *  'message': `jhon-andrew has successfully registered.`,
       *  'data': {
       *    _id: '513boj24a9',
       *    username: 'developer',
       *    password: '1234567890',
       *    profileName: 'Jhon Andrew'
       *  }
       * }
       */
      resolve({test: '#02: Signing up an account:', data})
    })
  }),

  // TEST #03: Login account and get a valid token
  new Promise((resolve, reject) => {
    // Sample login user data
    let loginUserData = {
      username: 'jhon-andrew',
      password: '1234567890'
    }

    $.post('http://127.0.0.1:3000/login', loginUserData, function (data) {
      /* Expected result:
       * {
       *   'message': `Welcome Jhon Andrew`,
       *   'access_token': 'abcdef_sample_randomCharacters_valid_token'
       * }
       */
      resolve({test: '#03: Login and request token:', data})
    })
  }),

  // TEST #04: Access users-list route without a token
  new Promise((resolve, reject) => {
    $.get('http://127.0.0.1:3000/users', {}, function (data) {
      /* Expected result:
       * { 'error': 'token_required' }
       *
       * See `requireToken` fallback-middleware on how to modify this result
       * https://github.com/jhon-andrew/kandado#requiretoken
       */
      resolve({test: '#04: Accessing users-list route without a token:', data})
    })
  }),

  // TEST #05: Access users-list route with an invalid token
  new Promise((resolve, reject) => {
    $.get('http://127.0.0.1:3000/users', {token: 'abcdef_sample_invalid_token'}, function (data) {
      /* Expected result:
       * { 'error': 'token_invalid' }
       *
       * See `failedAuth` fallback-middleware on how to modify this result
       * https://github.com/jhon-andrew/kandado#failedauth
       */
      resolve({test: '#05: Accessing users-list route with an invalid token:', data})
    })
  }),

  // TEST #06: Access users-list route with a valid token
  new Promise((resolve, reject) => {
    // This token is encrypted using the repo's link as the secret key: https://github.com/jhon-andrew/kandado
    // and is valid until the next 1000 years. This is for testing purpose only.
    let validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Impob24tYW5kcmV3IiwicGFzc3dvcmQiOiIxMjM0NTY3ODkwIiwicHJvZmlsZU5hbWUiOiJKaG9uIEFuZHJldyIsImFjY2Vzc0xldmVsIjoiYWRtaW5pc3RyYXRvciIsIl9pZCI6InJGcHNCQW0wWU5ENmJ3ZmoiLCJpYXQiOjE0OTY1NjIzNjIsImV4cCI6MzMwNTQxNjIzNjJ9.7Dc8-FnHJJMHKcvIVRmqU-aGQB3d8j096yYHol0IoZg'

    $.get('http://127.0.0.1:3000/users', {token: validToken}, function (data) {
      /* Expected result:
       * {
       *   'message': 'Welcome Jhon Andrew. Here is the list of users:',
       *   'users': { ...an array of users... }
       * }
       */
      resolve({test: '#06: Accessing users-list route with a valid token:', data})
    })
  })

]).then(results => {
  results.forEach(result => {
    console.log('TEST', result.test)
    console.log(result.data)
    console.log('---------------------------------------------------')
  })
})
