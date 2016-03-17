var Collection = require('./collection');
var app = require('./application');
var _ = require('lodash');
var defaultFilterName = '__default';
var Parser = require('query-parser');
var parse = new Parser();
var matchMaker = require('json-query');

module.exports = app.prototype.FilteredCollection = Collection.extend({
  _filters: {},

  setFilter: function(filterName, filter) {
    if(filter === undefined) {
      filter = filterName;
      filterName = defaultFilterName;
    }
    if(!filter){
      return this.removeFilter(filterName);
    }
    this._filters[filterName] = _.isString(filter) ? parse(filter) : filter;
    return this.fetch(this.fetchFilters());
  },

  removeFilter: function(filterName) {
    if (!filterName) {
      filterName = defaultFilterName;
    }
    delete this._filters[filterName];
    return this.fetch(this.fetchFilters());
  },

  getFilters: function() {
    return _.keys(this._filters);
  },

  hasFilter: function(name) {
    return _.includes(this.getFilters(), name);
  },

  resetFilters: function() {
    this._filters = {};
  },

  fetchFilters: function() {
    if (_.size(this._filters) === 0) {
      return;
    }
    var query = _.reduce(this._filters, function (result, value) {
      if (!result) {
        return value;
      }
      if (result.length === 1) {
        result.push(value[0]);
        return [{
          type   : 'and',
          queries: result
        }];
      }
      result[0].queries.push(value[0]);
      return result;
    });
    return {data: {filter: {fields: this.fields, q: query}}};
  },

  matchMaker: matchMaker

});