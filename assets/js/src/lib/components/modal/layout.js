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
    options = _.defaults( options, {
      header: _.get(options, ['view', 'modal', 'header'], defaultModal.header),
      footer: _.get(options, ['view', 'modal', 'footer'], defaultModal.footer)
    });
    this.mergeOptions( options, ['header', 'footer', 'view'] );
  },

  childEvents: {
    'action:close' : function(){
      Radio.request( 'modal', 'close', this.el.id );
    }
  },

  templateHelpers: function(){
    return {
      header: !!this.header,
      footer: !!this.footer
    };
  },

  onShow: function(){
    if( this.header ){ this.showHeader( this.header ); }
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