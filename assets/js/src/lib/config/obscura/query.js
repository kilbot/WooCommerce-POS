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
  },

  getRemoteFilter: function(){
    if(!this._tokens){
      return;
    }

    var filter = {
      'not_in': this.pluck('id').join(',')
    };

    _.each(this._tokens, function(token){

      // simple search
      if(token.type === 'string'){
        filter.q = token.query;
      }

      // simple prefix search
      if(token.type === 'prefix'){
        filter[token.prefix] = token.query;
      }

    });

    return filter;
  }

};