var ItemView = require('lib/config/item-view');
var Backbone = require('backbone');
var entitiesChannel = Backbone.Radio.channel('entities');
var _ = require('lodash');
var $ = require('jquery');

module.exports =  ItemView.extend({
  template: _.template( $('#tmpl-translation-update-modal').html() ),

  behaviors: {
    Modal: {
      behaviorClass: require('lib/components/modal/behavior')
    }
  },

  initialize: function (options) {
    this.trigger('modal:open');
    this.initUpdate();
  },

  events: {
    'click .close' : 'cancel'
  },

  cancel: function () {
    this.trigger('modal:close');
  },

  initUpdate: function() {
    var view = this;
    var ajaxurl = global['ajaxurl'];
    var nonce = entitiesChannel.request( 'get:options', 'nonce' );
    var stream = new EventSource( ajaxurl + '?action=wc_pos_update_translations&security=' + nonce );
    stream.onmessage = function(e){
      if( e.data === 'complete' ){
        this.close();
        view.$('.modal-body .spinner').hide();
        view.$('.modal-footer').show();
      } else {
        view.$('.modal-body .spinner').before('<p>' + e.data + '</p>');
      }
    };
  }

});