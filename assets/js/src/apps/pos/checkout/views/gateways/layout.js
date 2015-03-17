var LayoutView = require('lib/config/layout-view');
var GatewayView = require('./gateway');
var DrawerView = require('./drawer');

module.exports = LayoutView.extend({
  tagName: 'li',

  template: function() {
    return '<div class="gateway"></div><div class="drawer"></div>';
  },

  regions: {
    gatewayRegion: '.gateway',
    drawerRegion: '.drawer'
  },

  initialize: function(){
    this.listenTo(this.model, 'change:active', this.toggleDrawer);
  },

  onRender: function(){
    var view = new GatewayView({
      model: this.model
    });
    this.gatewayRegion.show(view);
  },

  onShow: function(){
    if(this.model.get('active')){
      this.openDrawer();
    }
  },

  openDrawer: function(){
    var view = new DrawerView({
      model: this.model
    });
    this.drawerRegion.show(view);
    this.$el.addClass('active');
  },

  closeDrawer: function(){
    this.drawerRegion.empty();
    this.$el.removeClass('active');
  },

  toggleDrawer: function(){
    if( this.drawerRegion.hasView() ){
      this.closeDrawer();
    } else {
      this.openDrawer();
    }
  }
});