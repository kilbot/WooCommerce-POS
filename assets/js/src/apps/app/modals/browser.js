var ItemView = require('lib/config/item-view');
var Radio = require('backbone.radio');
var App = require('lib/config/application');
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
      wc_api = Radio.request('entities', 'get', {
      type: 'option',
      name: 'wc_api'
    });

    App.prototype.getJSON( wc_api + 'pos/templates/modal/browser' )
      .done( function(tmpl){
        self.$el.html(tmpl);
      });

    this.modal.header = {
      title: polyglot.t('messages.browser')
    };
  }

});

module.exports = View;
App.prototype.set('HeaderApp.Views.BrowserModal', View);