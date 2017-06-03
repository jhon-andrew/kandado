// jsonwebtoken - https://www.npmjs.com/package/jsonwebtoken
const jwt = require('jsonwebtoken')

// kandado - https://github.com/jhon-andrew/kandado
function kandado (secret) {
  // Default Options
  let config = {
    // Token Expiration
    tokenExpiration: '24h',
    // Require Token middleware
    requireToken (req, res, next) {
      res.json({ 'error': 'token_required' })
    },
    // Failed Authentication middleware
    failedAuth (req, res, next) {
      res.json({ 'error': 'token_invalid' })
    }
  }

  return {
    // Config setter
    set (key, value) {
      config[key] = value
    },
    // Config getter (just in-case you need it)
    get (key) {
      return config[key]
    },
    // Token Generator
    generateToken (data, tokenOptions = {}) {
      // Default Token Options
      tokenOptions.expiresIn = config.tokenExpiration

      return new Promise((resolve, reject) => {
        // Encrypt `data` using the given `secret` key
        jwt.sign(data, secret, tokenOptions, (err, token) => {
          if (err) reject(err)
          else resolve(token)
        })
      })
    },
    // Authentication Middleware
    required (req, res, next) {
      // Check GET (req.query) or POST (req.body) data for the 'token' key
      let token = req.query.token || req.body.token

      if (!token) {
        // If no token was passed, proceed to 'requireToken' middleware
        config.requireToken(req, res, next)
      } else {
        // Else, verify 'token' using the given `secret` key
        jwt.verify(token, secret, (err, data) => {
          if (err) {
            // If token is invalid, pass `err` data to `req.authError`...
            req.authError = err
            // then proceed to `failedAuth` middleware
            config.failedAuth(req, res, next)
          } else {
            // Else if token is valid, pass decrypted `data` to `req.authData`...
            req.authData = data
            // then proceed to the next middleware or router callback
            next()
          }
        })
      }
    }
  }
}

module.exports = kandado
