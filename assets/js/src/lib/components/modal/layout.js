var LayoutView = require('lib/config/layout-view');
var Radio = require('backbone.radio');
var _ = require('lodash');
var Header = require('./header');
var Body = require('./body');
var Tmpl = require('./modal.hbs');
var hbs = require('handlebars');

var defaultModal = {
  header: {
    title: ''
  },
  tabs: false,
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
  }
};

module.exports = LayoutView.extend({

  template: hbs.compile(Tmpl),

  initialize: function( options ){
    // this.$el.data() = this.options
    options = _.defaults( options, {
      header: _.get(options, ['view', 'modal', 'header'], defaultModal.header),
      tabs  : _.get(options, ['view', 'modal', 'tabs'], defaultModal.tabs),
      footer: _.get(options, ['view', 'modal', 'footer'], defaultModal.footer)
    });
    this.mergeOptions( options, ['header', 'tabs', 'footer', 'view', 'id'] );
    this.render();
  },

  childEvents: {
    'action:close' : function(){
      //Radio.request( 'modal', 'close', this.$el.data().vex.id );
      Radio.request( 'modal', 'close', this.id );
    }
  },

  templateHelpers: function(){
    return {
      header: !!this.header,
      tabs  : !!this.tabs,
      footer: !!this.footer
    };
  },

  onRender: function(){
    if( this.header ){ this.showHeader( this.header ); }
    if( this.tabs ){ this.showTabs( this.tabs ); }
    this.showBody();
    if( this.footer ){ this.showFooter( this.footer ); }
  },

  showHeader: function( options ){
    var container = this.$('[class$="modal-header"]');
    if( container.length === 0 ){
      return;
    }

    var region = this.addRegion( 'headerRegion', container );
    var view = new Header( options );
    region.show( view );
  },

  showTabs: function( options ){
    var container = this.$('[class$="modal-tabs"]');
    if( container.length === 0 ){
      return;
    }

    var view = Radio.request('tabs', 'view', {
      tabs: options
    });

    var region = this.addRegion( 'tabsRegion', container );
    region.show( view );
  },

  showBody: function(){
    var container = this.$('[class$="modal-body"]');
    if( container.length === 0 ){
      return;
    }

    var region = this.addRegion( 'bodyRegion', container );
    var view = this.view || new Body(this.options);
    region.show( view );
  },

  showFooter: function( options ){
    options = options || {};
    var container = this.$('[class$="modal-footer"]');

    if( container.length && options.buttons ){
      var region = this.addRegion( 'footerRegion', container );
      var view = Radio.request('buttons', 'view', options);
      region.$el.toggle( options.show !== false );
      region.show( view );
    }
  }

});