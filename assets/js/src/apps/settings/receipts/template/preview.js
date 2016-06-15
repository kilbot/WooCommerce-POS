var ReceiptView = require('lib/config/receipt-view');
var hbs = require('handlebars');
// var App = require('lib/config/application');
var $ = require('jquery');

module.exports = ReceiptView.extend({

  tagName: 'iframe',

  template: function(){},

  onShow: function(){
    var template = hbs.compile( this.options.template_model.get('template') ) ;
    this.window = this.el.contentWindow;
    this.window.document.write(template( this.data ));
  },

  print: function(){
    var method = this.options.template_model.get('method');
    switch(method){
      case 'browser':
        this.browserPrint();
        break;
      case 'network':
        this.networkPrint();
        break;
      case 'qz-tray':
        this.qzTrayPrint();
        break;
    }
  },
  
  browserPrint: function(){
    this.el.contentWindow.print();
  },

  networkPrint: function(){
    $.ajax({
      type       : 'post',
      url        : this.options.template_model.get('network_address'),
      contentType: 'text/xml',
      data       : this.el,
      dataType   : 'xml',
      processData: false,
      beforeSend : function (xhr) {
        xhr.setRequestHeader('SOAPAction', '""');
      }
    });
  },

  qzTrayPrint: function(){

  }

});