module.exports = function() {
  var Widget = this.Widget || {};

  Widget.ProductsModule = Widget.extend({
    root: '.products-module'
  });

  Widget.Product = Widget.extend({
    getTitle: function(){
      return this.read('.item .title strong');
    }
  });

  Widget.ProductList = Widget.List.extend({
    root: '.products-module .list ul',
    itemSelector: 'li',
    itemClass: Widget.Product
  });

  Widget.ProductFilter = Widget.extend({
    root: '.products-module .list-actions'
  });
};