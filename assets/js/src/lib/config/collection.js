var app = require('./application');
var bb = require('backbone');
var _ = require('lodash');
var Radio = require('backbone.radio');
var extend = require('./extend');
var sync = require('./sync');

/**
 * app.Collection can inherit from these subclasses
 * - note: order is important
 */
var subClasses = {
  idb       : require('backbone-indexeddb/src/collection'),
  dual      : require('backbone-dual-storage/src/collection'),
  filtered  : require('backbone-filtered/src/collection')
};

/**
 *
 */
var Collection = bb.Collection.extend({

  /**
   *
   */
  constructor: function () {
    bb.Collection.apply(this, arguments);
    this.isNew(true);

    this.wc_api = Radio.request('entities', 'get', {
      type: 'option',
      name: 'wc_api'
    });

    this.localDBPrefix = Radio.request('entities', 'get', {
      type: 'option',
      name: 'localDBPrefix'
    });
  },

  /**
   *
   * @param reset
   * @returns {boolean}
   */
  isNew: function(reset) {
    if(reset){
      this._isNew = true;
      this.once('sync', function() {
        this._isNew = false;
      });
    }
    return this._isNew;
  },

  /**
   *
   */
  sync: sync,

  /**
   * https://github.com/jashkenas/backbone/issues/4103
   */
  /* jshint -W074, -W116 */
  get: function(obj) {
    if (obj == null) return void 0;
    return this._byId[obj] ||
      this._byId[this.modelId(this._isModel(obj) ? obj.attributes : obj)] ||
      obj.cid && this._byId[obj.cid];
  }
  /* jshint +W074, +W116 */

});

/**
 * Custom class methods
 * - extend overwrites default extend
 * - _extend is a helper
 */
Collection.extend = extend;

Collection._extend = function(key, parent){
  var subClass = _.get(subClasses, key);
  if(subClass){
    parent = subClass(parent);
  }
  return parent;
};

module.exports = app.prototype.Collection = Collection;