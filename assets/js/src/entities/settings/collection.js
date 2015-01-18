var Collection = require('lib/config/collection');
var bb = require('backbone');
var entitiesChannel = bb.Radio('entities');
var $ = require('jquery');

// Data from wpdb->usermeta
module.exports = Collection.extend({

  initialize: function( models, options ) {
    this.id = options.id;
  },

  save: function () {
    var data = this.toJSON();
    var payload = {
      id: this.id,
      action: 'wc_pos_user_settings',
      data: data[0]
    };

    $.post(
      entitiesChannel.request('get', { option: 'ajaxurl'}),
      payload,
      function( response ) {
        console.log(response);
      }
    );
  }

});