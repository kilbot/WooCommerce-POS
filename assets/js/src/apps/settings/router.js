var App = require('lib/config/application');
var Router = require('lib/config/router');
var LayoutView = require('./layout-view');
var General = require('./general/route');
var Products = require('./products/route');
var Cart = require('./cart/route');
var Customers = require('./customers/route');
var Checkout = require('./checkout/route');
var Receipts = require('./receipts/route');
var HotKeys = require('./hotkeys/route');
var Access = require('./access/route');
var bb = require('backbone');
var Radio = bb.Radio;
var _ = require('lodash');

var SettingsRouter = Router.extend({

  initialize: function(options) {
    this.container = options.container;
    this.collection = Radio.request('entities', 'get', {
      type: 'collection',
      name: 'settings'
    });
  },

  onBeforeEnter: function() {
    this.layout = new LayoutView();
    this.listenTo(this.layout, 'show', this.showTabs);
    this.container.show(this.layout);
  },

  routes: {
    ''          : 'showGeneral',
    'general'   : 'showGeneral',
    'products'  : 'showProducts',
    'cart'      : 'showCart',
    'customers' : 'showCustomers',
    'checkout'  : 'showCheckout',
    'receipts'  : 'showReceipts',
    'receipts/:section'  : 'showReceipts',
    'hotkeys'   : 'showHotkeys',
    'access'    : 'showAccess'
  },

  onBeforeRoute: function() {
    this.layout.getRegion('footer').empty();
  },

  showTabs: function(){
    var settings = Radio.request('entities', 'get', {
      type: 'option',
      name: 'settings'
    });

    // get active tab from url fragment
    var activeId = bb.history.getHash().split('/')[0] || 'general';

    // pass id & label collection to tabs
    var view = Radio.request('tabs', 'view', {
      collection: _.map( settings,
        _.partial( _.ary(_.pick, 2), _, ['id', 'label'] )
      ),
      tabsTagName: 'div',
      tabsClassName: 'nav-tab-wrapper',
      activeClassName: 'nav-tab-active',
      childViewOptions: function( model ){
        var options = {
          tagName: 'a',
          className: 'nav-tab'
        };
        if( model.id === activeId ){
          options.className += ' nav-tab-active';
        }
        return options;
      }
    });

    this.listenTo(view, 'childview:click', function(view){
      this.navigate(view.model.id, { trigger: true });
    });

    this.layout.getRegion('tabs').show(view);
  },

  showGeneral: function(){
    var model = this.collection.get('general');
    this.showFooter({model: model});
    return new General({
      container : this.layout.getRegion('settings'),
      model: model
    });
  },

  showProducts: function(){
    var model = this.collection.get('products');
    this.showFooter({model: model});
    return new Products({
      container : this.layout.getRegion('settings'),
      model: model
    });
  },

  showCart: function(){
    var model = this.collection.get('cart');
    this.showFooter({model: model});
    return new Cart({
      container : this.layout.getRegion('settings'),
      model: model
    });
  },

  showCustomers: function(){
    var model = this.collection.get('customers');
    this.showFooter({model: model});
    return new Customers({
      container : this.layout.getRegion('settings'),
      model: model
    });
  },

  showCheckout: function(){
    var model = this.collection.get('checkout');
    this.showFooter({model: model});
    return new Checkout({
      container : this.layout.getRegion('settings'),
      model: model
    });
  },

  showReceipts: function(){
    var model = this.collection.get('receipts');
    return new Receipts({
      model: model,
      layout: this.layout
    });
  },

  showHotkeys: function(){
    var model = this.collection.get('hotkeys');
    this.showFooter({model: model});
    return new HotKeys({
      container : this.layout.getRegion('settings'),
      model: model
    });
  },

  showAccess: function(){
    var model = this.collection.get('access');
    this.showFooter({model: model});
    return new Access({
      container : this.layout.getRegion('settings'),
      model: model
    });
  },

  showFooter: function(options){

    _.defaults(options, {
      buttons: [
        {
          action    : 'save',
          className : 'button-primary',
          icon      : 'append'
        },{
          type: 'message'
        },{
          action    : 'restore',
          className : 'button-secondary alignright',
          icon      : 'prepend'
        }
      ]
    });

    var view = Radio.request('buttons', 'view', options);

    this.listenTo(view, {
      'action:save': function(btn){
        btn.trigger('state', [ 'loading', '' ]);
        options.model.save()
          .done( function(){
            btn.trigger('state', [ 'success', null ]);
          })
          .fail( function(){
            btn.trigger('state', ['error', null ]);
          });
      },
      'action:restore': function(btn){
        btn.trigger('state', [ 'loading', '' ]);
        options.model.fetch({ data: { defaults: true } })
          .done( function(){
            btn.trigger('state', [ 'success', null ]);
          })
          .fail( function(){
            btn.trigger('state', ['error', null ]);
          });
      }
    });

    this.layout.getRegion('footer').show(view);

  }

});

module.exports = SettingsRouter;
App.prototype.set('SettingsApp.Router', SettingsRouter);