var ItemView = require('lib/config/item-view');
var Radio = require('backbone.radio');
var App = require('lib/config/application');
var $ = require('jquery');
var polyglot = require('lib/utilities/polyglot');

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
    var self = this,
      ajaxurl = Radio.request('entities', 'get', {
      type: 'option',
      name: 'ajaxurl'
    });

    $.get( ajaxurl, {
      'action'  : 'wc_pos_get_modal',
      'template': 'browser'
    }).always(function(template){
      self.update(template);
    });

    this.modal.header = {
      title: polyglot.t('messages.browser')
    };
  },

  update: function(template){
    this.$el.html(template);
  }
});

module.exports = View;
App.prototype.set('HeaderApp.Views.BrowserModal', View);