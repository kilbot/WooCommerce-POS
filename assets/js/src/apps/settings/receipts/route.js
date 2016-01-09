var Route = require('lib/config/route');
var App = require('lib/config/application');
var LayoutView = require('./layout-view');
var _ = require('lodash');
var Radio = require('backbone.radio');
var ReceiptOptionsRoute = require('./options/route');
var ReceiptTemplateRoute = require('./template/route');
var bb = require('backbone');

// map setting is to route
var hashMap = {
  receipt_options: 'receipts/options',
  receipt_template: 'receipts/template'
};

var Receipts = Route.extend({

  initialize: function( options ) {
    options = options || {};
    this.container = options.container;
    this.model = options.model;
    this.collection = this.model.collection;

    var models = this.collection.parseSettings( this.model.sections );
    this.collection.add( models );
  },

  render: function( section ) {
    this.layout = new LayoutView({ model: this.model });
    this.listenTo( this.layout, 'show', function(){
      this.showSectionTabs();
      this.showSections( section );
    });
    this.container.show(this.layout);
  },

  showSectionTabs: function(){
    var view = Radio.request('tabs', 'view', {
      tabs: _.map( this.model.sections,
        _.partial( _.ary(_.pick, 2), _, ['id', 'label'] )
      ),
      adminSubTabs: true
    });

    // check hash and set tab active
    var activeTab = view.collection.get(
      _.invert( hashMap )[ bb.history.getHash() ]
    );
    if( activeTab ){
      activeTab.set({ active: true });
    } else {
      view.collection.at(0).set({ active: true });
    }

    this.listenTo(view.collection, 'change:active', function(model, active){
      if(active){
        this.navigate(hashMap[model.id], {
          trigger: true
        });
      }
    });

    this.layout.getRegion('tabs').show(view);
  },

  showSections: function( section ){
    if( section === 'template' ){
      return this.showReceiptTemplate();
    }
    return this.showReceiptOptions();
  },

  showReceiptOptions: function(){
    var model = this.collection.get('receipt_options');
    var route = new ReceiptOptionsRoute({
      container : this.layout.getRegion('section'),
      model: model
    });
    route.enter();
  },

  showReceiptTemplate: function(){
    var model = this.collection.get('receipt_template');
    var route = new ReceiptTemplateRoute({
      container : this.layout.getRegion('section'),
      model: model
    });
    route.enter();
  }

  //togglePreview: function( args ) {
  //  var previewArea = _.get(args, ['view', 'ui', 'previewArea']);
  //
  //  if( ! previewArea ){
  //    return;
  //  }
  //
  //  if( ! this.rm ) {
  //    this.initPreview( previewArea );
  //  }
  //
  //  previewArea.slideToggle();
  //},
  //
  //initPreview: function( previewArea ){
  //  this.rm = new Mn.RegionManager();
  //  var region = this.rm.addRegion('preview', previewArea);
  //
  //  var route = new ReceiptRoute({
  //    container: region
  //  });
  //
  //  route.enter();
  //}

});

module.exports = Receipts;
App.prototype.set('SettingsApp.Receipts.Route', Receipts);