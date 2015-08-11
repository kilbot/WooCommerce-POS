var POS = require('lib/utilities/global');
var LayoutView = require('lib/config/layout-view');
var Product = require('./views/product');
var Variations = require('./views/drawer/variations');

var Layout = LayoutView.extend({

  tagName: 'li',

  className: function () {
    return this.model.get('type');
  },

  template: function () {
    return '' +
      '<div class="item"></div>' +
      '<div class="drawer"></div>';
  },

  regions: {
    item  : '.item',
    drawer: '.drawer'
  },

  onRender: function(){
    var view = new Product({
      model: this.model
    });

    this.listenTo( view, {
      'open:drawer'     : this.openDrawer,
      'close:drawer'    : this.closeDrawer,
      'toggle:drawer'   : this.toggleDrawer
    });

    this.getRegion('item').show(view);
  },

  openDrawer: function(options){
    options = options || {};
    options.model = this.model;
    options.className = 'variations';
    var view = new Variations(options);
    this.getRegion('drawer').show(view);
    this.$el.addClass('drawer-open');
  },

  closeDrawer: function(){
    var drawer = this.getRegion('drawer');

    drawer.$el.slideUp( 250, function(){
      drawer.empty();
      drawer.$el.show();
    });

    this.$el.removeClass('drawer-open');
  },

  toggleDrawer: function(options){
    var drawer = this.getRegion('drawer'),
        open = drawer.hasView();

    if(open && options.filter){
      return drawer.currentView.filterVariations(options.filter);
    }

    if(open){
      this.closeDrawer();
    } else {
      this.openDrawer(options);
    }
  }

});

module.exports = Layout;
POS.attach('POSApp.Products.Item.Layout', Layout);