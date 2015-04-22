var View = require('lib/config/item-view');
var hbs = require('handlebars');
var Tmpl = require('./error.hbs');

module.exports = View.extend({
  template: hbs.compile(Tmpl),

  initialize: function(options){
    options = options || {};
    this.message = options.message;
    this.raw = options.raw;

    this.modal = {
      className: options.className,
      header: {
        title: options.title
      },
      footer: {
        buttons: [{
          action: 'close'
        }]
      }
    };
  },

  templateHelpers: function(){
    var data = {};
    data.message = this.message;
    data.raw = this.raw;
    return data;
  },

  ui: {
    raw: '*[data-action="raw"]',
    output: '.raw-output'
  },

  events: {
    'click @ui.raw': 'toggleRaw'
  },

  toggleRaw: function(e){
    e.preventDefault();
    this.ui.output.toggle();
  }

});