var auth = require('./auth').middleware,
  flickr = require('../core/flickr'),
  database = require('../core/database'),
  config = require('../config.json'),
  sync = require('../core/sync'),
  q = require('q');

module.exports = function (app) {
  var Config,
    syncing = false;
  database
    .init()
    .then(function (database) {
      Config = database.Config;
    });

  app.get('/settings', auth, function (req, res) {
    var collections,
      config = {};

    q.all([
        flickr
          .client()
          .then(function (client) {
            return client.getCollectionData();
          })
          .then(function (data) {
            return data.map(function (collection) {
              return {
                id: collection.id,
                title: collection.title,
                description: collection.description,
                photosets: collection.set.length,
                picture: collection.iconsmall
              };
            });
          }),
        Config
          .get('url'),
        Config
          .get('collectionId'),
        Config
          .get('coverTag')
      ])
      .then(function (data) {
        collections = data[0];
        config.url = data[1];
        config.collectionId = data[2];
        config.coverTag = data[3];
        res.render('admin/settings', {
          user: req.user,
          config: config,
          collections: collections
        });
      })
      .catch(function (err) {
        res.render('error', {
          error: err.message || err
        });
      });
  });

  app.post('/settings', auth, function (req, res) {
    Config.set({
        url: req.body.url,
        collectionId: req.body.collectionId,
        coverTag: req.body.coverTag
      })
    .then(function () {
      flickr
        .client()
        .then(function (client) {
          syncing = true;
          res.redirect('/settings');
          return sync(flickr);
        })
        .then(function () {
          syncing = false;
        });
    })
    .catch(function (err) {
      res.render('error', {
        error: err.message || err
      });
    });
  });

  app.get('/settings/syncing', auth, function (req, res) {
    res.send({syncing: syncing});
  });
};
