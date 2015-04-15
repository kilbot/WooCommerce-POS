/**
 * Dual Collection makes sure the data locally and the data on the server
 * stay in sync.
 */

var Backbone = require('backbone');
var Radio = Backbone.Radio;
var debug = require('debug')('dualCollection');
var IDBCollection = require('./idb-collection');
var POS = require('lib/utilities/global');
var _ = require('lodash');
var $ = require('jquery');
var moment = require('moment');

module.exports = POS.DualCollection = IDBCollection.extend({
  keyPath: 'local_id',
  mergeKeyPath: 'id',
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

  //eventNames: {
  //  LOCAL_SYNC_FAIL     : 'LOCAL_SYNC_FAIL',
  //  LOCAL_SYNC_SUCCESS  : 'LOCAL_SYNC_SUCCESS',
  //  REMOTE_SYNC_FAIL    : 'REMOTE_SYNC_FAIL',
  //  REMOTE_SYNC_SUCCESS : 'REMOTE_SYNC_SUCCESS',
  //  SYNCHRONIZED        : 'SYNCHRONIZED'
  //},

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

  /**
   *
   */
  fetch: function(options){
    options = options || {};
    if(options.remote){
      return this._remoteFetch(options);
    }
    return IDBCollection.prototype.fetch.call(this, options);
  },

  /**
   *
   */
  _remoteFetch: function(options){
    var self = this;
    return this.sync('read', this, options)
      .then(function(resp){
        var models = self.parse(resp);
        return IDBCollection.prototype.merge.call(self, models);
      })
      .then(function(models){
        var ids = _.map(models, function(model){
          return model.get('id');
        });
        self.dequeue(ids);
      });
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
      return this.fetch({ remote: true });
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
  //remoteFetch: function(options){
  //  options = options || {};
  //  var self = this;
  //
  //  return this.remoteSync('read', this, options)
  //    .then(function(resp){
  //      var records = self.parse(resp);
  //      return self.mergeRecords(records);
  //    })
  //    .done(function(){ debug('remote fetch complete'); })
  //    .fail(function(err){ debug('remote fetch failed', err); });
  //
  //},

  /**
   * Create new record & wait for local_id
   * Remote fetch to populate the rest if the attributes
   */
  remoteGet: function(options){
    options = options || {};
    var deferred = $.Deferred();

    this.create({
      id: options.remote_id,
      status: 'completed' // placeholder status, ie: closed order
    }, {
      wait: true,
      success: function(model){
        model.remoteFetch().done( deferred.resolve );
      },
      error: deferred.reject
    });

    return deferred.promise();
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
  processQueue: function(options){
    options = options || {};
    var queue = options.queue || this.queue;

    if(queue.length === 0){
      return;
    }

    //if(options.filter){
    //  // - fetch remote ids with filter
    //  // - compare to queue
    //  // - resort queue with ids at front?
    //  // - or store queue with a unique id
    //  console.log(options.filter);
    //}

    var self = this,
        deferred = new $.Deferred(),
        ids = queue.splice(0, this.state.pageSize).join(',');

    var done = function(){
      if(options.all && queue.length > 0){
        deferred.progress(ids);
        _.delay(self.processQueue.bind(self), self.getDelay(), options);
      } else {
        deferred.resolve(ids);
      }
    };

    this.fetch({
      remote: true,
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