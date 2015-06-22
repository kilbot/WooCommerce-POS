var ItemView = require('lib/config/item-view');
var Radio = require('backbone.radio');
var EventSource = global['EventSource'];

module.exports =  ItemView.extend({
  template: function(){
    return '<i class="spinner"></i>';
  },

  initialize: function (options) {
    options = options || {};

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
  },

  onShow: function() {
    var view = this,
        url = this.constructURL(),
        stream = new EventSource(url);

    stream.onmessage = function(e){
      if( e.data === 'complete' ){
        this.close();
        view.$('.spinner').hide();
        Radio.request('modal', 'update', { footer: {
          show: true
        }});
      } else {
        view.$('.spinner').before('<p>' + e.data + '</p>');
      }
    };
  },

  constructURL: function(){
    var ajaxurl = Radio.request('entities', 'get', {
      type: 'option',
      name: 'ajaxurl'
    });
    var nonce = Radio.request('entities', 'get', {
      type: 'option',
      name: 'nonce'
    });

    return ajaxurl + '?action=wc_pos_update_translations&security=' + nonce;
  }
});