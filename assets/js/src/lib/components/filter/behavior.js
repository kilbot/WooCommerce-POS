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
    this.showClearButtonMaybe( value );
    this.view.collection.query(value);
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
  }

});

module.exports = Filter;
POS.attach('Behaviors.Filter', Filter);