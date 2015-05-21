var ItemView = require('lib/config/item-view');
var $ = require('jquery');
var _ = require('lodash');
var POS = require('lib/utilities/global');

var View = ItemView.extend({
  template: '#tmpl-menu',
  tagName: 'ul',

  initialize: function(){
    _.bindAll(this, 'open', 'close');
  },

  ui: {
    menuItem: 'li a'
  },

  events: {
    'click @ui.menuItem': 'goTo'
  },

  goTo: function(){
    this.close();
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
POS.attach('HeaderApp.Views.Menu', View);