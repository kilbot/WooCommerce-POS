var ReceiptView = require('lib/config/receipt-view');
var hbs = require('handlebars');

module.exports = ReceiptView.extend({

  /**
   * The template for display is different to the receipt data
   */
  template: function(){
    return '<p style="margin:1em">No preview available</p>';
  },

  getData: function(){
    if(!this._receipt){
      var template = hbs.compile( this.getReceiptTemplate() );
      this._receipt = template( this.data );
    }
    return this._receipt;
  }

});