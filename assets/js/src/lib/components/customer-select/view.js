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
    this.customers = Radio.request('entities', 'get', {
      type: 'collection',
      name: 'customers'
    });
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
   * using collection and Select2 query
   * todo: when updating to v4 use Select2 ajax api, eg:
   * ajax: {
        url: "wc_api_url/customers",
        dataType: 'json',
        quietMillis: 250,
        data: function (term, page) {
            return {filter[q]: term};
        },
        results: function (data, page) {
            return { results: data.customers };
        },
        cache: true
    },
   */
  query: _.debounce(function(query){
    var onSuccess = function(customers){
      var results = customers.toJSON();
      results.unshift(customers._guest);
      query.callback({ results: results });
    };
    this.customers
      .fetch({
        data: 'filter[q]=' + query.term,
        success: onSuccess
      });
  }, 250),

  /**
   *
   */
  initSelection: function( element, callback ) {
    var customer;
    if(this.model){ customer = this.model.get('customer'); }
    if(!customer){ customer = this.customers._default; }
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