var ItemView = require('lib/config/item-view');
var $ = require('jquery');
var App = require('lib/config/application');
var Radio = require('backbone.radio');
var hbs = require('handlebars');
var Tmpl = require('./menu.hbs');

var View = ItemView.extend({

  template: hbs.compile( Tmpl ),

  templateHelpers: function(){
    return Radio.request('entities', 'get', {
      type: 'option',
      name: 'menu'
    });
  },

  ui: {
    menuItem: 'li a',
    overlay: '.menu-overlay'
  },

  events: {
    'click @ui.menuItem': 'close',
    'click @ui.overlay': 'close'
  },

  open: function(){
    $('body').addClass('menu-open');
  },

  close: function(){
    $('body').removeClass('menu-open');
  }

});

module.exports = View;
App.prototype.set('HeaderApp.Views.Menu', View);