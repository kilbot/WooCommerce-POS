var ReceiptView = require('lib/config/receipt-view');
var hbs = require('handlebars');

module.exports = ReceiptView.extend({

  tagName: 'iframe',

  template: function(){},

  onShow: function(){
    var template = hbs.compile( this.options.receipt_template ) ;
    this.window = this.el.contentWindow;
    this.window.document.write(template( this.data ));
  }

});