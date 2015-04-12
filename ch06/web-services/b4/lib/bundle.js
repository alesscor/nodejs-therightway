/**
 * book bundle API
 */
'use strict';

const
  Q = require('q'),
  request = require('request');

module.exports = function(config, app) {

  /**
   * create a new bundle with the specified name
   * curl -X POST http://localhost:3000/api/bundle?name=<name>
   */
  app.post('/api/bundle', function(req, res) {
    let deferred = Q.defer();
    request.post({
      url: config.b4db,
      json: { type: 'bundle', name: req.query.name, books: {} }
    }, function(err, couchRes, body) {
      // delegates the result with "deferred"
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve([couchRes, body]);
      }
    });

    deferred.promise.then(function(args) {
      let couchRes = args[0], body = args[1];
      res.status(couchRes.statusCode).json(body);
    }, function(err) {
      res.status(502).json({ error: "bad_gateway", reason: err.code });
    });
  });

  /**
   * get a given bundle
   * curl -X GET http://localhost:3000/api/bundle/<id>
   */
  app.get('/api/bundle/:id', function(req, res) {
    Q.nfcall(request.get, config.b4db + '/' + req.params.id)
      .then(function(args) {
        let couchRes = args[0], bundle = JSON.parse(args[1]);
        res.status(couchRes.statusCode).json(bundle);
      }, function(err) {
        res.status(502).json({ error: "bad_gateway", reason: err.code });
      })
      .done();
  });

  /**
   * set the specified bundle's name with the specified name
   * curl -X PUT http://localhost:3000/api/bundle/<id>/name/<name>
   */
  app.put('/api/bundle/:id/name/:name', function(req, res) {
    Q.nfcall(request.get, config.b4db + '/' + req.params.id)
      .then(function(args) {
        let couchRes = args[0], bundle = JSON.parse(args[1]);
        if (couchRes.statusCode !== 200) {
          return [couchRes, bundle];
        }

        bundle.name = req.params.name;
        return Q.nfcall(request.put, {
          url: config.b4db + '/' + req.params.id,
          json: bundle
        });
      })
      .then(function(args) {
        let couchRes = args[0], body = args[1];
        res.status(couchRes.statusCode).json(body);
      })
      .catch(function(err) {
        res.status(502).json({ error: "bad_gateway", reason: err.code });
      })
      .done();
  });

  /**
   * put a book into a bundle by its id
   * curl -X PUT http://localhost:3000/api/bundle/<id>/book/<pgid>
   */
  app.put('/api/bundle/:id/book/:pgid', function(req, res) {

    let
      /*
        "denodify" functions to make them able to produce promises
       */
      get = Q.denodeify(request.get),
      put = Q.denodeify(request.put);

      /*
        declares and runs a function generator, look it starts with `).()`
      */
    Q.async(function* (){
      let args, couchRes, bundle, book;

      // grab the bundle from the b4 database
      /*
        Q will wait for the promise to resolve, then use the resolved values
        that come inside args (see that no then required but "yielding a
        denodeified" function into a generator function)
       */
      args = yield get(config.b4db + req.params.id);
      couchRes = args[0];
      bundle = JSON.parse(args[1]);

      // fail fast if we couldn't retrieve the bundle
      if (couchRes.statusCode !== 200) {
        res.status(couchRes.statusCode).json(bundle);
        return;
      }

      // look up the book by its Project Gutenberg ID
      args = yield get(config.bookdb + req.params.pgid);
      couchRes = args[0];
      book = JSON.parse(args[1]);

      // fail fast if we couldn't retrieve the book
      if (couchRes.statusCode !== 200) {
        res.status(couchRes.statusCode).json(book);
        return;
      }

      // add the book to the bundle and put it back in CouchDB
      bundle.books[book._id] = book.title;
      args = yield put({url: config.b4db + bundle._id, json: bundle});
      res.json(args[0].statusCode, args[1]);

    })()
    .catch(function(err) {
      res.status(502).json({ error: "bad_gateway", reason: err.code });
    });
  });

  /**
   * remove a book from a bundle
   * curl -X DELETE http://localhost:3000/api/bundle/<id>/book/<pgid>
   */
  app.delete('/api/bundle/:id/book/:pgid', function(req, res) {
    Q.async(function* (){

      let
        args = yield Q.nfcall(request, config.b4db + req.params.id),
        couchRes = args[0],
        bundle = JSON.parse(args[1]);

      // fail fast if we couldn't retrieve the bundle
      if (couchRes.statusCode !== 200) {
        res.status(couchRes.statusCode).json(bundle);
        return;
      }

      // fail if the bundle doesn't already have that book
      if (!(req.params.pgid in bundle.books)) {
        res.status(409).json({
          error: "conflict",
          reason: "Bundle does not contain that book."
        });
        return;
      }

      // remove the book from the bundle
      delete bundle.books[req.params.pgid];

      // put the updated bundle back into CouchDB
      request.put({ url: config.b4db + bundle._id, json: bundle }).pipe(res);

    })()
    .catch(function(err) {
      res.status(502).json({ error: "bad_gateway", reason: err.code });
    });
  });

};

