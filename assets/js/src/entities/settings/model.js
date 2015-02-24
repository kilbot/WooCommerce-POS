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

    if(options.buttons){
      this.buttons(options);
    }

    // TODO: fix this
    model.unset('response');

    return DeepModel.prototype.sync(method, model, options);
  },

  // TODO: a more elegant way of updating buttons
  // one that does not stomp on original success/error
  buttons: function(options){
    options.buttons.triggerMethod('Update', { message: 'spinner' });
    options.success = function(model, resp){
      var result = 'success';
      if(resp.success){
        result = {
          type: 'success',
          text: resp.success
        };
      }
      options.buttons.triggerMethod('Update', { message: result });
    };
    options.error = function(jqxhr){
      var result = 'error';
      if(jqxhr.responseJSON && jqxhr.responseJSON.errors){
        result = {
          type: 'error',
          text: jqxhr.responseJSON.errors[0].message
        };
      }
      options.buttons.triggerMethod('Update', { message: result });
    };
  },

  parse: function (resp) {
    // ajax will return false if no option exists
    if(!resp){ resp = null; }
    return resp;
  }

});