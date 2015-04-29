var DeepModel = require('lib/config/deep-model');
var Radio = require('backbone.radio');

module.exports = DeepModel.extend({

  initialize: function() {
    this.url = Radio.request('entities', 'get', {
      type: 'option',
      name: 'ajaxurl'
    });
  },

  sync: function (method, model, options) {
    var nonce = Radio.request('entities', 'get', {
      type: 'option',
      name: 'nonce'
    });

    var id       = 'id=' + model.get('id'),
        action   = 'action=wc_pos_admin_settings',
        security = 'security=' + nonce;

    //options.emulateHTTP = true;
    options.url = this.url + '?' + action + '&' + id + '&' + security;

    // TODO: fix this
    model.unset('response');

    return DeepModel.prototype.sync(method, model, options);
  },

  parse: function (resp) {
    // ajax will return false if no option exists
    if(!resp){ resp = null; }
    return resp;
  }

});