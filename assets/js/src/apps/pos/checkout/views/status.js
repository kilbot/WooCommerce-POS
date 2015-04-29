var ItemView = require('lib/config/item-view');
var POS = require('lib/utilities/global');
var hbs = require('handlebars');
//var $ = require('jquery');
var polyglot = require('lib/utilities/polyglot');

var View = ItemView.extend({
  tagName: 'h4',

  initialize: function(){
    var status = polyglot.t('titles.to-pay');
    this.template = hbs.compile( status + ': {{{money total}}}' );
  },

  modelEvents: {
    'change:status': 'onStatusChange'
  },

  onStatusChange: function(model, status){
    this.$el.addClass(status);
  }

});

module.exports = View;
POS.attach('POSApp.Checkout.Views.Status', View);