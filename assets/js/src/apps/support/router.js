var Router = require('lib/config/router');
var LayoutView = require('./layout-view');
var FormView = require('./form/view');
var StatusView = require('./status/view');
var $ = require('jquery');
var Backbone = require('backbone');
var enititesChannel = Backbone.Radio.channel('entities');

module.exports = Router.extend({
  initialize: function(options) {
    this.container = options.container;
  },

  onBeforeEnter: function() {
    this.layout = new LayoutView();
    this.container.show(this.layout);
    this.container.$el.addClass('two-column');
  },

  routes: {
    'support' : 'show'
  },

  show: function(){
    var ajaxurl = enititesChannel.request( 'get:options', 'ajaxurl');
    this.showForm( ajaxurl );
    this.showStatus( ajaxurl );
  },

  showForm: function( ajaxurl ){
    var view = new FormView();

    this.listenTo( view, 'send:email', function( data ){
      $.post( ajaxurl, {
        action: 'wc_pos_send_support_email',
        payload: data
      });
    });

    this.layout.leftRegion.show( view );
  },

  showStatus: function( ajaxurl ){
    var results = $.get( ajaxurl, {
      action: 'wc_pos_system_status'
    });

    //var view = new StatusView( results );

    //POS.Components.Loading.channel.command( 'show:loading', view, {
    //    region: this.layout.rightRegion,
    //    loading: {
    //        entities: results
    //    }
    //});
  }

});