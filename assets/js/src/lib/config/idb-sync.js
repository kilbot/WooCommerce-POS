var bb = require('backbone');

/* jshint -W074 */
module.exports = function(method, entity, options) {
  options = options || {};
  var isModel = entity instanceof bb.Model,
      data = options.attrsArray,
      db = entity.db,
      key;

  if(isModel){
    db = entity.collection.db;
    key = options.index ? entity.get(options.index) : entity.id;
    data = entity.toJSON();
  }

  return db.open()
    .then(function () {
      switch (method) {
        case 'create':
        case 'update':
          return db.update(data, options);
        case 'read':
          return db.read(key, options);
        case 'delete':
          return db.delete(key, options);
      }
    })
    .then(function (resp) {
      if (options.success) { options.success(resp); }
      return resp;
    })
    .catch(function (resp) {
      if (options.error) { options.error(resp); }
    });

};
/* jshint +W074 */