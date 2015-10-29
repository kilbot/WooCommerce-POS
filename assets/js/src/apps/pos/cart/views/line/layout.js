var LayoutView = require('lib/config/layout-view');
var ItemView = require('./views/item');
var DrawerView = require('./views/drawer');
var $ = require('jquery');

/**
 * @todo Abstract ListItemView
 */

/* jshint -W071 */
$.fn.selectText = function(){
  var range, element = this[0];
  if (document.body.createTextRange) {
    range = document.body.createTextRange();
    range.moveToElementText(element);
    range.select();
  } else if (window.getSelection) {
    var selection = window.getSelection();
    range = document.createRange();
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
  }
};
/* jshint +W071 */

module.exports = LayoutView.extend({

  tagName: 'li',

  className: function() { return this.model.get('type'); },

  template: function() {
    return '<div class="list-item cart-item"></div>' +
      '<div class="list-drawer cart-drawer"></div>';
  },

  regions: {
    item    : '.list-item',
    drawer  : '.list-drawer'
  },

  modelEvents: {
    'pulse': 'pulse'
  },

  onRender: function(){
    var view = new ItemView({ model: this.model });

    this.listenTo( view, 'drawer:open', this.openDrawer );
    this.listenTo( view, 'drawer:close', this.closeDrawer );
    this.listenTo( view, 'drawer:toggle', this.toggleDrawer );

    this.getRegion('item').show(view);
  },

  openDrawer: function(){
    var view = new DrawerView({ model: this.model });
    this.getRegion('drawer').show(view);
    this.$el.addClass('drawer-open');
  },

  closeDrawer: function(){
    this.getRegion('drawer').empty();
    this.$el.removeClass('drawer-open');
  },

  toggleDrawer: function(){
    if( this.getRegion('drawer').hasView() ){
      this.closeDrawer();
    } else {
      this.openDrawer();
    }
  },

  pulse: function(opt) {
    if(opt === 'remove'){ return; }
    var el = this.$el, type = this.model.get( 'type' );

    // scroll to row
    el.addClass('pulse-in')
      .scrollIntoView({ complete: function(){
        el.animate({backgroundColor: 'transparent'}, 500, function() {
          $(this).removeClass('pulse-in').removeAttr('style');
          if( type === 'fee' || type === 'shipping' ) {
            $('.title strong', this).focus().selectText();
          }
        });
      }});

  }

});