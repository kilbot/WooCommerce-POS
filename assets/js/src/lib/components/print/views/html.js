var ReceiptView = require('lib/config/receipt-view');
var hbs = require('handlebars');

module.exports = ReceiptView.extend({

  tagName: 'iframe',

  template: function(){},

  onShow: function(){
    var template = hbs.compile( this.options._template );
    this.el.contentWindow.document.write(template( this.data ));
  },

  getData: function(){
    return this.$el.contents().find('html').html();
    // return this.$el.contents().contents().html();
  }

});