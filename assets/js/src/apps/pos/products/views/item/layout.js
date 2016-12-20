var App = require('lib/config/application');
var LayoutView = require('lib/config/layout-view');
var Product = require('./views/product');
var DrawerView = require('./views/drawer/variations');

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
      'close:drawer'    : this.closeDrawer
    });

    this.getRegion('item').show(view);
  },

  openDrawer: function(options){
    if(this.getRegion('drawer').currentView){
      return;
    }
    var variations = this.model.getVariations();
    if(!options.filter){
      variations
        .resetFilters()
        .fetch();
    }
    var view = new DrawerView({ collection: variations });
    this.getRegion('drawer').show(view);
    this.$el.addClass('drawer-open');
  },

  closeDrawer: function(){
    var drawer = this.getRegion('drawer');
    drawer.currentView.$el.slideUp( 250, function(){
      drawer.empty();
    });
    this.$el.removeClass('drawer-open');
  }

});

module.exports = Layout;
App.prototype.set('POSApp.Products.Item.Layout', Layout);