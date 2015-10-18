var hbs = require('handlebars');
var LayoutView = require('lib/config/layout-view');
var App = require('lib/config/application');

var Layout = LayoutView.extend({

  template: hbs.compile('' +
    '<div class="panel-header list-actions products-header"></div>' +
    '<div class="products-tabs"></div>' +
    '<div class="panel-body list products-list striped"></div>' +
    '<div class="panel-footer products-footer"></div>'
  ),

  regions: {
    actions   : '.products-header',
    tabs      : '.products-tabs',
    list      : '.products-list',
    footer    : '.products-footer'
  },

  attributes: {
    'class'   : 'panel products'
  }

});

module.exports = Layout;
App.prototype.set('POSApp.Products.Layout', Layout);