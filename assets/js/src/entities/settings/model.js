var DeepModel = require('lib/config/deep-model');
var Radio = require('backbone').Radio;
var _ = require('lodash');

module.exports = DeepModel.extend({

  initialize: function() {
    this._saving = false;
  },

  sync: function (method, model, options) {
    var url = Radio.request('entities', 'get', {
      type: 'option',
      name: 'ajaxurl'
    });

    var nonce = Radio.request('entities', 'get', {
      type: 'option',
      name: 'nonce'
    });

    var id       = 'id=' + model.get('id'),
        action   = 'action=wc_pos_admin_settings',
        security = 'security=' + nonce;

    options.emulateHTTP = true;
    options.url = url + '?' + action + '&' + id + '&' + security;

    var methods = {
      beforeSend: function(){
        this.trigger('update:start');
        this._saving = true;
      },
      complete: function() {
        this.trigger('update:stop');
        this._saving = false;
      }
    };

    if( !this._saving && method === 'update' ) {
      _.defaults( options, {
        beforeSend: _.bind(methods.beforeSend, model),
        complete:	_.bind(methods.complete, model)
      });
    }

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