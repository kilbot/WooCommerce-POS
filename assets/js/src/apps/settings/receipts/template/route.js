var Route = require('lib/config/route');
var Radio = require('backbone.radio');
var LayoutView = require('./layout-view');
var Preview = require('./preview');
var PreviewActions = require('./actions');
var $ = require('jquery');
// var polyglot = require('lib/utilities/polyglot');

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
      type: 'collection',
      init: true
    });

    return orders.fetch({
      remote: true,
      data: {
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
    var self = this;
    var templates = Radio.request('entities', 'get', {
      name: 'templates',
      type: 'collection',
      init: true
    });

    return templates.fetch({
      data: {
        filter: {
          limit: 1,
          type: 'receipt'
        }
      }
    })
    .then(function(){
      self.template_model = templates.first();
    });
  },

  render: function() {
    this.layout = new LayoutView({
      model: this.template_model,
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
    var view = new Preview({
      model: this.dummy_order,
      template_model: this.template_model
    });
    this.layout.getRegion('preview').show(view);
  },

  showReceiptTemplatePreviewActions: function(){
    var view = new PreviewActions();
    this.listenTo( view, 'print', this.print );
    this.layout.getRegion('previewActions').show(view);
  },

  print: function(){
    this.layout.getRegion('preview').currentView.print();
  },

  showReceiptTemplateEditorActions: function(){
    var self = this;
    var view = Radio.request('buttons', 'view', {
      buttons: this.getEditorActions()
    });

    this.listenTo(view, {
      'action:save': function(btn){
        btn.trigger('state', [ 'loading', '' ]);

        Promise.resolve()
          .then(function(){
            return self.template_model.save({
              template: self.layout.editor.getValue()
            });
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
        self.template_model.destroy()
          .then( function() {
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

    if( this.template_model.id ){
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