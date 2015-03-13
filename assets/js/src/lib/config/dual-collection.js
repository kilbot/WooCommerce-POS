var Backbone = require('backbone');
var Radio = Backbone.Radio;
var debug = require('debug')('dualCollection');
var IndexedDBCollection = require('./idb-collection');
var POS = require('lib/utilities/global');
var _ = require('lodash');
var $ = require('jquery');
var moment = require('moment');

module.exports = POS.DualCollection = IndexedDBCollection.extend({
  storage: 'dual',
  queue: [],

  states: {
    SYNCHRONIZED  : 'SYNCHRONIZED',
    SYNCHRONIZING : 'SYNCHRONIZING',
    UPDATE_FAILED : 'UPDATE_FAILED',
    CREATE_FAILED : 'CREATE_FAILED',
    DELETE_FAILED : 'DELETE_FAILED'
  },

  methods: {
    UPDATE_FAILED : 'create',
    CREATE_FAILED : 'update',
    DELETE_FAILED : 'delete'
  },

  eventNames: {
    LOCAL_SYNC_FAIL     : 'LOCAL_SYNC_FAIL',
    LOCAL_SYNC_SUCCESS  : 'LOCAL_SYNC_SUCCESS',
    REMOTE_SYNC_FAIL    : 'REMOTE_SYNC_FAIL',
    REMOTE_SYNC_SUCCESS : 'REMOTE_SYNC_SUCCESS',
    SYNCHRONIZED        : 'SYNCHRONIZED'
  },

  url: function(){
    var wc_api = Radio.request('entities', 'get', {
      type: 'option',
      name: 'wc_api'
    });
    return wc_api + this.name;
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

  parse: function (resp){
    return resp[this.name] ? resp[this.name] : resp ;
  },

  parseProp: function(resp, prop){
    var array = this.parse(resp);
    return _.pluck(array, prop);
  },

  getSyncMethodsByState: function(state){
    if(this.methods[state]){
      return this.methods[state];
    }
  },

  getState: function(key){
    return Radio.request('entities', 'get', {
      type: 'localStorage',
      name: this.name,
      key: key
    });
  },

  setState: function(options){
    Radio.command('entities', 'set', {
      type: 'localStorage',
      name: this.name,
      data: options
    });
  },

  removeState: function(key){
    Radio.command('entities', 'remove', {
      type: 'localStorage',
      name: this.name,
      key: key
    });
  },

  /**
   * Full sync
   * - Get list of server ids since last update
   * - Compare to idb keyPath 'id'
   * - Delete local records if necessary
   * - Queue ids, download first page
   * - Next, check for delayed local records
   * - Sync delayed to server
   */
  fullSync: function(){
    var self = this;

    if(this._syncing){
      debug('sync already in progress');
      return;
    }

    this._syncing = true;

    $.when( this.fetch() )
    .then(function(){
      self.trigger('fullSync:start');
      return self.auditRecords();
    })
    .then(function(){ return self.processQueue(); })
    .then(function(){ return self.syncDelayedData(); })
    .done(function(){
      debug('fullSync complete');
    })
    .fail(function(){
      debug('fullSync failed');
    })
    .always(function(){
      self._syncing = false;
      self.trigger('fullSync:end');
    });
  },

  syncDelayedData: function(){

  },

  /**
   * Load more
   * - if no more in local and ids in queue, download next page
   */

  /**
   *
   */
  _getDelayedData: function(status) {
    var data, deferred, keyRange, options;
    deferred = new $.Deferred();
    data = [];
    keyRange = this.indexedDB.makeKeyRange({
      lower: status,
      upper: status
    });
    options = {
      index: 'status',
      keyRange: keyRange,
      onEnd: function() {
        return deferred.resolve(data);
      }
    };
    this.indexedDB.iterate(function(item) {
      return data.push(item);
    }, options);
    return deferred.promise();
  },

  /**
   *
   */
  getDelayedData: function() {
    var created, deferred, deleted, updated;
    deferred = new $.Deferred();
    deleted = this._getDelayedData(this.states.DELETE_FAILED);
    created = this._getDelayedData(this.states.CREATE_FAILED);
    updated = this._getDelayedData(this.states.UPDATE_FAILED);
    $.when(deleted, created, updated).done(function(a, b, c) {
      return deferred.resolve(_.union(a, b, c));
    });
    return deferred.promise();
  },

  auditRecords: function(){
    var deferred = $.Deferred(),
        local = this.pluck('id'),
        self = this;

    $.when( this.getRemoteIds() )
    .then(function(remote){
      var add = _.difference(remote, local),
          remove = _.difference(local, remote);
      self.enqueue(add);
      self.dequeue(remove);
      return self.removeGarbage(remove);
    })
    .done(deferred.resolve)
    .fail(deferred.reject);

    return deferred;
  },

  /**
   * Returns a promise for an array of ids since last update
   * TODO: revert to more performant AJAX request
   */
  getRemoteIds: function(){
    var deferred = $.Deferred(),
        last_update = this.getState('last_update'),
        self = this, ids, options = {};

    options.data = {
      fields: 'id',
      filter: {
        limit: -1,
        updated_at_min: this.formatDate(last_update)
      }
    };

    options.success = function(resp){
      ids = self.parseProp(resp, 'id');
      debug(ids.length + ' remote ids');
      deferred.resolve(ids);
    };

    options.error = function(jqXHR, textStatus, errorThrown){
      self.trigger('error', jqXHR, textStatus, errorThrown);
      debug('error fetching ids ', textStatus);
    };

    this.setState({last_update: Date.now()});

    this.remoteSync('read', this, options);

    return deferred;
  },

  //getRemoteIds: function(){
  //  var ajaxurl = Radio.request('entities', 'get', {
  //    type: 'option',
  //    name: 'ajaxurl'
  //  });
  //
  //  return $.getJSON( ajaxurl, {
  //    'action': 'wc_pos_get_all_ids',
  //    'type'  : this.name
  //  });
  //},

  /**
   * Sync to server
   */
  remoteSync: function(method, model, options){
    options = options || {};
    options.remote = true;
    this.sync(method, model, options);
  },

  /**
   * Returns a promise for an array of ids from IndexedDB
   * note: this.fetch + this.pluck('id') should give same result
   */
  getLocalIds: function(){
    var deferred = $.Deferred(),
        ids = [];

    var onItem = function(item){
      ids.push(item.id);
    };

    var onEnd = function(){
      deferred.resolve(ids);
    };

    this.indexedDB.store.iterate(onItem, {
      index: 'id',
      onEnd: onEnd
    });

    return deferred;
  },

  /**
   * Remove garbage records
   * - records which have been deleted from server
   */
  removeGarbage: function(ids){
    var deferred = $.Deferred(),
        models = this.getModelsByRemoteIds(ids);

    if(models.length === 0){ return; }

    // remove from collection
    this.remove(models);

    // purge from indexeddb
    this.indexedDB.store.removeBatch(
      _.pluck(models, 'local_id'),
      deferred.resolve,
      deferred.reject
    );

    return deferred;
  },

  /**
   * Turn ids array into array of models
   * note: idAttribute for dual models is 'local_id'
   */
  getModelsByRemoteIds: function(ids){
    var models = [];
    _.each(ids, function(id){
      models.push(this.findWhere({id: id}));
    }, this);
    return models;
  },

  /**
   * Add ids to queue for potential download
   */
  enqueue: function(ids){
    if(!_.isArray(ids)){
      return this.queue.push(ids);
    }
    this.queue = _.union(this.queue, ids);
    debug(ids.length + ' ids added to queue');
  },

  /**
   * Remove ids from queue
   */
  dequeue: function(ids){
    if(!_.isArray(ids)){
      this.queue = _.without(this.queue, ids);
    } else {
      this.queue = _.difference(this.queue, ids);
    }
    debug(ids.length + ' ids removed from queue');
  },

  /**
   *
   */
  hasAllRecords: function(){
    return (this.queue.length === 0);
  },

  /**
   *
   */
  processQueue: function(){
    var self = this;

    if(this.hasAllRecords()){
      return;
    }

    return this.fetch({
      remote: true,
      remove: false,
      data: {
        filter: {
          limit: -1,
          'in': this.queue.splice(0, this.state.pageSize).join(',')
        }
      },
      success: function(collection, response){
        self.indexedDB.putBatch(self.parse(response));
        if(self.name === 'products'){
          _.delay(function(){
            self.processQueue();
          }, self.getDelay());
        }
      }
    });
  },

  /**
   * Allows delay to be added for large downloads
   */
  getDelay: function(){
    return Radio.request('entities', 'get', {
      type: 'option',
      name: 'delay'
    }) || 0;
  },

  /*
   * Helper function to format Date.now() to RFC3339
   * - returns 2015-03-11T02:30:43.925Z (with millisenconds)
   * - undefined if no timestamp
   */
  formatDate: function(timestamp) {
    if(timestamp){
      //return moment(timestamp).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
      return moment(timestamp).toISOString();
    }
  }

});