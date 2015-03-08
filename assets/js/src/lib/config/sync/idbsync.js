var $ = require('jquery');

var methods = {
  'read': function(model, options, db){
    if(model.id !== undefined){
      db.read(model, options);
    } else {
      db.getAll(options);
    }
  },
  'create': function(model, options, db){
    if (model.id) {
      db.update(model, options);
    } else {
      db.create(model, options);
    }
  },
  'update': function(model, options, db){
    if (model.id) {
      db.update(model, options);
    } else {
      db.create(model, options);
    }
  },
  'delete': function(model, options, db){
    if (model.id) {
      db.destroy(model, options);
    }
  }
};

var noop = function(){};

/*jshint -W074*/
module.exports = function(method, model, options) {
  var deferred = new $.Deferred(),
      db = model.indexedDB || model.collection.indexedDB,
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

  if(methods[method]){
    methods[method](model, options, db);
  }

  return deferred.promise();
};
/*jshint +W074*/