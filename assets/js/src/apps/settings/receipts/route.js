var Route = require('lib/config/route');
var App = require('lib/config/application');
var View = require('./view');
var _ = require('lodash');
var Mn = require('backbone.marionette');
var ReceiptRoute = require('./preview/route');

var Receipts = Route.extend({

  initialize: function( options ) {
    options = options || {};
    this.container = options.container;
    this.model = options.model;
  },

  fetch: function() {
    if(this.model && this.model.isNew()){
      return this.model.fetch();
    }
  },

  render: function() {
    var view = new View({
      model: this.model,
      template: this.model.template
    });

    this.listenTo( view, 'toggle:preview', this.togglePreview );

    this.container.show(view);
  },

  togglePreview: function( args ) {
    var previewArea = _.get(args, ['view', 'ui', 'previewArea']);

    if( ! previewArea ){
      return;
    }

    if( ! this.rm ) {
      this.initPreview( previewArea );
    }

    previewArea.slideToggle();
  },

  initPreview: function( previewArea ){
    this.rm = new Mn.RegionManager();
    var region = this.rm.addRegion('preview', previewArea);

    var route = new ReceiptRoute({
      container: region
    });

    route.enter();
  }

});

module.exports = Receipts;
App.prototype.set('SettingsApp.Receipts.Route', Receipts);