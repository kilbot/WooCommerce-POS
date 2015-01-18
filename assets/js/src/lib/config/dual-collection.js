var bb = require('backbone');
var $ = require('jquery');
var POS = require('lib/utilities/global');
var entitiesChannel = bb.Radio.channel('entities');
var debug = require('debug')('dualCollection');

module.exports = POS.DualCollection = bb.DualCollection.extend({
  constructor: function() {
    bb.DualCollection.apply(this, arguments);

    this._isReady = $.Deferred();
    this.once('idb:ready', function() {
      this._isReady.resolve();
    });

    this._isNew = true;
    this.once('sync', function() {
      this._isNew = false;
    });
  },

  url: function(){
    var wc_api = entitiesChannel.request( 'get:options', 'wc_api' );
    return wc_api + this.name;
  },

  isNew: function() {
    return this._isNew;
  },

  fetch: function(options){
    var self = this;
    return $.when(this._isReady).then(function() {
      debug('fetching: ' + self.name);
      return bb.DualCollection.prototype.fetch.call(self, options);
    });
  },

  state: {
    pageSize: 10
  },

  parseState: function (resp, queryParams, state, options) {
    // totals are always in the WC API headers
    var totalRecords = options.xhr.getResponseHeader('X-WC-Total');
    var totalPages = options.xhr.getResponseHeader('X-WC-Total');

    // return as decimal
    return {
      totalRecords: parseInt(totalRecords, 10),
      totalPages: parseInt(totalPages, 10)
    };
  },

  parse: function (resp) {
    return resp[this.name] ? resp[this.name] : resp ;
  }

});