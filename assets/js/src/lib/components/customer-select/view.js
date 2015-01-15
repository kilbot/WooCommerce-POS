var ItemView = require('lib/config/item-view');
var Select2 = require('lib/components/select2/behavior');
var _ = require('lodash');
var bb = require('backbone');
var entitiesChannel = bb.Radio.channel('entities');

// Select view
module.exports = ItemView.extend({
  template: function() {
    return '<input name="customer" type="hidden" class="select2">'
  },

  behaviors: {
    Select2: {
      behaviorClass: Select2,
      minimumInputLength: 2,
      ajax: {
        url: function() {
          return entitiesChannel.request('get:options', 'ajaxurl');
        },
        dataType: 'json',
        quietMillis: 250,
        data: function( term ) {
          return {
            term: term,
            action: 'wc_pos_json_search_customers'
          };
        },
        results: function( data ) {
          var customers = [];
          _( data ).each( function( obj ) {
            customers.push( obj );
          });
          return { results: customers };
        }
      },
      initSelection: function( element, callback ) {
        var customer = entitiesChannel.request('get:options', 'default_customer');
        callback( customer );
      }
    }
  },

  query: function(){},

  events: {
    'change #select-customer' : 'updateCustomer'
  },

  updateCustomer: function(e) {
    this.trigger( 'customer:select', e.added.id, this.formatSelection( e.added ) );
  },

  formatResult: function( customer ) {
    var output = '';
    if( ! _.isEmpty( customer.first_name ) ) { output = customer.first_name + ' '; }
    if( ! _.isEmpty( customer.last_name ) ) { output += customer.last_name + ' '; }
    if( output === '' ) { output = customer.display_name + ' '; }
    if( ! _.isEmpty( customer.user_email ) ) { output += '(' + customer.user_email + ')'; }
    return output;
  },

  formatSelection: function( customer ) {
    var output = '';
    if( ! _.isEmpty( customer.first_name ) ) { output = customer.first_name + ' '; }
    if( ! _.isEmpty( customer.last_name ) ) { output += customer.last_name + ' '; }
    if( output === '' ) { output = customer.display_name; }
    return output;
  }

});