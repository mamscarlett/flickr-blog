var Sequelize = require('sequelize'),
  q = require('q');

module.exports = function (sequelize) {
  var Photo = sequelize.define('Photo', {
    orig_id: Sequelize.STRING,
    title: Sequelize.STRING,
    tags: Sequelize.STRING,
    media: Sequelize.STRING,
    url_sq: Sequelize.STRING,
    url_t: Sequelize.STRING,
    url_s: Sequelize.STRING,
    url_m: Sequelize.STRING,
    url_o: Sequelize.STRING,
    is_primary: Sequelize.BOOLEAN
  });

  Photo.saveFromFlick = function (data, set) {
    var deferred = q.defer(),
      photoEntity;

    Photo
      .find({ where: {orig_id: data.id } })
      .complete(function (err, photo) {
        if (err) {
          return deferred.reject(err);
        }
        if (!photo) {
          photo = Photo.build();
        }
        photo.photoset_id = data.id;
        photo.orig_id = data.id;
        photo.title = data.title;
        photo.tags = data.tags;
        photo.url_sq = data.url_sq;
        photo.url_t = data.url_t;
        photo.url_s = data.url_s;
        photo.url_m = data.url_m;
        photo.url_o = data.url_;
        photo.is_primary = !!data.isprimary;
        photo.save()
        .complete(function (err, photo) {
          if (err) {
            return deferred.reject(err);
          }
          photoEntity = photo;
          return set.addPhoto(photoEntity);
        })
        .complete(function (err, photo) {
          if (err) {
            return deferred.reject(err);
          }
          deferred.resolve(photoEntity);
        });
      });

    return deferred.promise;
  };

  Photo.getPhotoSetThumb = function (photosetId) {
    var deferred = q.defer();

    Photo.find({
        where: Sequelize.and(
          { photoset_id: photosetId },
          { is_primary: true }
        )
      })
      .then(function (photo) {
        if (!photo) {
          deferred.resolve(null);
        } else {
          console.error(photo.getPhotoSet());
          deferred.resolve(photo.dataValues);
        }
      });

    return deferred.promise;
  };

  return Photo;
};
