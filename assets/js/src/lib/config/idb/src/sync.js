var $ = require('jquery');
var noop = function(){};

var methods = {
  'read': function(model, options, db){
    if(model.id){
      return db.read(model, options);
    }
    return db.getAll(options);
  },
  'create': function(model, options, db){
    if (model.id) {
      return db.update(model, options);
    }
    return db.create(model, options);
  },
  'update': function(model, options, db){
    if (model.id) {
      return db.update(model, options);
    }
    return db.create(model, options);
  },
  'delete': function(model, options, db){
    if (model.id) {
      return db.destroy(model, options);
    }
  }
};

var sync = function(method, entity, options) {
  var deferred = new $.Deferred(),
      db = entity.db || entity.collection.db,
      success = options.success || noop,
      error = options.success || noop;

  options.success = function (result) {
    success.apply(this, arguments);
    deferred.resolve(result);
  };

  options.error = function (result) {
    error.apply(this, arguments);
    deferred.reject(result);
  };

  db.open()
    .then(function(){
      if(methods[method]){
        return methods[method](entity, options, db);
      }
    });

  return deferred.promise();
};

module.exports = sync;