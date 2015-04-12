/**
 * query methods to extend Filtered Collection
 */

var _ = require('lodash');
var query = require('./query/query');

module.exports = {

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