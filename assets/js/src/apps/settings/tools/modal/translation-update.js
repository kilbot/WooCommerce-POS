var ItemView = require('lib/config/item-view');
var Radio = require('backbone.radio');
var EventSource = global['EventSource'];

module.exports =  ItemView.extend({
  initialize: function (options) {
    options = options || {};

    this.template = function(){
      return '<i class="spinner"></i>';
    };

    this.modal = {
      header: {
        title: options.title
      },
      footer: {
        show: false,
        buttons: [{
          action: 'close',
          className: 'button'
        }]
      }
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
        Radio.command('modal', 'update', { footer: {
          show: true
        }});
      } else {
        view.$('.spinner').before('<p>' + e.data + '</p>');
      }
    };
  }
});