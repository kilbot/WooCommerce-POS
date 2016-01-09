var Route = require('lib/config/route');
var Radio = require('backbone.radio');
var LayoutView = require('./layout-view');
var ReceiptPreview = require('./preview');
var ReceiptAction = require('./actions');
var App = require('lib/config/application');
var $ = require('jquery');

var ReceiptRoute = Route.extend({

  initialize: function( options ) {
    options = options || {};
    this.container = options.container;
    this.model = options.model;

    this.collection = Radio.request('entities', 'get', {
      name: 'orders',
      type: 'collection'
    });
  },

  fetch: function() {
    return $.when( this.fetchOrder(), this.fetchTemplate() );
  },

  fetchOrder: function(){
    return this.collection.fetch({
      remote: true,
      data: {
        filter: {
          limit: 1
        }
      }
    });
  },

  fetchTemplate: function(){
    var self = this;
    var wc_api = Radio.request('entities', 'get', {
      type: 'option',
      name: 'wc_api'
    });

    return App.prototype.getJSON( wc_api + 'pos/templates/receipt')
      .done( function( data ) {
        self.template = data;
      });
  },

  render: function() {
    this.layout = new LayoutView({
      model: this.model
    });
    this.listenTo( this.layout, 'show', this.showReceiptTemplate );
    this.container.show(this.layout);
  },

  showReceiptTemplate: function(){
    this.showReceiptTemplatePreview();
    this.showReceiptTemplateActions();
  },

  showReceiptTemplatePreview: function(){
    var view = new ReceiptPreview({
      model: this.collection.at(0),
      receipt_template: this.template
    });
    this.layout.getRegion('preview').show(view);
  },

  showReceiptTemplateActions: function(){
    var view = new ReceiptAction();

    this.listenTo( view, 'print', this.print );

    this.layout.getRegion('actions').show(view);
  },

  print: function(){
    this.layout.getRegion('preview').currentView.el.contentWindow.print();
  }

});

module.exports = ReceiptRoute;