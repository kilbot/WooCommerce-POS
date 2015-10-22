var ItemView = require('lib/config/item-view');
var InfiniteListView = require('lib/config/infinite-list-view');
var polyglot = require('lib/utilities/polyglot');
var Tmpl = require('./customer-list.hbs');
var hbs = require('handlebars');

var Customer = ItemView.extend({
  template: hbs.compile(Tmpl),
  tagName: 'li'
});

var NoCustomer = ItemView.extend({
  tagName: 'li',
  className: 'empty',
  template: function(){
    return polyglot.t('messages.no-customer');
  }
});

var Customers = InfiniteListView.extend({
  childView: Customer,
  emptyView: NoCustomer,
  childViewContainer: 'ul',

  initialize: function(options){
    options = options || {};
    var filtered = options.collection;
    var customers = filtered.superset();

    if( customers.isNew() ){
      return customers.fetch()
        .then(function(){
          customers.fullSync();
        });
    } else {
      filtered.removeTransforms();
    }
  }
});


module.exports = Customers;