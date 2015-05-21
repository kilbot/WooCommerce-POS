var POS = require('lib/utilities/global');
var Router = require('lib/config/router');
var LayoutView = require('./layout');
var ReceiptRoute = require('./receipt/route');
var Radio = require('backbone.radio');
//var bb = require('backbone');

var PrintRouter = Router.extend({
  routes: {
    'print(/:id)(/)' : 'showReceipt'
  },

  initialize: function(options) {
    this.container = options.container;
  },

  onBeforeEnter: function() {
    this.layout = new LayoutView();
    this.container.show(this.layout);
  },

  onBeforeRoute: function(){
    this.showActions();
  },

  showReceipt: function(){
    return new ReceiptRoute({
      container: this.layout.getRegion('iframe')
    });
  },

  showActions: function(){
    var buttons = Radio.request('buttons', 'view', {
      buttons: [{
        action: 'print',
        className: 'btn-success'
      }]
    });

    this.listenTo(buttons, 'action:print', function(){
      this.layout.getRegion('iframe').currentView.print();
    });

    this.layout.getRegion('actions').show(buttons);
  }

});

module.exports = PrintRouter;
POS.attach('Print.Router', PrintRouter);