var Behavior = require('lib/config/behavior');
var POS = require('lib/utilities/global');
var Radio = require('backbone.radio');
var hbs = require('handlebars');
var $ = require('jquery');
var _ = require('lodash');

/**
 *
 */
var hasNoNames = function(customer){
  return _.chain(customer)
    .pick('first_name', 'last_name')
    .values()
    .compact()
    .isEmpty()
    .value();
};

/**
 *
 */
var ajax = {
  /**
   * todo: use filtered collection instead for caching?
   */
  delay: 250,
  transport: function (params, success, failure) {
    var customers = Radio.request('entities', 'get', {
      type: 'collection',
      name: 'customers'
    });
    return customers.fetch({
      // wp-admin requires auth
      beforeSend: function(xhr){
        xhr.setRequestHeader('X-WC-POS', 1);
      },
      data: 'filter[q]=' + params.data.q,
      success: function(collection, response){
        success(customers.parse(response));
      },
      error: failure
    });
  },
  processResults: function (data) {
    return {
      results: data
    };
  }
};

/**
 * select2 parse results
 */
var formatResult = function( customer ) {
  var format = '{{first_name}} {{last_name}} ' +
    '{{#if email}}({{email}}){{/if}}';

  if( hasNoNames(customer) ){
    format = '{{username}} ({{email}})';
  }

  var template = hbs.compile(format);
  return template(customer);
};

/**
 * select2 parse selection
 */
var formatSelection = function( customer ) {
  if( customer.text ) {
    return customer.text;
  }

  var format = '{{first_name}} {{last_name}}';

  if( hasNoNames(customer) ){
    format = '{{username}}';
  }

  var template = hbs.compile(format);
  return template(customer);
};

var CustomerSelect = Behavior.extend({

  initialize: function(){
    this.customers = Radio.request('entities', 'get', {
      type: 'collection',
      name: 'customers'
    });
  },

  ui: {
    select: 'select[data-select="customer"]'
  },

  // using custom event to set select2 options
  events: {
    'stickit:init @ui.select': function( e, name ){
      this.view.select2 = this.view.select2 || {};
      this.view.select2[name] = {
        minimumInputLength: 3, // minimum 3 characters to trigger search
        ajax: ajax,
        templateResult: formatResult,
        templateSelection: formatSelection
      };
    }
  },

  onRender: function(){
    // initSelection
    var customer = this.customers.getDefaultCustomer();
    var text = formatSelection( customer );
    this.ui.select
      .html( $('<option />').val(customer.id).text(text) )
      .trigger('change');
  }

});

module.exports = CustomerSelect;
POS.attach('Behaviors.CustomerSelect', CustomerSelect);