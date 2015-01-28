var Model = require('./model');
var POS = require('lib/utilities/global');

module.exports = POS.DualModel = Model.extend({
  idAttribute: 'local_id',
  remoteIdAttribute: 'id',
  fields: ['title'],
  parse: function (resp) {
    return resp[this.name] ? resp[this.name] : resp ;
  },

  states: {
    SYNCHRONIZED: 'SYNCHRONIZED',
    SYNCHRONIZING: 'SYNCHRONIZING',
    UPDATE_FAILED: 'UPDATE_FAILED',
    CREATE_FAILED: 'CREATE_FAILED',
    DELETE_FAILED: 'DELETE_FAILED'
  },

  hasRemoteId: function() {
    return !!this.get(this.remoteIdAttribute);
  },

  getUrlForSync: function(urlRoot, method) {
    var remoteId;
    remoteId = this.get(this.remoteIdAttribute);
    if (remoteId && (method === 'update' || method === 'delete')) {
      return "" + urlRoot + "/" + remoteId + "/";
    }
    return urlRoot;
  },

  isInSynchronizing: function() {
    return this.get('status') === this.states.SYNCHRONIZING;
  },

  isDelayed: function() {
    var _ref;
    return (_ref = this.get('status')) === this.states.DELETE_FAILED || _ref === this.states.UPDATE_FAILED || _ref === this.states.CREATE_FAILED;
  }

});