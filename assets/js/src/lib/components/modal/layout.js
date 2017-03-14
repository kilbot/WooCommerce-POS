var LayoutView = require('lib/config/layout-view');
var Radio = require('backbone.radio');
var Header = require('./header/view');
var Dialog = require('./dialog/view');
var $ = require('jquery');
var _ = require('lodash');
var bb = require('backbone');

module.exports = LayoutView.extend({

  // default header options (not false)
  header: {},

  // default footer options (save button)
  footer: {
    buttons: [
      {
        type: 'message'
      },{
        action: 'save',
        icon: 'prepend',
        className: 'btn-primary'
      }
    ]
  },

  // template with regions is created during render
  template: false,

  initialize: function( options ){
    this.mergeOptions( options, ['view', 'prefix'] );
    this.header = _.get(this, ['view', 'modal', 'header'], this.header);
    this.footer = _.get(this, ['view', 'modal', 'footer'], this.footer);
  },

  childEvents: {
    'action:close' : function(){
      Radio.request( 'modal', 'close', this.$el.data().vex.id, this.$el.data().vex );
    },
    'action:fullscreen' : function(){
      this.$el.toggleClass(this.prefix + '-fullscreen');
    }
  },

  onRender: function(){
    if( this.header ){
      this.showHeader();
    }

    this.showBody();

    if( this.footer ){
      this.showFooter();
    }
  },

  /**
   * Creates header div and inits region (if required)
   */
  showHeader: function(){
    var view,
      className = this.prefix + '-header',
      container = $('<div/>', { 'class': className });

    this.$el.append( container );
    var region = this.addRegion( 'headerRegion', '.' + className );

    if( this.header instanceof bb.View ){
      view = this.header;
    } else {
      view = new Header( this.header );
    }

    region.show( view );
  },

  /**
   * Creates body div and inits region
   */
  showBody: function(){
    var view,
      className = this.prefix + '-body',
      container = $('<div/>', { 'class': className });

    this.$el.append( container );
    var region = this.addRegion( 'bodyRegion', '.' + className );

    if( this.view instanceof bb.View ){
      view = this.view;
    } else {
      view = new Dialog({ message: this.view });
    }

    region.show( view );
  },

  /**
   * Creates footer div and inits region (if required)
   */
  showFooter: function(){
    var view,
      className = this.prefix + '-footer',
      container = $('<div/>', { 'class': className });

    this.$el.append( container );
    var region = this.addRegion( 'footerRegion', '.' + className );

    if( this.footer instanceof bb.View ){
      view = this.footer;
    } else {
      view = Radio.request('buttons', 'view', this.footer);
    }

    region.show( view );
  }

});