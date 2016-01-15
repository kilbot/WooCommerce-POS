var SettingsView = require('lib/config/settings-view');
var App = require('lib/config/application');

var View = SettingsView.extend({

  ui: {
    networkAddress: '#network_printer_address'
  },

  modelEvents: {
    'change:print_method': 'maybeShowNetworkAddress'
  },

  onShow: function(){
    this.maybeShowNetworkAddress( this, this.model.get('print_method') );
  },

  maybeShowNetworkAddress: function( view, value ){
    this.ui.networkAddress.toggle( value === 'network' );
  }

});

module.exports = View;
App.prototype.set('SettingsApp.Receipt.Options.View');