/* jshint -W071, -W074 */
var _ = require('lodash');
var is_safari = window.navigator.userAgent.indexOf('Safari') !== -1 &&
  window.navigator.userAgent.indexOf('Chrome') === -1 &&
  window.navigator.userAgent.indexOf('Android') === -1;

var indexedDB = window.indexedDB;

var consts = {
  'READ_ONLY'         : 'readonly',
  'READ_WRITE'        : 'readwrite',
  'VERSION_CHANGE'    : 'versionchange',
  'NEXT'              : 'next',
  'NEXT_NO_DUPLICATE' : 'nextunique',
  'PREV'              : 'prev',
  'PREV_NO_DUPLICATE' : 'prevunique'
};

var defaults = {
  storeName     : 'store',
  storePrefix   : 'Prefix_',
  dbVersion     : 1,
  keyPath       : 'id',
  autoIncrement : true,
  indexes       : [],
  pageSize      : 10,
  onerror       : function(options) {
    options = options || {};
    var err = new Error(options._error.message);
    err.code = event.target.errorCode;
    options._error.callback(err);
  }
};

function IDBAdapter( options ){
  options = options || {};
  this.parent = options.collection;
  this.opts = _.defaults(_.pick(this.parent, _.keys(defaults)), defaults);
  this.opts.storeName = this.parent.name || defaults.storeName;
  this.opts.dbName = this.opts.storePrefix + this.opts.storeName;
}

