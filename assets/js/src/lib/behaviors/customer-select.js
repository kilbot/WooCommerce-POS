var Behavior = require('lib/config/behavior');
var App = require('lib/config/application');
var Radio = require('backbone.radio');
var _ = require('lodash');
var $ = require('jquery');
var hbs = require('handlebars');

var CustomerSelect = Behavior.extend({

  initialize: function(){
    var options = Radio.request('entities', 'get', {
      type: 'option',
      name: 'customers'
    });
    options.ajaxurl = Radio.request('entities', 'get', {
      type: 'option',
      name: 'ajaxurl'
    });
    options.wc_nonce = Radio.request('entities', 'get', {
      type: 'option',
      name: 'search_customers_nonce'
    });
    this.mergeOptions(options, ['guest', 'default', 'ajaxurl', 'wc_nonce']);
  },

  ui: {
    select: 'select[data-select="customer"]'
  },

  // using custom event to set select2 options
  events: {
    'stickit:init @ui.select': function( e, name ){
      // options
      var ajaxurl = this.getOption('ajaxurl');
      var nonce = this.getOption('wc_nonce');
      this.view.select2 = this.view.select2 || {};
      this.view.select2[name] = {
        minimumInputLength: 3, // minimum 3 characters to trigger search
        ajax: {
          url: ajaxurl,
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
    // initSelection
    if( _.isEmpty( this.ui.select.data('placeholder') ) ){
      this.initSelection();
    }

  },

  initSelection: function(){
    var customer = this.getOption('default') || this.getOption('guest');
    var name = hbs.helpers.formatCustomerName( customer );
    this.ui.select
      .html( $('<option />').val(customer.id).text(name) )
      .trigger('change');
  }

});

module.exports = CustomerSelect;
App.prototype.set('Behaviors.CustomerSelect', CustomerSelect);