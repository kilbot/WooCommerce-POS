var ItemView = require('lib/config/item-view');
var Select2 = require('lib/components/select2/behavior');
var _ = require('lodash');
var Radio = require('backbone').Radio;
var hbs = require('handlebars');
var POS = require('lib/utilities/global');
var debug = require('debug')('customerSelect');

// Select view
var View = ItemView.extend({
  template: function() {
    return '<input name="customer" type="hidden" class="select2">';
  },

  initialize: function(options){
    options = options || {};
    this.model = options.model;
    this.filtered = Radio.request('entities', 'get', {
      type: 'filtered',
      name: 'customers'
    });
    var customers = Radio.request('entities', 'get', {
      type: 'option',
      name: 'customers'
    });
    if(customers){
      this.guest = customers.guest;
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
    this.filtered.superset()
      .fetch()
      .done(function(){
        self.filtered.query(query.term);
        var results = self.filtered.toJSON();
        results.unshift(self.guest);
        query.callback({ results: results });
        self.filtered.resetFilters();
      });
  },

  /**
   *
   */
  initSelection: function( element, callback ) {
    var customer;
    if(this.model){
      customer = this.model.get('customer');
    } else {
      debug('no initial customer');
    }
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