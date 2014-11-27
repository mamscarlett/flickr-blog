var database = require('../core/database'),
  PhotoSet = require('./viewModels/photoset.js');

module.exports = function (app) {
  var photosets;
  app.get('/', home);
  app.get('/page-:page', home);
  app.get(/^\/([0-9]{4})\/([0-9]{2})\/([^\/]+)\.html/, function (req, res, next) {
    var year = +req.params[0],
      month = +req.params[1],
      slug = req.params[2],
      photoset, photos;

    PhotoSet
      .getFromSlug(slug)
      .then(function (data) {
        photoset = data;
        if (photoset.date_create.getFullYear() !== year ||
            photoset.date_create.getMonth() !== month) {
          res.redirect(photoset.getUrl());
          throw 'redirect';
        }
        return data.getPhotos();
      })
      .then(function (data) {
        photos = data;
        res.render('photoset', {
          photoset: photoset,
          photos: photos
        });
      })
      .catch(function (err) {
        if (err !== 'redirect') {
          res.render('error', {
            error: err.message
          });
        }
      });
  });
};

function home (req, res) {
  var page = req.params.page || 1,
    perPage = 10;

  PhotoSet
    .getAllWithPrimaryPhoto({
      page: page,
      perPage: perPage
    })
    .then(function (data) {
      photosets = data;
      return PhotoSet.count();
    })
    .then(function (count) {
      res.render('home', {
        photosets: photosets,
        count: count,
        page: page,
        perPage: perPage
      });
    });
}
