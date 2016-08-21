var Route = require('lib/config/route');
var Radio = require('backbone.radio');
var LayoutView = require('./layout-view');
var $ = require('jquery');

var ReceiptRoute = Route.extend({

  initialize: function( options ) {
    options = options || {};
    this.container = options.container;
    this.model = options.model;
  },

  fetch: function(){
    return $.when( this.fetchTemplate(), this.fetchOrder() );
  },

  fetchOrder: function(){
    var self = this;
    var orders = Radio.request('entities', 'get', {
      name: 'orders',
      type: 'collection'
    });

    return orders.fetch({
      remote: true,
      data: {
        dummy: 1,
        filter: {
          limit: 1
        }
      }
    })
    .then(function(){
      self.dummy_order = orders.first();
    });
  },

  fetchTemplate: function(){
    this.templates = Radio.request('entities', 'get', {
      name: 'templates',
      type: 'collection'
    });

    // print service may be fetching template
    if(this.templates.isNew()){
      var deferred = $.Deferred();
      this.templates.once('sync', deferred.resolve);
      return deferred;
    }
  },

  render: function() {
    this.layout = new LayoutView({
      model: this.templates.first(),
      _template: this.model.template
    });
    this.listenTo( this.layout, 'show', this.showReceiptTemplate );
    this.container.show(this.layout);
  },

  showReceiptTemplate: function(){
    this.showReceiptTemplateEditorActions();
    this.showReceiptTemplatePreview();
    this.showReceiptTemplatePreviewActions();
  },

  showReceiptTemplatePreview: function(){
    var self = this;
    Radio.request('print', 'view', {
      model: this.dummy_order
    })
    .then(function(view){
      self.layout.getRegion('preview').show(view);
    });
  },

  showReceiptTemplatePreviewActions: function(){
    var view = Radio.request('buttons', 'view', {
      buttons: [{
        action   : 'print',
        className: 'button-primary',
        icon     : 'append'
      }]
    });
    this.listenTo( view, 'action:print', this.print );
    this.layout.getRegion('previewActions').show(view);
  },

  print: function(btn){
    btn.trigger('state', [ 'loading', '' ]);
    this.layout.getRegion('preview').currentView.print()
      .then(function(){
        btn.trigger('state', [ 'success', null ]);
      });
  },

  showReceiptTemplateEditorActions: function(){
    var self = this;
    var view = Radio.request('buttons', 'view', {
      buttons: this.getEditorActions()
    });

    this.listenTo(view, {
      'action:save': function(btn){
        btn.trigger('state', [ 'loading', '' ]);
        self.templates.first().save({
            template: self.layout.editor.getValue()
          })
          .then( function() {
            btn.trigger('state', [ 'success', null ]);
            self.enter();
          })
          .catch(function(){
            btn.trigger('state', ['error', null ]);
          });
      },
      'action:restore': function(btn){
        btn.trigger('state', [ 'loading', '' ]);
        self.templates.first().destroy()
          .then( function(resp) {
            self.templates.add(resp);
            btn.trigger('state', [ 'success', null ]);
            self.enter();
          })
          .catch(function(){
            btn.trigger('state', ['error', null ]);
          });
      }
    });

    this.layout.getRegion('editorActions').show(view);
  },

  getEditorActions: function(){
    var btns = [{
      action   : 'save',
      className: 'button-primary',
      icon     : 'append'
    }];

    if( this.templates.first().id ){
      btns.push({
        action    : 'restore',
        className : 'button-secondary alignright',
        icon      : 'prepend'
      });
    }

    return btns;
  }

});

module.exports = ReceiptRoute;