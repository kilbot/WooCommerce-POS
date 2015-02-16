var ItemView = require('lib/config/item-view');
var Radio = require('backbone.radio');
var POS = require('lib/utilities/global');
var $ = require('jquery');

var View = ItemView.extend({
  template: function(){
    return '<i class="icon icon-spinner"></i>';
  },

  modal: {
    footer: {
      buttons: [
        { action: 'close' }
      ]
    }
  },

  initialize: function(){
    var ajaxurl = Radio.request('entities', 'get', {
      type: 'option',
      name: 'ajaxurl'
    });

    return $.getJSON( ajaxurl, {
      'action'  : 'wc_pos_get_modal',
      'template': 'browser'
    });
  },

  update: function(){

  }
});

module.exports = View;
POS.attach('HeaderApp.Views.BrowserModal', View);