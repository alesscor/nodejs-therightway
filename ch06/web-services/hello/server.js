#!/usr/bin/env node --harmony
/***
 * Excerpted from "Node.js the Right Way",
 * published by The Pragmatic Bookshelf.
 * Copyrights apply to this code. It may not be used to create training material,
 * courses, books, articles, and the like. Contact us if you are in doubt.
 * We make no guarantees that this code is fit for any purpose.
 * Visit http://www.pragmaticprogrammer.com/titles/jwnode for more book information.
***/
'use strict';
const
  express = require('express'),
  logger = require('morgan'),
  app = express();
// adds "dev" logger to show every request
app.use(logger('dev'));
// instructs how to handle HTTP GET requests to the given path
app.get('/api/:name', function(req, res) {
  res.json(200, { "hello": req.params.name });
});
app.listen(3000, function(){
  console.log("ready captain.");
});

