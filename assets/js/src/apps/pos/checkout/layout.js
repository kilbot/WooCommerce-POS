var LayoutView = require('lib/config/layout-view');
var App = require('lib/config/application');
var hbs = require('handlebars');

var Layout = LayoutView.extend({

  initialize: function(){
    this.template = hbs.compile('' +
      '<div class="panel-header checkout-status"></div>' +
      '<div class="panel-body list checkout-list"></div>' +
      '<div class="list-actions checkout-actions"></div>'
    );
  },

  tagName: 'section',

  regions: {
    status  : '.checkout-status',
    list    : '.checkout-list',
    actions : '.checkout-actions'
  },

  attributes: {
    'class' : 'panel checkout'
  }

});

module.exports = Layout;
App.prototype.set('POSApp.Checkout.Views.Layout', Layout);