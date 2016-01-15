var Route = require('lib/config/route');
var Radio = require('backbone.radio');
var LayoutView = require('./layout-view');
var Preview = require('./preview');
var PreviewActions = require('./actions');
var App = require('lib/config/application');
var $ = require('jquery');
var polyglot = require('lib/utilities/polyglot');

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

  fetch: function(){
    return $.when( this.fetchTemplate(), this.fetchOrder() );
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
      model: this.model,
      template_data: this.template
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
      model: this.collection.at(0),
      receipt_template: this.template.template
    });
    this.layout.getRegion('preview').show(view);
  },

  showReceiptTemplatePreviewActions: function(){
    var view = new PreviewActions();
    this.listenTo( view, 'print', this.print );
    this.layout.getRegion('previewActions').show(view);
  },

  print: function(){
    this.layout.getRegion('preview').currentView.el.contentWindow.print();
  },

  showReceiptTemplateEditorActions: function(){
    var self = this;
    var view = Radio.request('buttons', 'view', {
      buttons: this.getEditorActions()
    });

    this.listenTo(view, {
      'action:save': function(btn){
        btn.trigger('state', [ 'loading', '' ]);
        self.enter();
        //options.model.save()
        //  .done( function(){
        //    btn.trigger('state', [ 'success', null ]);
        //  })
        //  .fail( function(){
        //    btn.trigger('state', ['error', null ]);
        //  });
      },
      'action:delete': function(btn){
        btn.trigger('state', [ 'loading', '' ]);
        //options.model.fetch({ data: { defaults: true } })
        //  .done( function(){
        //    btn.trigger('state', [ 'success', null ]);
        //  })
        //  .fail( function(){
        //    btn.trigger('state', ['error', null ]);
        //  });
      }
    });

    this.layout.getRegion('editorActions').show(view);
  },

  getEditorActions: function(){
    if( this.template.custom ){
      return [
        {
          action    : 'save',
          className : 'button-primary',
          icon      : 'append'
        },{
          //  type: 'message'
          //},{
          action    : 'delete',
          label     : polyglot.t('buttons.delete-template'),
          className : 'button-secondary alignright',
          icon      : 'prepend'
        }
      ];
    }

    return [
      {
        action    : 'copy',
        label     : polyglot.t('buttons.copy-file'),
        className : 'button-primary',
        icon      : 'append'
      }
    ];
  }

});

module.exports = ReceiptRoute;