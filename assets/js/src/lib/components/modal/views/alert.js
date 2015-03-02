var View = require('lib/config/item-view');
var hbs = require('handlebars');

module.exports = View.extend({
  template: hbs.compile('' +
    '{{message}}' +
    '{{{raw}}}'
  ),

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
    }
  },

  templateHelpers: function(){
    var data = {};
    data.message = this.message;
    data.raw = this.raw;
    return data;
  }

});