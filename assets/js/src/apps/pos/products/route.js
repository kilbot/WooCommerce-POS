var Route = require('lib/config/route');
var Layout = require('./views/layout');
var Actions = require('./views/actions');
var List = require('./views/list');
var Variations = require('./views/variations');
var Radio = require('backbone.radio');
var _ = require('lodash');
var polyglot = require('lib/utilities/polyglot');

module.exports = Route.extend({

  initialize: function (options) {
    this.container  = options.container;
    this.filtered   = Radio.request('entities', 'get', {
      type    : 'filtered',
      name    : 'products',
      perPage : 10
    });
    this.collection = this.filtered.superset();
    this.setTabLabel({
      tab   : 'left',
      label : polyglot.t('titles.products')
    });
  },

  fetch: function() {
    if( this.collection.isNew() ){
      return this.collection.fetch();
    } else {
      this.filtered.setPage(1);
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

    this.layout.actionsRegion.show(view);
  },

  showTabs: function() {

    var view = Radio.request('tabs', 'view', {
      tabs: this.tabsArray()
    });

    this.listenTo(view.collection, 'active:tab', function(model) {
      this.filtered.query(model.id, 'tab');
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
        Radio.command('router', 'add:to:cart', {model: args.model});
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
      Radio.command('router', 'add:to:cart', product);
      Radio.request('popover', 'close');
    });

    _.extend(options, { view: view, parent: childview }, view.popover);
    Radio.request('popover', 'open', options);
  },

  tabsArray: function(){
    var tabs = Radio.request('entities', 'get', {
      type: 'option',
      name: 'tabs'
    });
    return _.map(tabs);
  }

  //showPagination: function(){
  //  var view = new Views.Pagination({
  //    collection: this.filtered
  //  });
  //  // show
  //  this.layout.footerRegion.show(view);
  //}

});