IDBAdapter.prototype = {

  constructor: IDBAdapter,

  open: function (options) {
    options = options || {};
    if (!this._open) {
      var self = this;

      this._open = new Promise(function (resolve, reject) {
        var request = indexedDB.open(self.opts.dbName);

        request.onsuccess = function (event) {
          self.db = event.target.result;

          // get count & safari hack
          self.count()
            .then(function () {
              if(is_safari){
                return self.findHighestIndex();
              }
            })
            .then(function (key) {
              if(is_safari){
                self.highestKey = key || 0;
              }
              resolve(self.db);
            });
        };

        request.onerror = function (event) {
          options._error = {event: event, message: 'open indexedDB error', callback: reject};
          self.opts.onerror(options);
        };

        request.onupgradeneeded = function (event) {
          var store = event.currentTarget.result.createObjectStore(self.opts.storeName, self.opts);

          self.opts.indexes.forEach(function (index) {
            store.createIndex(index.name, index.keyPath, {
              unique: index.unique
            });
          });
        };
      });
    }

    return this._open;
  },

  close: function () {
    this.db.close();
    this.db = undefined;
    this._open = undefined;
  },

  getTransaction: function (access) {
    return this.db.transaction([this.opts.storeName], access);
  },

  getObjectStore: function (access) {
    return this.getTransaction(access).objectStore(this.opts.storeName);
  },

  count: function (options) {
    options = options || {};
    var self = this, objectStore = options.objectStore || this.getObjectStore(consts.READ_ONLY);

    return new Promise(function (resolve, reject) {
      var request = objectStore.count();

      request.onsuccess = function (event) {
        self.length = event.target.result || 0;
        resolve(event.target.result);
      };

      request.onerror = function (event) {
        options._error = {event: event, message: 'count error', callback: reject};
        self.opts.onerror(options);
      };
    });
  },

  put: function (data, options) {
    options = options || {};
    var objectStore = options.objectStore || this.getObjectStore(consts.READ_WRITE);
    var self = this, keyPath = this.opts.keyPath;

    // merge on index keyPath
    if (options.index) {
      return this.merge(data, options);
    }

    if(!data[keyPath]){
      return this.add(data, options);
    }

    return new Promise(function (resolve, reject) {
      var request = objectStore.put(data);

      request.onsuccess = function (event) {
        resolve(event.target.result);
      };

      request.onerror = function (event) {
        options._error = {event: event, message: 'put error', callback: reject};
        self.opts.onerror(options);
      };
    });
  },

  add: function(data, options){
    options = options || {};
    var objectStore = options.objectStore || this.getObjectStore(consts.READ_WRITE);
    var self = this, keyPath = this.opts.keyPath;

    if(is_safari){
      data[keyPath] = ++this.highestKey;
    }

    return new Promise(function (resolve, reject) {
      var request = objectStore.add(data);

      request.onsuccess = function (event) {
        resolve(event.target.result);
      };

      request.onerror = function (event) {
        options._error = {event: event, message: 'add error', callback: reject};
        self.opts.onerror(options);
      };
    });
  },

  get: function (key, options) {
    options = options || {};
    var self = this, objectStore = options.objectStore || this.getObjectStore(consts.READ_ONLY);

    return new Promise(function (resolve, reject) {
      var request = objectStore.get(key);

      request.onsuccess = function (event) {
        resolve(event.target.result);
      };

      request.onerror = function (event) {
        options._error = {event: event, message: 'get error', callback: reject};
        self.opts.onerror(options);
      };
    });
  },

  delete: function (key, options) {
    options = options || {};
    var self = this, objectStore = options.objectStore || this.getObjectStore(consts.READ_WRITE);

    return new Promise(function (resolve, reject) {
      var request = objectStore.delete(key);

      request.onsuccess = function (event) {
        resolve(event.target.result); // undefined
      };

      request.onerror = function (event) {
        var err = new Error('delete error');
        err.code = event.target.errorCode;
        reject(err);
      };
      request.onerror = function (event) {
        options._error = {event: event, message: 'delete error', callback: reject};
        self.opts.onerror(options);
      };
    });
  },

  putBatch: function (dataArray, options) {
    options = options || {};
    options.objectStore = options.objectStore || this.getObjectStore(consts.READ_WRITE);
    var batch = [];

    _.each(dataArray, function (data) {
      batch.push(this.put(data, options));
    }.bind(this));

    return Promise.all(batch);
  },

  /**
   * 4/3/2016: Chrome can do a fast merge on one transaction, but other browsers can't
   */
  merge: function (data, options) {
    options = options || {};
    var self = this, keyPath = options.index;
    var primaryKey = this.opts.keyPath;

    var fn = function(local, remote, keyPath){
      if(local){
        remote[keyPath] = local[keyPath];
      }
      return remote;
    };

    if(_.isObject(options.index)){
      keyPath = _.get(options, ['index', 'keyPath'], primaryKey);
      if(_.isFunction(options.index.merge)){
        fn = options.index.merge;
      }
    }

    return this.getByIndex(keyPath, data[keyPath], options)
      .then(function(result){
        return self.put(fn(result, data, primaryKey));
      });
  },

  getByIndex: function(keyPath, key, options){
    options = options || {};
    var objectStore = options.objectStore || this.getObjectStore(consts.READ_ONLY),
        openIndex = objectStore.index(keyPath),
        request = openIndex.get(key),
        self = this;

    return new Promise(function (resolve, reject) {
      request.onsuccess = function (event) {
        resolve(event.target.result);
      };

      request.onerror = function (event) {
        options._error = {event: event, message: 'get by index error', callback: reject};
        self.opts.onerror(options);
      };
    });
  },

  getBatch: function (keyArray, options) {
    options = options || keyArray || {};
    var self = this, objectStore = options.objectStore || this.getObjectStore(consts.READ_ONLY);

    if(_.isArray(keyArray)){
      options.filter = _.merge({in: keyArray}, options.filter);
    }

    if (objectStore.getAll === undefined || this.hasGetParams(options)) {
      if(!options.objectStore){
        options.objectStore = objectStore;
      }
      return this.getAll(options);
    }

    var limit = _.get(options, ['filter', 'limit'], this.opts.pageSize);
    if (limit === -1) {
      limit = null; // firefox doesn't like -1 or Infinity
    }

    return new Promise(function (resolve, reject) {
      var request = objectStore.getAll(null, limit);

      request.onsuccess = function (event) {
        resolve(event.target.result);
      };

      request.onerror = function (event) {
        options._error = {event: event, message: 'getAll error', callback: reject};
        self.opts.onerror(options);
      };
    });
  },

  getAll: function (options) {
    options = options || {};
    var objectStore = options.objectStore || this.getObjectStore(consts.READ_ONLY),
        limit = _.get(options, ['filter', 'limit'], this.opts.pageSize),
        offset = _.get(options, ['filter', 'offset'], 0),
        include = _.get(options, ['filter', 'in']),
        query = _.get(options, ['filter', 'q']),
        keyPath = options.index || this.opts.keyPath,
        page = options.page,
        self = this;

    if(_.isObject(keyPath)){
      keyPath = keyPath.keyPath;
    }

    if (limit === -1) {
      limit = Infinity;
    }

    if(page){
      offset = (page - 1) * limit;
    }

    return new Promise(function (resolve, reject) {
      var records = [], idx = 0;
      var request = (keyPath === self.opts.keyPath) ?
        objectStore.openCursor() : objectStore.index(keyPath).openCursor();

      request.onsuccess = function (event) {
        var cursor = event.target.result;
        if (cursor && records.length < limit) {
          if(
            (!include || _.includes(include, cursor.value[keyPath])) &&
            (!query || self._match(query, cursor.value, keyPath, options)) &&
            ++idx > offset
          ){
            records.push(cursor.value);
          }
          return cursor.continue();
        }
        resolve(records);
      };

      request.onerror = function (event) {
        options._error = {event: event, message: 'getAll error', callback: reject};
        self.opts.onerror(options);
      };
    });
  },

  clear: function (options) {
    options = options || {};
    var self = this, objectStore = options.objectStore || this.getObjectStore(consts.READ_WRITE);

    return new Promise(function (resolve, reject) {
      var request = objectStore.clear();

      request.onsuccess = function (event) {
        self.length = 0;
        resolve(event.target.result);
      };

      request.onerror = function (event) {
        options._error = {event: event, message: 'clear error', callback: reject};
        self.opts.onerror(options);
      };
    });
  },

  findHighestIndex: function (keyPath, options) {
    options = options || {};
    var self = this, objectStore = options.objectStore || this.getObjectStore(consts.READ_ONLY);

    return new Promise(function (resolve, reject) {
      var request;
      if(keyPath){
        var openIndex = objectStore.index(keyPath);
        request = openIndex.openCursor(null, consts.PREV);
      } else {
        request = objectStore.openCursor(null, consts.PREV);
      }

      request.onsuccess = function (event) {
        var value = _.get(event, ['target', 'result', 'key']);
        resolve(value);
      };

      request.onerror = function (event) {
        options._error = {event: event, message: 'find highest key error', callback: reject};
        self.opts.onerror(options);
      };
    });
  },

  /**
   * data: {
   *  filter: {
   *    limit: -1,
   *    offset: 10,
   *    q: 'term'
   *    ...
   *  },
   *  fields: ['id', '_state'],
   *  page: 2
   * }
   */
  hasGetParams: function(options){
    options = options || {};
    if(options.page || options.fields || _.size(options.filter) > 1 ||
      (_.size(options.filter) === 1 && options.filter.limit === undefined)){
      return true;
    }
    return false;
  },

  _match: function(query, json, keyPath, options){
    var fields = _.get(options, ['filter', 'fields'], keyPath);
    return this.parent.matchMaker(json, query, {fields: fields});
  }

};

module.exports = IDBAdapter;
/* jshint +W071, +W074 */