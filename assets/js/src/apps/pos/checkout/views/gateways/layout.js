var LayoutView = require('lib/config/layout-view');
var GatewayView = require('./gateway');
var DrawerView = require('./drawer');

module.exports = LayoutView.extend({
  tagName: 'li',

  className: function(){
    if( this.model.get('active') ){
      return 'active';
    }
  },

  template: function() {
    return '<div class="gateway"></div><div class="drawer"></div>';
  },

  regions: {
    gateway: '.gateway',
    drawer: '.drawer'
  },

  modelEvents: {
    'change:active': 'toggleActive'
  },

  onRender: function(){
    var view = new GatewayView({
      model: this.model
    });
    this.getRegion('gateway').show(view);
  },

  onShow: function(){
    if(this.model.get('active')){
      this.openDrawer();
    }
  },

  openDrawer: function(){
    var view = new DrawerView({
      model: this.model,
      template: this.model.getPaymentFields()
    });
    this.getRegion('drawer').show(view);
  },

  closeDrawer: function(){
    this.getRegion('drawer').empty();
  },

  toggleActive: function( model, active ){
    if( active ){
      this.$el.addClass('active');
      return this.openDrawer();
    }
    this.$el.removeClass('active');
    return this.closeDrawer();
  }

});