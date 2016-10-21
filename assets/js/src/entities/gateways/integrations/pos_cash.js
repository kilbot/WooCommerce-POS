var polyglot = require('lib/utilities/polyglot');
var Utils = require('lib/utilities/utils');

var setMessage = function(order, tendered){
  order.set({
    'payment_details.message': polyglot.t('titles.change') + ': ' +
      Utils.formatMoney(tendered - order.get('total'))
  });
};

/**
 * Cash Integration
 *
 */

module.exports = {

  /**
   *
   */
  onShow: function(view){
    var order = view.model.collection.order;
    var tendered = order.get('payment_details.pos-cash-tendered');

    // init with message
    if(tendered){
      setMessage(order, tendered);
    }

    // listen for changes
    view.listenTo(order, 'change:payment_details.pos-cash-tendered', setMessage);

    //
    if(window.Modernizr.touch){
     view.$('#pos-cash-tendered').attr('readonly', true);
    }
  },

  /**
   *
   */
  onDestroy: function(view){
    view.model.collection.order.set({'payment_details.message':''});
  }

};