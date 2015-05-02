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

    // button state
    if(options.buttons){
      this.updateButtonState(options);
    }

    return DeepModel.prototype.sync(method, model, options);
  },

  parse: function (resp) {
    // ajax will return false if no option exists
    if(!resp){ resp = null; }
    return resp;
  },

  updateButtonState: function(options){
    var success = options.success,
        error = options.error,
        btn = options.buttons;

    btn.trigger('state', [ 'loading', '' ]);

    options.success = function(model, resp, options){
      if( success ) { success(model, resp, options); }
      btn.trigger('state', [ 'success', null ]);
    };

    options.error = function(jqxhr, textStatus, errorThrown){
      if( error ) { error(jqxhr, textStatus, errorThrown); }
      var message = null;
      if(jqxhr.responseJSON && jqxhr.responseJSON.errors){
        message = jqxhr.responseJSON.errors[0].message;
      }
      btn.trigger('state', ['error', message]);
    };
  }

});