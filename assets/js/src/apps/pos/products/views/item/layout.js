var App = require('lib/config/application');
var LayoutView = require('lib/config/layout-view');
var Product = require('./views/product');
var Variations = require('./views/drawer/variations');

/**
 * @todo Abstract ListItemView
 */

var Layout = LayoutView.extend({

  tagName: 'li',

  className: function () {
    return this.model.get('type');
  },

  template: function () {
    return '' +
      '<div class="list-item"></div>' +
      '<div class="list-drawer"></div>';
  },

  regions: {
    item    : '.list-item',
    drawer  : '.list-drawer'
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
App.prototype.set('POSApp.Products.Item.Layout', Layout);