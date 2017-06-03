# kandado

Kandado is a simple token-based authentication middleware using [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) made for [ExpressJS](https://github.com/expressjs/express). The name is a [filipino word for 'lock'](https://translate.google.com.ph/#auto/en/kandado).

---
## Install

```bash
$ npm install kandado --save
```

## Setup

```js
// Require module
const kandado = require('kandado')

// Initialize by setting the 'secret key'
let auth = kandado('aSecretKeyThatOnlyYouWhoKnows')
```
See [`jsonwebtoken`](https://github.com/auth0/node-jsonwebtoken#jsonwebtoken) for more information about secret key.

## Usage

### auth.required
```js
// require express, body-parser, kandado, and other dependencies...

let app = express()
let auth = kandado('aSecretKeyThatOnlyYouWhoKnows')

// A public route, anyone can access
app.get('/', (req, res) => {
	res.send('Welcome to the API!')
})

// A private route, a valid token will be required either from GET or POST
app.get('/account', auth.required, (req, res) => {
	res.json({
		message: 'You are now authenticated!',
		userSessionData: req.authData
	})
})
```
The `auth.required` is a middleware that checks the HTTP [GET](http://expressjs.com/en/4x/api.html#req.query) or [POST](http://expressjs.com/en/4x/api.html#req.body) for the `token` variable. If its undefined, it will require a token thus redirects to [`requireToken`](#requiretoken) middleware. Else, it will validate the given token.

If the given token is invalid, the route will redirect to the [`failedAuth`](#failedauth) middleware. Else, it will proceed to the route function and the decrypted data from the token is accessible at `req.authData`.

---
### auth.generateToken(data[, tokenOptions])
```js
// Authenticate a user and generate a valid token
app.post('/login', (req, res) => {
	// validate your user however you want
	if(username === true && password === true) {
		// if the user is authorized generate a valid token
		auth.generateToken({userSessionData}).then(token => {
			// return token to the client-side
			res.json({ 'access_token': token })
		})
	} else {
		res.send('User is not authorized.')
	}
})
```
The `auth.generateToken()` function accepts two parameters which is `data` or the _payload_ to be encrypted and an optional `tokenOptions` to configure the generating of the token. See [`jsonwebtoken`](https://github.com/auth0/node-jsonwebtoken#jsonwebtoken)'s [`jwt.sign()`](https://github.com/auth0/node-jsonwebtoken#jwtsignpayload-secretorprivatekey-options-callback) function for the complete _options_ available.

This will return a _promise_ with the `token` as the resolved value which is ideally to be sent back to the client.

## Fallback Middlewares

### requireToken
```js
function (req, res, next) {
	res.json({ 'error': 'token_required' })
}
```
This middleware gets called when there is no `token` provided to the protected (`auth.required`) route. It returns a json `{'error': 'token_required'}`

### failedAuth
```js
function (req, res, next) {
	res.json({ 'error': 'token_invalid' })
}
```
This middleware gets called when the `token` is invalid or has already expired. It returns a json `{'error': 'token_invalid'}`

---
__Protip:__ If you're going to override the fallback middlewares, detailed information of the error is accessible at `req.authError`.

---

## Options

### tokenExpiration
__Default:__ '24h'

Set expiration of a generated token.

---

See [`jsonwebtoken`](https://github.com/auth0/node-jsonwebtoken#jsonwebtoken)'s [`jwt.sign()`](https://github.com/auth0/node-jsonwebtoken#jwtsignpayload-secretorprivatekey-options-callback) function for the complete _options_ available; and [`auth.generateToken()`](#auth-generatetoken-data-tokenoptions-) on how to apply them.

---

__Protip:__ If you want to override the `tokenExpiration` option or the `requireToken` and `failedAuth` fallback middlewares, you can use the built-in config _setter_ and _getter_.

Example:
```js
/* tokenExpiration - see jsonwebtoken or zeit/ms for valid values
 * https://github.com/zeit/ms
 */
auth.set('tokenExpiration', '24h')

// requireToken
auth.set('requireToken', (req, res) => {
	res.json({
		'message': 'This is a modified requireToken middleware.',
		'moreErrorData': req.authError
	})
})

// failedAuth
auth.set('failedAuth', (req, res) => {
	res.json({
		'message': 'This is a modified failedAuth middleware.',
		'moreErrorData': req.authError
	})
})

// Random data you might need to keep and get
auth.set('kandado', 'is awesome!')
auth.get('kandado') //returns 'is awesome!'
```

---

## Reference

* ExpressJS - https://github.com/expressjs/express
* jsonwebtoken - https://github.com/auth0/node-jsonwebtoken
