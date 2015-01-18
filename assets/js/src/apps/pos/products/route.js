var Route = require('lib/config/route');
var Views = require('./views');
var Tabs = require('lib/components/tabs/view');
var bb = require('backbone');
var entitiesChannel = bb.Radio.channel('entities');
var posChannel = bb.Radio.channel('pos');
var $ = require('jquery');

module.exports = Route.extend({

  initialize: function (options) {
    this.container  = options.container;
    this.filtered   = entitiesChannel.request('get', {
      type: 'filtered',
      name: 'products'
    });
    this.collection = this.filtered.superset();

    // add title to tab
    // super hack, get the label from the menu
    // TODO: put menu items into params, remove this hack
    var label = $('#menu li.products').text();
    posChannel.command('update:tab:label', label, 'left');
  },

  fetch: function() {
    if (this.collection.isNew()) {
      return this.collection.fetch();
    }
  },

  render: function() {
    this.layout = new Views.Layout();

    this.listenTo(this.layout, 'show', function () {
      this.filtered.hideVariations();
      this.showActions();
      this.showTabs();
      this.showProducts();
    });

    this.container.show( this.layout );
  },

  showActions: function() {
    var view = new Views.Actions({
      collection: this.filtered
    });

    this.listenTo(view, 'search:query', function (query) {
      this.filtered.query(query);
    });

    // show
    this.layout.actionsRegion.show(view);
  },

  showTabs: function() {

    // tabs component
    var view = new Tabs({
      collection: entitiesChannel.request('get', {
        type: 'option',
        name: 'tabs'
      })
    });

    this.listenTo(view.collection, 'change:active', function (model) {
      this.filtered.query(model.get('value'), 'tab');
    });

    // listen for new tabs
    this.on('add:new:tab', function (tab) {
      view.collection.add(tab).set({active: true});
    });

    // show tabs component
    this.layout.tabsRegion.show(view);
  },

  showProducts: function() {

    var view = new Views.List({
      collection: this.filtered
    });

    // add to cart
    this.listenTo(view, 'childview:cart:add:clicked', this.sendToCart);

    // variations, new tab filter
    this.listenTo(view, 'childview:product:variations:clicked', this.newTab);

    // show
    this.layout.listRegion.show(view);

  },

  sendToCart: function(childview, args){
    posChannel.command('cart:add', args.model);
  },

  newTab: function(childview, args){
    var newTab = {
      label: args.model.get('title'),
      value: 'parent:' + args.model.get('id'),
      fixed: false
    };
    this.trigger('add:new:tab', newTab);
  }

});