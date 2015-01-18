var Model = require('lib/config/model');
var bb = require('backbone');
var entitiesChannel = bb.Radio.channel('entities');
var _ = require('lodash');

module.exports = Model.extend({
  initialize: function() {
    this.url = entitiesChannel.request('get', {
      type: 'option',
      name: 'ajaxurl'
    });
    this._saving = false;
  },
  sync: function (method, model, options) {
    var id       = 'id=' + model.get('id'),
      action   = 'action=wc_pos_admin_settings';

    options.emulateHTTP = true;
    options.url = model.url + '?' + action + '&' + id;

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

    return bb.sync(method, model, options);
  }
});