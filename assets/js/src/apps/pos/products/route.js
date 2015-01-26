var Route = require('lib/config/route');
var Views = require('./views');
var Tabs = require('lib/components/tabs/view');
var Radio = require('backbone').Radio;
//var $ = require('jquery');

module.exports = Route.extend({

  initialize: function (options) {
    this.container  = options.container;
    this.filtered   = Radio.request('entities', 'get', {
      type: 'filtered',
      name: 'products'
    });
    this.collection = this.filtered.superset();

    // add title to tab
    // super hack, get the label from the menu
    // TODO: put menu items into params, remove this hack
    //var label = $('#menu li.products').text();
    //posChannel.command('update:tab:label', label, 'left');
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
    this.layout.actionsRegion.show(view);
  },

  showTabs: function() {

    // tabs component
    var view = new Tabs({
      collection: Radio.request('entities', 'get', {
        type: 'option',
        name: 'tabs'
      })
    });

    this.listenTo(view.collection, 'change:active', function (model) {
      this.filtered.query(model.get('value'), 'tab');
    });

    // show tabs component
    this.layout.tabsRegion.show(view);
    this.tabs = view;
  },

  showProducts: function() {

    var view = new Views.List({
      collection: this.filtered
    });

    this.listenTo(view,{
      'childview:add:to:cart': function(childview, args){
        Radio.command('entities', 'add:to:cart', {model: args.model});
      },
      'childview:show:variations': function(childview, args){
        this.tabs.collection.add({
          label: args.model.get('title'),
          value: 'parent:' + args.model.get('id'),
          fixed: false
        }).set({active: true});
      }
    });

    // show
    this.layout.listRegion.show(view);

  }

});