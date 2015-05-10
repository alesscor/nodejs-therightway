'use strict';
const

  log = require('npmlog'),
  request = require('request'),

  express = require('express'),
  logger = require("morgan"),
  passport = require('passport'),
  app = express(),

  redisClient = require('redis').createClient(),
  RedisStore = require('connect-redis')(express),
  /**
   * changes related to changing into passport-google-oauth2
   * are labeled #passport-google-oauth2
   */
  GoogleStrategy = require('passport-google-oauth2').Strategy; // #passport-google-oauth2

redisClient
  .on('ready', function() { log.info('REDIS', 'ready'); })
  .on('error', function(err) { log.error('REDIS', err.message); });

passport.serializeUser(function(user, done) {
  done(null, user.identifier);
});
passport.deserializeUser(function(identifier, done) {
  done(null, { identifier: identifier });
});
/***** #passport-google-oauth2 vv *****/
passport.use(new GoogleStrategy({
    clientID: "a_specific_clientID",
    clientSecret: "a_specific_clientSecret",
    callbackURL: "http://127.0.0.1:3000/auth/google/callback",
    passReqToCallback:true
  },
  function(request, accessToken, refreshToken, profile, done) {
      profile.identifier=profile.id;
      return done(null, profile);
  }
));
/***** #passport-google-oauth2 ^^ *****/




app.use(logger('dev'));
app.use(express.cookieParser());
app.use(express.session({
  secret: 'unguessable',
  store: new RedisStore({
    client: redisClient
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/static'));
app.use(express.static(__dirname + '/bower_components'));

const config = {
  bookdb: 'http://localhost:5984/books/',
  b4db: 'http://localhost:5984/b4/'
};
require('./lib/book-search.js')(config, app);
require('./lib/field-search.js')(config, app);
require('./lib/bundle.js')(config, app);

/*****  #passport-google-oauth2 vv    *****/
app.get('/auth/google',
  passport.authenticate('google', { successRedirect: '/',scope:
    [ 'https://www.googleapis.com/auth/userinfo.email']})
);
app.get( '/auth/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/',
        failureRedirect: '/'
}));
/*****  #passport-google-oauth2 ^^    *****/
app.get('/auth/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

const authed = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else if (redisClient.ready) {
    res.json(403, {
      error: "forbidden",
      reason: "not_authenticated"
    });
  } else {
    res.json(503, {
      error: "service_unavailable",
      reason: "authentication_unavailable"
    });
  }
};

app.get('/api/user', authed, function(req, res){
  res.json(req.user);
});

app.get('/api/user/bundles', authed, function(req, res) {
  let userURL = config.b4db + encodeURIComponent(req.user.identifier);
  request(userURL, function(err, couchRes, body) {
    if (err) {
      res.json(502, { error: "bad_gateway", reason: err.code });
    } else if (couchRes.statusCode === 200) {
      res.json(JSON.parse(body).bundles || {});
    } else {
      res.send(couchRes.statusCode, body);
    }
  });
});

app.put('/api/user/bundles', [authed, express.json()], function(req, res) {
  let userURL = config.b4db + encodeURIComponent(req.user.identifier);
  request(userURL, function(err, couchRes, body) {
    if (err) {
      res.json(502, { error: "bad_gateway", reason: err.code });
    } else if (couchRes.statusCode === 200) {
      let user = JSON.parse(body);
      user.bundles = req.body;
      request.put({ url: userURL, json: user }).pipe(res);
    } else if (couchRes.statusCode === 404) {
      let user = { bundles: req.body };
      request.put({ url: userURL,  json: user }).pipe(res);
    } else {
      res.send(couchRes.statusCode, body);
    }
  });
});

app.listen(3000, function(){
  console.log("ready captain.");
});

