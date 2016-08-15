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
  'qz-tray': require('./methods/qz-tray')
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
    this.fetchTemplates();
  },

  /**
   * todo: store templates like other data, fetch on app start
   */
  fetchTemplates: function(){
    return this.templates.fetch({
      data: {
        filter: {
          limit: 1,
          type: 'receipt'
        }
      }
    });
  },

  /**
   * Call to API to get receipt template data
   * - todo: consistent handling of templates
   */
  fetchReceiptTemplate: function(){
    var self = this;

    if(this.templates.isNew()){
      return self.fetchTemplates()
      .then(function(){
        return self.templates.first();
      });
    }

    return Promise.resolve( this.templates.first() );
  },

  /**
   * returns view, used for print previews
   */
  view: function(options){
    options = options || {};

    return this.fetchReceiptTemplate()
      .then(function(receipt){
        var View = views[receipt.get('type')] || views['html'];
        var view = new View({
          model: options.model,
          _template: receipt.get('template')
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
        return view.print();
      });
  }
});