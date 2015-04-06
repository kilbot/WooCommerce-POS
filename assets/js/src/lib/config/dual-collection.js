/**
 * Dual Collection makes sure the data locally and the data on the server
 * stay in sync.
 */

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
  keyPath: 'local_id',
  _syncDelayed: true,

  /**
   * Items for download will be placed in queue
   * Delay is the pause between the next items in queue
   */
  queue: [],
  delay: 500, // server breathing spacing, can also be set via radio

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

  parseProp: function(resp, prop){
    var array = this.parse(resp);
    return _.pluck(array, prop);
  },

  getSyncMethodsByState: function(state){
    if(this.methods[state]){
      return this.methods[state];
    }
  },

  //getState: function(key){
  //  return Radio.request('entities', 'get', {
  //    type: 'localStorage',
  //    name: this.name,
  //    key: key
  //  });
  //},
  //
  //setState: function(options){
  //  Radio.command('entities', 'set', {
  //    type: 'localStorage',
  //    name: this.name,
  //    data: options
  //  });
  //},
  //
  //removeState: function(key){
  //  Radio.command('entities', 'remove', {
  //    type: 'localStorage',
  //    name: this.name,
  //    key: key
  //  });
  //},

  fetch: function(options){
    options = options || {};
    var self = this;

    return IndexedDBCollection.prototype.fetch.call(this, options)
      .then(function(){
        if(options.fullSync){
          self.fullSync();
        }
      })
      .done(function(){ debug('idb fetch complete'); })
      .fail(function(err){ debug('idb fetch failed', err); });
  },

  /**
   * Full sync
   * - Get any updated records
   * - Audit using full list of remote ids vs local
   * - Upload any local changes
   */
  fullSync: function(){
    var self = this;

    if(this._syncing){
      debug('sync already in progress');
      return;
    }

    this._syncing = true;
    debug('fullSync started');
    this.trigger('fullSync:start');

    this.fetchUpdated()
      .then(function(){
        return self.auditRecords();
      })
      .then(function(){
        if(self._syncDelayed){
          return self.syncDelayed();
        }
      })
      .done(function(){ debug('fullSync complete'); })
      .fail(function(err){ debug('fullSync failed', err); })
      .always(function(){
        self._syncing = false;
        self.trigger('fullSync:end');
      });

  },

  /**
   * Fetch updated
   * - if collection is empty, fetch the first page
   * - else, get the latest updated_at from local collection
   * - check server for any new updates
   */
  fetchUpdated: function(){
    var self = this;

    // no local records, possibly first fetch
    if(this.length === 0){
      return this.remoteFetch();
    }

    //var last_update = this.formatDate( this.getState('last_update') );
    var last_update = _.compact( this.pluck('updated_at') ).sort().pop();

    //
    return this.getRemoteIds(last_update)
      .then(function(ids){
        self.enqueue(ids);
        return self.processQueue(true);
      })
      .done(function(){ debug('fetch updated complete'); })
      .fail(function(err){ debug('fetch updated failed', err); });

  },

  /**
   * Remote fetch
   * - fetch records from server
   * - merge records with local collection
   * todo add(records)
   */
  remoteFetch: function(options){
    options = options || {};
    var self = this;

    return this.remoteSync('read', this, options)
      .then(function(resp){
        var records = self.parse(resp);
        return self.mergeRecords(records);
      })
      .done(function(){ debug('remote fetch complete'); })
      .fail(function(err){ debug('remote fetch failed', err); });

  },

  /**
   * get delayed models and remote create/update
   */
  syncDelayed: function(){
    var models = this.getDelayedModels();
    _.each(models, function(model){
      model.remoteSync();
    }, this);
  },

  /**
   * returns array of all delayed records
   */
  getDelayedModels: function() {
    var delayed = [
      this.states.DELETE_FAILED,
      this.states.CREATE_FAILED,
      this.states.UPDATE_FAILED
    ];

    return this.filter(function(model){
      return delayed.indexOf( model.get('status') ) !== -1;
    });
  },

  /**
   * Audit records
   * - get full list of remote ids
   * - compare to local ids
   * - queue records for remote fetch
   * - remove any garbage records
   */
  auditRecords: function(){
    var local = this.pluck('id'),
        self = this;

    return this.getRemoteIds()
      .then(function(remote){
        var add = _.chain(remote).difference(local).compact().value(),
            remove = _.chain(local).difference(remote).compact().value();
        self.enqueue(add);
        self.dequeue(remove);
        return self.removeGarbage(remove);
      })
      .done(function(){ debug('audit complete'); })
      .fail(function(err){ debug('audit failed', err); });

  },



  /**
   * Returns a promise for an array of ids since last update
   */
  //getRemoteIds: function(last_update){
  //  var deferred = $.Deferred(),
  //      self = this, ids, options = {};
  //
  //  options.data = {
  //    fields: 'id',
  //    filter: {
  //      limit: -1,
  //      updated_at_min: this.formatDate(last_update)
  //    }
  //  };
  //
  //  options.success = function(resp){
  //    ids = self.parseProp(resp, 'id');
  //    debug(ids.length + ' remote ids');
  //    deferred.resolve(ids);
  //  };
  //
  //  options.error = function(jqXHR, textStatus, errorThrown){
  //    self.trigger('error', jqXHR, textStatus, errorThrown);
  //    debug('error fetching ids ', textStatus);
  //  };
  //
  //  this.setState({last_update: Date.now()});
  //
  //  this.remoteSync('read', this, options);
  //
  //  return deferred;
  //},

  /**
   * Get array of all entity ids from the server
   * - optionally get ids modified since last_update
   * - uses ajax for performance
   */
  getRemoteIds: function(last_update){
    var ajaxurl = Radio.request('entities', 'get', {
      type: 'option',
      name: 'ajaxurl'
    });

    if(last_update){
      debug('getting updated ids from server since ' + last_update);
    } else {
      debug('getting all ids from server');
    }

    return $.getJSON( ajaxurl, {
      action        : 'wc_pos_get_all_ids',
      type          : this.name,
      updated_at_min: last_update
    });
  },

  /**
   * Sync to server
   */
  remoteSync: function(method, model, options){
    options = options || {};
    options.remote = true;
    return this.sync(method, model, options);
  },

  /**
   * Returns a promise for an array of ids from IndexedDB
   * note: this.fetch + this.pluck('id') should give same result
   */
  //getLocalIds: function(){
  //  var deferred = $.Deferred(),
  //      ids = [];
  //
  //  var onItem = function(item){
  //    ids.push(item.id);
  //  };
  //
  //  var onEnd = function(){
  //    deferred.resolve(ids);
  //  };
  //
  //  this.indexedDB.store.iterate(onItem, {
  //    index: 'id',
  //    onEnd: onEnd
  //  });
  //
  //  return deferred;
  //},

  /**
   * Remove garbage records, ie: records deleted on server
   * todo: promisify removeBatch
   */
  removeGarbage: function(ids){
    var deferred = new $.Deferred(),
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

    return deferred.promise();
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
   * Process queue
   * - take slice of ids from queue and remote fetch
   * - optionally keep processing queue until empty
   */
  processQueue: function(all){
    if(this.queue.length === 0){ return; }
    this.trigger('loading', true);

    var self = this,
        deferred = new $.Deferred(),
        ids = this.queue.splice(0, this.state.pageSize).join(','),
        cont = all && this.queue.length > 0;

    var done = function(){
      self.trigger('loading', false);
      if(cont){
        deferred.progress(ids);
        _.delay(self.processQueue.bind(self), self.getDelay(), all);
      } else {
        deferred.resolve(ids);
      }
    };

    this.remoteFetch({
      data: {
        filter: {
          limit: -1,
          'in': ids
        }
      }
    }).done(done);

    return deferred.promise();
  },

  /**
   * Allows delay to be added between process queue
   * - may be necessary to ease server load
   */
  getDelay: function(){
    return Radio.request('entities', 'get', {
      type: 'option',
      name: 'delay'
    }) || this.delay;
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