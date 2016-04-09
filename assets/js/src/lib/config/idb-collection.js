var FilteredCollection = require('./filtered-collection');
var app = require('./application');
var Radio = require('backbone.radio');
var IDBModel = require('./idb-model');
var IDBAdapter = require('./idb-adapter');
var _ = require('lodash');
var bb = require('backbone');

module.exports = app.prototype.IDBCollection = FilteredCollection.extend({

  model: IDBModel,

  name       : 'store',
  storePrefix: 'wc_pos_',

  constructor: function () {
    FilteredCollection.apply(this, arguments);
    this.db = new IDBAdapter({ collection: this });
    this.versionCheck();
  },

  /**
   *
   */
  /* jshint -W071, -W074 */
  save: function(models, options){
    options = options || {};
    var collection = this,
        wait = options.wait,
        success = options.success,
        setAttrs = options.set !== false;

    if(models === null){
      models = this.getChangedModels();
    }

    var attrsArray = _.map(models, function(model){
      return model instanceof bb.Model ? model.toJSON() : model;
    });

    if(!wait && setAttrs){
      this.set(attrsArray, options);
    }

    options.success = function(resp) {
      var serverAttrs = options.parse ? collection.parse(resp, options) : resp;
      if (serverAttrs && setAttrs) { collection.set(serverAttrs, options); }
      if (success) { success.call(options.context, collection, resp, options); }
      collection.trigger('sync', collection, resp, options);
    };

    return this.sync('update', this, _.extend(options, {attrsArray: attrsArray}));
  },
  /* jshint +W071, +W074 */

  /**
   *
   */
  destroy: function(options){
    options = options || {};
    var collection = this,
        wait = options.wait,
        success = options.success;

    options.success = function(resp) {
      if (wait) { collection.reset(); }
      if (success) { success.call(options.context, collection, resp, options); }
      collection.trigger('sync', collection, resp, options);
      collection.resetNew();
    };

    if(!wait) { collection.reset(); }
    return this.sync('delete', this, options);
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
  getChangedModels: function () {
    return this.filter(function (model) {
      return model.isNew() || model.hasChanged();
    });
  },

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
      this.destroy().then(function () {
        Radio.request('entities', 'set', {
          type: 'localStorage',
          name: name + '_idbVersion',
          data: newVersion
        });
      });
    }
  }

});