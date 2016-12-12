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
  sync: sync

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