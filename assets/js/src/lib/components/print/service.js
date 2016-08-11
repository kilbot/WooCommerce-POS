var Service = require('lib/config/service');
var Radio = require('backbone.radio');
var HTML = require('./views/html');
var ESCP = require('./views/escp');
var ePOS = require('./views/epos-print');

module.exports = Service.extend({
  channelName: 'print',

  initialize: function () {
    this.channel.reply({
      'receipt': this.receipt
    }, this);
  },

  onStart: function(){
    this.fetchReceiptTemplates();
  },

  /**
   * Call to API to get receipt template data\
   * - todo: consistent handling of templates
   */
  fetchReceiptTemplates: function(){
    var self = this;
    var templates = Radio.request('entities', 'get', {
      name: 'templates',
      type: 'collection'
    });

    templates.fetch({
      data: {
        filter: {
          limit: 1,
          type: 'receipt'
        }
      }
    })
    .then(function(){
      self.template_model = templates.first();
    });
  },

  receipt: function (options) {
    options = options || {};
    var View;

    switch(this.template_model.get('type')) {
      case 'epos-print':
        View = ePOS;
        break;
      case 'escp':
        View = ESCP;
        break;
      default:
        View = HTML;
    }

    return new View({
      model: options.order,
      _template: this.template_model.get('template')
    });
  }
});