/* jshint -W071, -W073, -W074 */
var _ = require('lodash');
var Backbone = require('backbone');
var proxyCollection = require('./proxy-collection');
var createFilter = require('./create-filter');
var query = require('./query');

function invalidateCache() {
  this._filterResultCache = {};
}

function invalidateCacheForFilter(filterName) {
  for (var cid in this._filterResultCache) {
    if (this._filterResultCache.hasOwnProperty(cid)) {
      delete this._filterResultCache[cid][filterName];
    }
  }
}

function addFilter(filterName, filterObj) {
  if (this._filters[filterName]) {
    invalidateCacheForFilter.call(this, filterName);
  }
  this._filters[filterName] = filterObj;
  this.trigger('filtered:add', filterName);
}

function removeFilter(filterName) {
  delete this._filters[filterName];
  invalidateCacheForFilter.call(this, filterName);
  this.trigger('filtered:remove', filterName);
}

function execFilterOnModel(model) {
  if (!this._filterResultCache[model.cid]) {
    this._filterResultCache[model.cid] = {};
  }
  var cache = this._filterResultCache[model.cid];
  for (var filterName in this._filters) {
    if (this._filters.hasOwnProperty(filterName)) {
      if (!cache.hasOwnProperty(filterName)) {
        cache[filterName] = this._filters[filterName].fn(model);
      }
      if (!cache[filterName]) {
        return false;
      }
    }
  }
  return true;
}

function execFilter() {
  var filtered = [];
  if (this._superset) {
    filtered = this._superset.filter(_.bind(execFilterOnModel, this));
  }
  this._collection.reset(filtered);
  this.length = this._collection.length;
}

function onAddChange(model) {
  this._filterResultCache[model.cid] = {};
  if (execFilterOnModel.call(this, model)) {
    if (!this._collection.get(model.cid)) {
      var index = this.superset().indexOf(model);
      var filteredIndex = null;
      for (var i = index - 1; i >= 0; i -= 1) {
        if (this.contains(this.superset().at(i))) {
          filteredIndex = this.indexOf(this.superset().at(i)) + 1;
          break;
        }
      }
      filteredIndex = filteredIndex || 0;
      this._collection.add(model, { at: filteredIndex });
    }
  } else {
    if (this._collection.get(model.cid)) {
      this._collection.remove(model);
    }
  }
  this.length = this._collection.length;
}

function onModelAttributeChange(model) {
  this._filterResultCache[model.cid] = {};
  if (!execFilterOnModel.call(this, model)) {
    if (this._collection.get(model.cid)) {
      this._collection.remove(model);
    }
  }
}

function onAll(eventName) {
  if (eventName.slice(0, 7) === 'change:') {
    onModelAttributeChange.call(this, arguments[1]);
  }
}

function onModelRemove(model) {
  if (this.contains(model)) {
    this._collection.remove(model);
  }
  this.length = this._collection.length;
}

function Filtered(superset) {
  this._superset = superset;
  this._collection = new Backbone.Collection(superset.toArray());
  proxyCollection(this._collection, this);
  this.resetFilters();
  this.listenTo(this._superset, 'reset sort', execFilter);
  this.listenTo(this._superset, 'add change', onAddChange);
  this.listenTo(this._superset, 'remove', onModelRemove);
  this.listenTo(this._superset, 'all', onAll);
}

var methods = {
  defaultFilterName: '__default',
  filterBy: function (filterName, filter) {
    if (!filter) {
      filter = filterName;
      filterName = this.defaultFilterName;
    }
    addFilter.call(this, filterName, createFilter(filter));
    execFilter.call(this);
    return this;
  },
  removeFilter: function (filterName) {
    if (!filterName) {
      filterName = this.defaultFilterName;
    }
    removeFilter.call(this, filterName);
    execFilter.call(this);
    return this;
  },
  resetFilters: function () {
    this._filters = {};
    invalidateCache.call(this);
    this.trigger('filtered:reset');
    execFilter.call(this);
    return this;
  },
  superset: function () {
    return this._superset;
  },
  refilter: function (arg) {
    if (typeof arg === 'object' && arg.cid) {
      onAddChange.call(this, arg);
    } else {
      invalidateCache.call(this);
      execFilter.call(this);
    }
    return this;
  },
  getFilters: function () {
    return _.keys(this._filters);
  },
  hasFilter: function (name) {
    return _.contains(this.getFilters(), name);
  },
  destroy: function () {
    this.stopListening();
    this._collection.reset([]);
    this._superset = this._collection;
    this.length = 0;
    this.trigger('filtered:destroy');
  },

  /**
   *
   */
  query: function (filterName, filter) {
    if( _.isUndefined(filter) ) {
      filter = filterName;
      filterName = 'search';
    }
    this._query = filter;
    if( filter === '' ){
      return this.removeFilter(filterName);
    }
    return this.filterBy(filterName,
      _.bind( query, this, filter )
    );
  },
  getQuery: function(){
    return this._query;
  },
  getTokens: function(){
    return this._tokens;
  }
};

_.extend(Filtered.prototype, methods, Backbone.Events);

module.exports = Filtered;
/* jshint +W071, +W073, +W074 */