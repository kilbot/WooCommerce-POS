var ItemView = require('lib/config/item-view');
var Select2 = require('lib/components/select2/behavior');
var _ = require('lodash');
var Radio = require('backbone.radio');
var hbs = require('handlebars');
var POS = require('lib/utilities/global');
//var debug = require('debug')('customerSelect');

// Select view
var View = ItemView.extend({

  template: function(){
    return '<input name="customer" type="hidden" class="select2">';
  },

  initialize: function(options){
    options = options || {};
    this.model = options.model;

    this.collection = Radio.request('entities', 'get', {
      type: 'collection',
      name: 'customers'
    });

    var customers = Radio.request('entities', 'get', {
      type: 'option',
      name: 'customers'
    });

    if(customers){
      this.guest_customer = customers.guest;
      this.default_customer = customers['default'] || customers.guest;
    }
  },

  behaviors: {
    Select2: {
      behaviorClass: Select2,
      minimumInputLength: 2
    }
  },

  ui: {
    select: 'input[name="customer"]'
  },

  events: {
    'change @ui.select' : 'onSelect'
  },

  /**
   *
   */
  query: function(query){
    var self = this;
    this.collection
      .fetch({
        data: 'filter[q]=' + query.term,
        beforeSend: function(xhr){
          xhr.setRequestHeader('X-WC-POS', 1);
        }
      })
      .done(function(){
        var results = self.collection.toJSON();
        results.unshift(self.guest_customer);
        query.callback({ results: results });
      });
  },

  /**
   *
   */
  initSelection: function( element, callback ) {
    var customer;
    if(this.model){ customer = this.model.get('customer'); }
    if(!customer){ customer = this.default_customer; }
    callback( customer );
  },

  /**
   * select2 parse results
   */
  formatResult: function( customer ) {
    var format = '{{first_name}} {{last_name}} ' +
      '{{#if email}}({{email}}){{/if}}';

    if( this.hasNoNames(customer) ){
      format = '{{username}} ({{email}})';
    }

    var template = hbs.compile(format);
    return template(customer);
  },

  /**
   * select2 parse selection
   */
  formatSelection: function( customer ) {
    var format = '{{first_name}} {{last_name}}';

    if( this.hasNoNames(customer) ){
      format = '{{username}}';
    }

    var template = hbs.compile(format);
    return template(customer);
  },

  /**
   *
   */
  hasNoNames: function(customer){
    return _.chain(customer)
      .pick('first_name', 'last_name')
      .values()
      .compact()
      .isEmpty()
      .value();
  },

  /**
   *
   */
  onSelect: function(e) {
    this.trigger( 'customer:select', e.added );
  }

});

module.exports = View;
POS.attach('Components.CustomerSelect.View', View);