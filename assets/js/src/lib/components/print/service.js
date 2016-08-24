var Service = require('lib/config/service');
var Radio = require('backbone.radio');

var views = {
  html: require('./views/html'),
  escp: require('./views/escp'),
  'epos-print': require('./views/epos-print')
};

var methods = {
  browser: require('./methods/browser'),
  network: require('./methods/network'),
  'qz-tray': require('./methods/qz-tray'),
  'file': require('./methods/file')
};

module.exports = Service.extend({
  channelName: 'print',

  initialize: function () {
    this.channel.reply({
      'view': this.view,
      'receipt': this.receipt
    }, this);
  },

  onStart: function(){
    this.templates = Radio.request('entities', 'get', {
      name: 'templates',
      type: 'collection'
    });
    // preload template
    this.templates.fetchReceiptTemplate();
  },

  /**
   * returns view, used for print previews
   */
  view: function(options){
    options = options || {};

    return this.templates.fetchReceiptTemplate()
      .then(function(receipt){
        var View = views[receipt.get('type')] || views['html'];
        var view = new View({
          model: options.model,
          receipt: receipt
        });

        // decorate view with print method
        var method = methods[receipt.get('method')] || methods['browser'];
        return method(view);
      });
  },

  /**
   * creates view and triggers print
   */
  receipt: function (options) {
    options = options || {};

    return this.view(options)
      .then(function(view){
        view.render();
        return view.print();
      });
  }
});