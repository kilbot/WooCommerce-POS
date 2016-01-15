var Behavior = require('lib/config/behavior');
var App = require('lib/config/application');
var Radio = require('backbone.radio');
var $ = require('jquery');
var hbs = require('handlebars');

var CustomerSelect = Behavior.extend({

  initialize: function(){
    var options = Radio.request('entities', 'get', {
      type: 'option',
      name: 'customers'
    });
    options.wc_nonce = Radio.request('entities', 'get', {
      type: 'option',
      name: 'search_customers_nonce'
    });
    this.mergeOptions(options, ['guest', 'default', 'wc_nonce']);
  },

  ui: {
    select: 'select[data-select="customer"]'
  },

  // using custom event to set select2 options
  events: {
    'stickit:init @ui.select': function( e, name ){
      // options
      var nonce = this.getOption('wc_nonce');
      var guest = this.getOption('guest');
      this.view.select2 = this.view.select2 || {};
      this.view.select2[name] = {
        minimumInputLength: 3, // minimum 3 characters to trigger search
        ajax: {
          url: window.ajaxurl,
          dataType: 'json',
          delay: 250,
          data: function (params) {
            return {
              term      : params.term, // search term
              action    : 'woocommerce_json_search_customers',
              security  : nonce
            };
          },
          processResults: function (data) {
            var terms = [];
            if ( data ) {
              $.each( data, function( id, text ) {
                terms.push({
                  id: id,
                  text: text
                });
              });
            }
            terms.unshift({
              id: '0',
              text: guest.first_name
            });
            return { results: terms };
          },
          cache: true
        },
        escapeMarkup: function( m ) {
          return m;
        }
      };
    }
  },

  onRender: function(){
    this.appendOptions( this.getOption('guest') );
    if( this.getOption('default') ){
      this.appendOptions( this.getOption('default') );
    }
    this.ui.select.trigger('change');
  },

  appendOptions: function( customer ){
    var name = hbs.helpers.formatCustomerName( customer );
    this.ui.select.append( $('<option />').val(customer.id).text(name) );
  }

});

module.exports = CustomerSelect;
App.prototype.set('Behaviors.CustomerSelect', CustomerSelect);