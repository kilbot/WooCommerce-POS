var bb = require('backbone');
var _ = require('lodash');

/* jshint -W074 */
module.exports = function(method, entity, options) {
  options = options || {};
  var isModel = entity instanceof bb.Model;

  return entity.db.open()
    .then(function () {
      var data;
      switch (method) {
        case 'read':
          if (isModel) {
            return entity.db.get(entity.id);
          }
          data = _.clone(options.data);
          return entity.db.getBatch(data);
        case 'create':
          return entity.db.add(entity.toJSON())
            .then(function (key) {
              return entity.db.get(key);
            });
        case 'update':
          return entity.db.put(entity.toJSON())
            .then(function (key) {
              return entity.db.get(key);
            });
        case 'delete':
          if (isModel) {
            return entity.db.delete(entity.id);
          }
          return;
      }
    })
    .then(function (resp) {
      if (options.success) {
        options.success(resp);
      }
    })
    .catch(function (resp) {
      if (options.error) {
        options.error(resp);
      }
    });

};
/* jshint +W074 */