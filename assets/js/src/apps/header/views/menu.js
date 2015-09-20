var ItemView = require('lib/config/item-view');
var $ = require('jquery');
var _ = require('lodash');
var App = require('lib/config/application');
var Radio = require('backbone.radio');
var hbs = require('handlebars');
var Tmpl = require('./menu.hbs');

var View = ItemView.extend({
  tagName: 'ul',
  template: hbs.compile( Tmpl ),

  initialize: function(){
    _.bindAll(this, 'open', 'close');
  },

  templateHelpers: function(){
    return Radio.request('entities', 'get', {
      type: 'option',
      name: 'menu'
    });
  },

  ui: {
    menuItem: 'li a'
  },

  events: {
    'click @ui.menuItem': 'close'
  },

  open: function(){
    // open menu & append backdrop
    $('body').addClass('menu-open');
    this.backdrop = $('<div class="modal-backdrop in"></div>');
    this.backdrop.height('100%');
    $('body').append(this.backdrop);

    // listen for clicks on backdrop
    this.backdrop.on('click', this.close);
  },

  close: function(){
    // close menu
    $('body').removeClass('menu-open');

    // teardown backdrop
    if(this.backdrop) {
      this.backdrop.remove();
      delete this.backdrop;
    }
  }

});

module.exports = View;
App.prototype.set('HeaderApp.Views.Menu', View);