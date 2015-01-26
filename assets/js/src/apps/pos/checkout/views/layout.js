var LayoutView = require('lib/config/layout-view');
var POS = require('lib/utilities/global');
var hbs = require('handlebars');

var Layout = LayoutView.extend({

  initialize: function(){
    this.template = hbs.compile('' +
      '<div class="list-header"></div>' +
      '<div class="list"></div>' +
      '<div class="list-actions"></div>' +
      '<div class="list-footer"></div>'
    );
  },

  tagName: 'section',

  regions: {
    headerRegion  : '.list-header',
    listRegion    : '.list',
    actionsRegion : '.list-actions',
    footerRegion  : '.list-footer'
  },

  attributes: {
    'class'         : 'module checkout-module'
  }

});

module.exports = Layout;
POS.attach('POSApp.Checkout.Views.Layout', Layout);