var ItemView = require('lib/config/item-view');
var $ = require('jquery');

module.exports = ItemView.extend({
  el: '#wc-pos-settings-tabs',

  initialize: function( options ) {
    this.$('a[data-tab="' + options.tab + '"]').addClass('nav-tab-active');
  },

  events: {
    'click a' : 'onTabClicked'
  },

  onTabClicked: function(e) {
    e.preventDefault();
    var tab = $(e.target);
    if( tab.hasClass('nav-tab-active') ) {
      return;
    }

    this.trigger( 'settings:tab:clicked', tab.data('tab') );
    tab.addClass('nav-tab-active')
      .siblings('a.nav-tab-active')
      .removeClass('nav-tab-active');
  }
});