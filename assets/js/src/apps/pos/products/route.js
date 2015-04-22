var Route = require('lib/config/route');
var Layout = require('./layout');
var Actions = require('./views/actions');
var List = require('./views/list');
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
    this.setTabLabel({
      tab   : 'left',
      label : polyglot.t('titles.products')
    });
  },

  fetch: function() {
    var collection = this.filtered.superset();
    if( collection.isNew() ){
      return collection.fetch()
        .then(function(){
          collection.fullSync();
        });
    } else {
      this.filtered
        .resetFilters()
        .removeSort()
        .setPage(0);
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

    this.layout.getRegion('actions').show(view);
  },

  showTabs: function() {
    var view = Radio.request('tabs', 'view', {
      tabs: this.tabsArray()
    });

    this.listenTo(view.collection, 'active:tab', function(model) {
      this.filtered.query('tab', model.id);
    });

    // show tabs component
    this.layout.getRegion('tabs').show(view);
    this.tabs = view;
  },

  showProducts: function() {
    var view = new List({
      collection: this.filtered
    });
    this.layout.getRegion('list').show(view);
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