var ItemView = require('lib/config/item-view');
var Radio = require('backbone').Radio;
var EventSource = global['EventSource'];

module.exports =  ItemView.extend({
  initialize: function (options) {
    options = options || {};

    this.template = function(){
      return '<i class="spinner"></i>';
    };

    this.modal = {
      title: options.title,
      footer: false
    };

    this.initUpdate();
  },

  initUpdate: function() {
    var view = this;
    var ajaxurl = Radio.request('entities', 'get', {
      type: 'option',
      name: 'ajaxurl'
    });
    var nonce = Radio.request('entities', 'get', {
      type: 'option',
      name: 'nonce'
    });
    var stream = new EventSource(
      ajaxurl + '?action=wc_pos_update_translations&security=' + nonce
    );
    stream.onmessage = function(e){
      if( e.data === 'complete' ){
        this.close();
        view.$('.spinner').hide();
      } else {
        view.$('.spinner').before('<p>' + e.data + '</p>');
      }
    };
  }
});