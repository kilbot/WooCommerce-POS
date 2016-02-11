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
    this.container = options.layout.getRegion('settings');
    this.footer = options.layout.getRegion('footer');
    this.model = options.model;
    this.collection = this.model.collection;
    this.collection.add( this.model.sections, { parse: true } );
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

    // check hash and set tab active
    var activeId = _.invert( hashMap )[ bb.history.getHash() ] ||
      'receipt_options';

    var view = Radio.request('tabs', 'view', {
      collection: _.map( this.model.sections,
        _.partial( _.ary(_.pick, 2), _, ['id', 'label'] )
      ),
      tabsClassName: 'wc_pos-sub-nav-tab-wrapper',
      activeClassName: 'wc_pos-sub-nav-tab-active',
      childViewOptions: function( model ){
        var options = {
          className: 'wc_pos-sub-nav-tab'
        };
        if( model.id === activeId ){
          options.className += ' wc_pos-sub-nav-tab-active';
        }
        return options;
      }
    });

    this.listenTo(view, 'childview:click', function(view){
      this.navigate(hashMap[view.model.id], { trigger: true });
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
    this.showFooter({model: model});
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

    this.footer.show(view);

  }

});

module.exports = Receipts;
App.prototype.set('SettingsApp.Receipts.Route', Receipts);