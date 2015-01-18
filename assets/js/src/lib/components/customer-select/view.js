var ItemView = require('lib/config/item-view');
var Select2 = require('lib/components/select2/behavior');
var _ = require('lodash');
var bb = require('backbone');
var entitiesChannel = bb.Radio.channel('entities');
var hbs = require('handlebars');

// Select view
module.exports = ItemView.extend({
  template: function() {
    return '<input name="customer" type="hidden" class="select2">'
  },

  behaviors: {
    Select2: {
      behaviorClass: Select2,
      minimumInputLength: 2,
      //ajax: {
      //  url: function() {
      //    return entitiesChannel.request('get:options', 'ajaxurl');
      //  },
      //  dataType: 'json',
      //  quietMillis: 250,
      //  data: function( term ) {
      //    return {
      //      term: term,
      //      action: 'wc_pos_json_search_customers'
      //    };
      //  },
      //  results: function( data ) {
      //    var customers = [];
      //    _( data ).each( function( obj ) {
      //      customers.push( obj );
      //    });
      //    return { results: customers };
      //  }
      //},
      initSelection: function( element, callback ) {
        var customer = entitiesChannel.request('get', {
          type: 'option',
          name: 'default_customer'
        });
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

  /**
   * select2 query function
   * @param query
   */
  query: function( query ){
    var term = query.term.toLowerCase();
    var collection = this.customerCollection();
    collection.filterBy(function(model) {
      var attributes = _.pick( model.attributes, ['email', 'first_name', 'last_name'] );
      return _.any( _.values( attributes ), function( value ){
        // match for attributes starting with query term
        return value.toLowerCase().indexOf( term ) === 0;
      });
    });
    var results = collection.toJSON();
    //results.unshift( app.getOption('default_customer') );
    query.callback({ results: results });
  },

  /**
   * select2 parse results
   */
  formatResult: function( customer ) {
    var format = '{{first_name}} {{last_name}} ({{email}})';

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
  }

});