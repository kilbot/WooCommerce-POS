var hbs = require('handlebars');
var LayoutView = require('lib/config/layout-view');
var App = require('lib/config/application');

var Layout = LayoutView.extend({

  template: hbs.compile('' +
    '<div class="list-actions"></div>' +
    '<div class="list-tabs tabs infinite-tabs"></div>' +
    '<div class="list"></div>' +
    '<div class="list-footer"></div>'
  ),

  tagName: 'section',

  regions: {
    actions   : '.list-actions',
    tabs      : '.list-tabs',
    list      : '.list',
    footer    : '.list-footer'
  },

  attributes: {
    'class'   : 'module products-module'
  }

});

module.exports = Layout;
App.prototype.set('POSApp.Products.Layout', Layout);