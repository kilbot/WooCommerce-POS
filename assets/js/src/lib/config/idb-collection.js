var FilteredCollection = require('./filtered-collection');
var app = require('./application');
var Radio = require('backbone.radio');
var IDBModel = require('./idb-model');
var IDBAdapter = require('./idb-adapter');
var _ = require('lodash');

module.exports = app.prototype.IDBCollection = FilteredCollection.extend({

  model: IDBModel,

  name       : 'store',
  storePrefix: 'wc_pos_',

  constructor: function () {
    this.db = new IDBAdapter({ collection: this });
    this.versionCheck();
    FilteredCollection.apply(this, arguments);
  },

  /**
   * Clears the IDB storage and resets the collection
   */
  clear: function () {
    var self = this;
    return this.db.open()
      .then(function () {
        return self.db.clear();
      })
      .then(function(){
        FilteredCollection.prototype.clear.call(self);
      });
  },

  /**
   *
   */
  count: function () {
    var self = this;
    return this.db.open()
      .then(function () {
        return self.db.count();
      })
      .then(function (count) {
        self.trigger('count', count);
        return count;
      });
  },

  /**
   *
   */
  putBatch: function (models, options) {
    options = _.clone(options) || {};
    var self = this;
    if (_.isEmpty(models)) {
      models = this.getChangedModels();
    }
    if (!models) {
      return;
    }
    return this.db.open()
      .then(function () {
        return self.db.putBatch(models, options);
      });
  },

  /**
   *
   */
  getBatch: function (keyArray, options) {
    options = _.clone(options) || {};
    var self = this;
    return this.db.open()
      .then(function () {
        return self.db.getBatch(keyArray, options);
      });
  },

  /**
   *
   */
  findHighestIndex: function (keyPath, options) {
    options = _.clone(options) || {};
    var self = this;
    return this.db.open()
      .then(function () {
        return self.db.findHighestIndex(keyPath, options);
      });
  },

  /**
   *
   */
  getChangedModels: function () {
    return this.filter(function (model) {
      return model.isNew() || model.hasChanged();
    });
  },

  /**
   *
   */
  //removeBatch: function (models, options) {
  //  options = options || {};
  //  var self = this;
  //  if (_.isEmpty(models)) {
  //    return;
  //  }
  //  return this.db.open()
  //    .then(function () {
  //      return self.db.removeBatch(models);
  //    })
  //    .then(function () {
  //      self.remove(models);
  //      if (options.success) {
  //        options.success(self, models, options);
  //      }
  //      return models;
  //    });
  //},

  /**
   * Each website will have a unique idbVersion number
   * the version number is incremented on plugin update and some user actions
   * this version check will compare the version numbers
   * idb is flushed on version change
   */
  versionCheck: function () {
    var name = this.name;

    var newVersion = parseInt(Radio.request('entities', 'get', {
        type: 'option',
        name: 'idbVersion'
      }), 10) || 0;
    var oldVersion = parseInt(Radio.request('entities', 'get', {
        type: 'localStorage',
        name: name + '_idbVersion'
      }), 10) || 0;

    if (newVersion !== oldVersion) {
      this.clear().then(function () {
        Radio.request('entities', 'set', {
          type: 'localStorage',
          name: name + '_idbVersion',
          data: newVersion
        });
      });
    }
  }

});