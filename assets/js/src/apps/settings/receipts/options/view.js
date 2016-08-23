var SettingsView = require('lib/config/settings-view');
var App = require('lib/config/application');

var View = SettingsView.extend({

  ui: {
    networkAddress: '#network-options',
    qzTrayOptions : '#qz-tray-options',
    fileOptions : '#file-options'
  },

  modelEvents: {
    'change:print_method': 'maybeShowMethodExtras'
  },

  onShow: function(){
    this.maybeShowMethodExtras( this, this.model.get('print_method') );
  },

  maybeShowMethodExtras: function( view, value ){
    this.ui.networkAddress.toggle( value === 'network' );
    this.ui.qzTrayOptions.toggle( value === 'qz-tray' );
    this.ui.fileOptions.toggle( value === 'file' );
  }

});

module.exports = View;
App.prototype.set('SettingsApp.Receipt.Options.View');