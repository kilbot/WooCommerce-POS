var Collection = require('./collection');
var app = require('./application');
var _ = require('lodash');
var Parser = require('query-parser');
var parse = new Parser();
var matchMaker = require('json-query');

var defaultFilterName = '__default';

module.exports = app.prototype.FilteredCollection = Collection.extend({

  constructor: function(){
    Collection.apply(this, arguments);
    this._filters = {};
    if(this.superset === true){
      this.superset = this.toJSON();
    }
  },

  matchMaker: matchMaker,

  /* jshint: -W071 -W074 */
  setFilter: function (filterName, filter) {
    if (filter === undefined) {
      filter = filterName;
      filterName = defaultFilterName;
    }
    if (!filter) {
      return this.removeFilter(filterName);
    }
    this._filters[filterName] = {
      string: filter,
      query : _.isString(filter) ? parse(filter) : filter
    };
    this.trigger('filtered:set');

    if(this.superset){
      return this.supersetFetch();
    }
    return this.fetch({data: {filter: this.getFilterOptions()}});
  },
  /* jshint: +W071 +W074 */

  removeFilter: function (filterName) {
    if (!filterName) {
      filterName = defaultFilterName;
    }
    delete this._filters[filterName];
    this.trigger('filtered:remove');

    if(this.superset){
      return this.supersetFetch();
    }
    return this.fetch({data: {filter: this.getFilterOptions()}});
  },

  resetFilters: function () {
    this._filters = {};
    this.trigger('filtered:reset');
    if(this.superset){
      return this.reset(this.superset);
    }
    this.reset();
    return this.fetch();
  },

  getFilters: function (name) {
    if (name) {
      return this._filters[name];
    }
    return this._filters;
  },

  hasFilter: function (name) {
    return _.includes(_.keys(this.getFilters()), name);
  },

  hasFilters: function () {
    return _.size(this.getFilters()) > 0;
  },

  getFilterOptions: function () {
    if (this.hasFilters()) {
      var fields = _.isArray(this.fields) ? this.fields.join(',') : this.fields;
      return {q: this.getFilterQueries(), fields: fields};
    }
  },

  getFilterQueries: function () {
    var queries = _(this.getFilters()).map('query').flattenDeep().value();

    // compact
    if (queries.length > 1) {
      queries = _.reduce(queries, function (result, next) {
        if (!_.some(result, function (val) {
            return _.isEqual(val, next);
          })) {
          result.push(next);
        }
        return result;
      }, []);
    }

    // extra compact for common simple query
    if (queries.length === 1 && _.get(queries, [0, 'type']) === 'string') {
      queries = _.get(queries, [0, 'query']);
    }

    return queries;
  },

  supersetFetch: function(){
    var self = this;
    var models = _.filter(this.superset, function(model){
      return matchMaker(model, self.getFilterQueries(), {fields: self.fields});
    });
    return this.reset(models);
  }

});