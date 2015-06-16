module.exports = function() {
  var Widget = this.Widget || {};

  Widget.CartModule = Widget.extend({
    root: '.cart-module'
  });

  Widget.Cart = Widget.extend({
    getTitle: function(){
      return this.read('.item .title strong');
    },
    getQuantity: function(){
      return this.read('.item .qty input');
    }
  });

  Widget.CartList = Widget.List.extend({
    root: '.cart-module .list ul',
    itemSelector: 'li',
    itemClass: Widget.Cart
  });

  Widget.CartFilter = Widget.extend({
    root: '.cart-module .list-actions'
  });

  Widget.CartTabs = Widget.extend({
    root: '.cart-module .list-tabs'
  });
};