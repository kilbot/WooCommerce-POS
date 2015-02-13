var Route = require('lib/config/route');
var Layout = require('./views/layout');
var Actions = require('./views/actions');
var List = require('./views/list');
var Variations = require('./views/variations');
var Tabs = require('lib/components/tabs/view');
var Radio = require('backbone.radio');
var _ = require('lodash');
var polyglot = require('lib/utilities/polyglot');

module.exports = Route.extend({

  initialize: function (options) {
    this.container  = options.container;
    this.filtered   = Radio.request('entities', 'get', {
      type: 'filtered',
      name: 'products',
      perPage: 10
    });
    this.collection = this.filtered.superset();

    // products label
    Radio.command('header', 'update:tab', {
      id    : 'left',
      label : polyglot.t('titles.products')
    });
  },

  fetch: function() {
    if (this.collection.isNew()) {
      return this.collection.fetch();
    }
  },

  render: function() {
    this.layout = new Layout();

    this.listenTo(this.layout, 'show', function () {
      this.showActions();
      this.showTabs();
      this.showProducts();
    });

    this.container.show( this.layout );
  },

  showActions: function() {
    var view = new Actions({
      collection: this.filtered
    });

    this.listenTo(view, 'sync:products', function() {
      this.collection.firstSync();
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

    this.listenTo(view.collection, 'change:active', function (model, active) {
      if(active){ this.filtered.query(model.id, 'tab'); }
    });

    // show tabs component
    this.layout.tabsRegion.show(view);
    this.tabs = view;
  },

  showProducts: function() {

    var view = new List({
      collection: this.filtered
    });

    this.listenTo(view,{
      'childview:add:to:cart': function(childview, args){
        Radio.command('entities', 'add:to:cart', {model: args.model});
      },
      'childview:show:variations': this.showVariations
    });

    // show
    this.layout.listRegion.show(view);

  },

  showVariations: function(childview, options){
    options = options || {};

    var view = new Variations(options);

    this.listenTo(view, 'add:to:cart', function(args){
      var product = args.collection.models[0].toJSON();
      Radio.command('entities', 'add:to:cart', product);
      Radio.request('popover', 'close');
    });

    _.extend(options, { view: view }, view.popover);
    Radio.request('popover', 'open', options);
  }

  //showPagination: function(){
  //  var view = new Views.Pagination({
  //    collection: this.filtered
  //  });
  //  // show
  //  this.layout.footerRegion.show(view);
  //}

});