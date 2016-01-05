var DeepModel = require('lib/config/deep-model');
//var Radio = require('backbone.radio');
//var polyglot = require('lib/utilities/polyglot');

module.exports = DeepModel.extend({

  //updateButtonState: function(options){
  //  var success = options.success,
  //      error = options.error,
  //      btn = options.buttons;
  //
  //  btn.trigger('state', [ 'loading', '' ]);
  //
  //  options.success = function(model, resp, options){
  //    if( success ) { success(model, resp, options); }
  //    btn.trigger('state', [ 'success', null ]);
  //  };
  //
  //  options.error = function(jqxhr, textStatus, errorThrown){
  //    if( error ) { error(jqxhr, textStatus, errorThrown); }
  //    var message = null;
  //
  //    // code 405 = not allowed HTTP methods
  //    if( jqxhr.status && jqxhr.status === 405 ){
  //      message = polyglot.t('messages.legacy') +
  //          '. <a href="#tools">' + polyglot.t('buttons.legacy') + '</a>.';
  //    }
  //
  //    // other errors
  //    if( !message && jqxhr.responseJSON && jqxhr.responseJSON.errors ){
  //      message = jqxhr.responseJSON.errors[0].message;
  //    }
  //    btn.trigger('state', ['error', message]);
  //  };
  //}

});