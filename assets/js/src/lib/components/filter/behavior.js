var Behavior = require('lib/config/behavior');
var _ = require('lodash');
var POS = require('lib/utilities/global');

var Filter = Behavior.extend({

  ui: {
    searchField : 'input[type=search]',
    clearBtn    : 'a.clear'
  },

  events: {
    'keyup @ui.searchField' : 'query',
    'click @ui.clearBtn'    : 'clear'
  },

  query: _.debounce( function(){
    var value = this.ui.searchField.val();
    if( value === ''){
      return this.view.collection.removeFilter('search');
    }

    this.showClearButtonMaybe( value );

    // special case, filter mode, eg: barcode
    if(this.view._mode){
      this.view.collection.query([{
        type: 'prefix',
        prefix: this.view._mode,
        query: value
      }]);

    } else {
      this.view.collection.query(value);
    }

    this.view.collection.firstPage();
  }, 149),

  // clear the filter
  clear: function(e) {
    e.preventDefault();
    this.view.collection.removeFilter('search');
    this.ui.searchField.val('');
    this.showClearButtonMaybe('');
  },

  showClearButtonMaybe: function( value ) {
    if( _.isEmpty( value ) ) {
      this.ui.clearBtn.hide();
    } else {
      this.ui.clearBtn.show();
    }
  },

  onRender: function(){
    if(this.view.collection.hasFilter('search')){
      var queryStr = this.view.collection._filtered._query;
      if(queryStr){
        this.ui.searchField.val(queryStr).trigger('keyup');
      }
    }
  }

});

module.exports = Filter;
POS.attach('Behaviors.Filter', Filter);