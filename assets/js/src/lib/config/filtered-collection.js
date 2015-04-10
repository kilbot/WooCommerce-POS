/* jshint -W071, -W003, -W021 */
var _ = require('lodash');
var Backbone = require('backbone');
var FilteredCollection = require('./filtered-collection/filtered');
var SortedCollection = require('./filtered-collection/sorted');
var PaginatedCollection = require('./filtered-collection/paginated');
var proxyCollection = require('./filtered-collection/proxy-collection');
var proxyEvents = require('./filtered-collection/proxy-events');

function Obscura(superset, options) {
  this._superset = superset;
  this._filtered = new FilteredCollection(superset, options);
  this._sorted = new SortedCollection(this._filtered, options);
  this._paginated = new PaginatedCollection(this._sorted, options);
  proxyCollection(this._paginated, this);
  proxyEvents.call(this, this._filtered, filteredEvents);
  proxyEvents.call(this, this._sorted, sortedEvents);
  proxyEvents.call(this, this._paginated, paginatedEvents);
  this.initialize(options);
}

var methods = {
  superset: function () {
    return this._superset;
  },
  getFilteredLength: function () {
    return this._filtered.length;
  },
  removeTransforms: function () {
    this._filtered.resetFilters();
    this._sorted.removeSort();
    this._paginated.removePagination();
    return this;
  },
  destroy: function () {
    this.stopListening();
    this._filtered.destroy();
    this._sorted.destroy();
    this._paginated.destroy();
    this.length = 0;
    this.trigger('obscura:destroy');
  }
};

var filteredMethods = [
  'filterBy',
  'removeFilter',
  'resetFilters',
  'refilter',
  'hasFilter',
  'getFilters',
  'query',
  'getQuery',
  'getTokens'
];
var filteredEvents = [
  'filtered:add',
  'filtered:remove',
  'filtered:reset'
];
var sortedMethods = [
  'setSort',
  'reverseSort',
  'removeSort'
];
var sortedEvents = [
  'sorted:add',
  'sorted:remove'
];
var paginatedMethods = [
  'setPerPage',
  'setPage',
  'getPerPage',
  'getNumPages',
  'getPage',
  'hasNextPage',
  'hasPrevPage',
  'nextPage',
  'prevPage',
  'movePage',
  'removePagination',
  'firstPage',
  'lastPage',
  'appendNextPage'
];
var paginatedEvents = [
  'paginated:change:perPage',
  'paginated:change:page',
  'paginated:change:numPages'
];
var unsupportedMethods = [
  'add',
  'create',
  'remove',
  'set',
  'reset',
  'sort',
  'parse',
  'sync',
  'fetch',
  'push',
  'pop',
  'shift',
  'unshift'
];

_.each(filteredMethods, function (method) {
  methods[method] = function () {
    var result = FilteredCollection.prototype[method]
      .apply(this._filtered, arguments);
    return result === this._filtered ? this : result;
  };
});
_.each(paginatedMethods, function (method) {
  methods[method] = function () {
    var result = PaginatedCollection.prototype[method]
      .apply(this._paginated, arguments);
    return result === this._paginated ? this : result;
  };
});
_.each(sortedMethods, function (method) {
  methods[method] = function () {
    var result = SortedCollection.prototype[method]
      .apply(this._sorted, arguments);
    return result === this._sorted ? this : result;
  };
});
_.each(unsupportedMethods, function (method) {
  methods[method] = function () {
    throw new Error(
      'Backbone.Obscura: Unsupported method: ' +
      method + 'called on read-only proxy'
    );
  };
});

_.extend(Obscura.prototype, methods, Backbone.Events);
Obscura = Backbone.Collection.extend(Obscura.prototype);
Obscura.FilteredCollection = FilteredCollection;
Obscura.SortedCollection = SortedCollection;
Obscura.PaginatedCollection = PaginatedCollection;
module.exports = Obscura;
/* jshint +W071, +W003, +W021 */