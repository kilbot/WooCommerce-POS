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
      return this.remoteFetch(options);
    }
    return IDBCollection.prototype.fetch.call(this, options);
  },

  /**
   *
   */
  remoteFetch: function(options){
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
    this.trigger('start:fullSync');

    return this.fetchUpdated()
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
        self.trigger('end:fullSync');
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
        return self.processQueue({
          queue: ids,
          all  : true
        });
      });

  },

  /**
   * get delayed models and remote create/update
   */
  syncDelayed: function(){
    var models = this.getDelayedModels();
    var sync = _.map(models, function(model){
      return model.remoteSync(null, model);
    });
    return $.when.apply(this, sync);
  },

  /**
   * returns array of all delayed records
   */
  getDelayedModels: function() {
    return this.filter(function(model){
      return model.isDelayed();
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
   * Remove garbage records, ie: records deleted on server
   */
  removeGarbage: function(ids){
    var models = this.getModelsByRemoteIds(ids);

    if(models.length === 0){
      return;
    }

    this.remove(models);
    return this.db.removeBatch(_.pluck(models, 'id'));
  },

  /**
   * Turn array of remoteIds into array of models
   * idAttribute = 'local_id'
   * remoteIdAttribute = 'id
   */
  getModelsByRemoteIds: function(ids){
    return this.filter(function(model){
      return _(ids).contains(model.get('id'));
    });
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
  /* jshint -W071, -W074 */
  processQueue: function(options){
    options = options || {};
    var queue = options.queue || _.clone(this.queue);
    if(queue.length === 0 || this._processingQueue){
      return;
    }
    this._processingQueue = true;
    this.trigger('start:processQueue');

    var self = this,
        deferred = new $.Deferred(),
        ids = queue.splice(0, this.state.pageSize).join(',');

    this.fetch({
      remote: true,
      data: {
        filter: options.filter || {
          limit: -1,
          'in': ids
        }
      }
    })
    .done(function(){
      if(!options.all || queue.length === 0){
        deferred.resolve();
      } else {
        deferred.progress(ids);
        _.delay(self.processQueue.bind(self), self.getDelay(), options);
      }
    })
    .fail(deferred.reject)
    .always(function(){
      self._processingQueue = false;
      self.trigger('end:processQueue');
    });

    return deferred.promise();
  },
  /* jshint +W071, +W074 */

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

  /**
   * Clears the IDB storage and resets the collection
   */
  clear: function(){
    if(!this.db){
      return;
    }

    var self = this;
    return this.db.open()
      .then(function(){
        return self.db.clear();
      })
      .then(function(){
        self.reset();
        self.queue = [];
      });
  },

  /*
   * Helper function to format Date.now() to RFC3339
   * - returns 2015-03-11T02:30:43.925Z (with milliseconds)
   * - undefined if no timestamp
   */
  formatDate: function(timestamp) {
    if(timestamp){
      //return moment(timestamp).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
      return moment(timestamp).toISOString();
    }
  }

});