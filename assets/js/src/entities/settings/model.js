var DeepModel = require('lib/config/deep-model');
var Radio = require('backbone.radio');
var polyglot = require('lib/utilities/polyglot');

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

      // code 405 = not allowed HTTP methods
      if( jqxhr.status && jqxhr.status === 405 ){
        message = polyglot.t('messages.legacy') +
            '. <a href="#tools">' + polyglot.t('buttons.legacy') + '</a>.';
      }

      // other errors
      if( !message && jqxhr.responseJSON && jqxhr.responseJSON.errors ){
        message = jqxhr.responseJSON.errors[0].message;
      }
      btn.trigger('state', ['error', message]);
    };
  },

  /**
   * Override destroy to restore data
   * @param options
   * @returns {*}
   */
  destroy: function(options){
    var self = this;
    return this.sync('delete', this, options)
      .then(function(data){
        data.id = self.id;
        self.clear({ silent: true }).set(data);
      });
  }

});